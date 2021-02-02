import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  readProjectConfiguration,
  Tree,
  updateJson,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { applicationGenerator } from '@nrwl/node';
import * as fs from 'fs';
import * as path from 'path';
import { FunctionGeneratorSchema } from './schema';

interface NormalizedSchema extends FunctionGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
  importPath: string;
  amplifyFunctionPath: string;
}

function normalizeOptions(
  host: Tree,
  options: FunctionGeneratorSchema
): NormalizedSchema {
  const { appsDir, npmScope } = getWorkspaceLayout(host);
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  const importPath = `@${npmScope}/${projectName}`;
  const amplifyFunctionPath = `amplify/backend/function/${options.name}`;

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    importPath,
    amplifyFunctionPath,
  };
}

function addFiles(host: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    host,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

function getRecursiveFilesFromDirectory(dir: string) {
  const files = [];
  function readDirectory(directory: string) {
    fs.readdirSync(directory).forEach((file) => {
      const absPath = path.join(directory, file);
      if (fs.statSync(absPath).isDirectory()) {
        return readDirectory(absPath);
      }
      return files.push(absPath);
    });
  }
  readDirectory(dir);
  return files;
}

function copyAmplifyFunctionFiles(tree: Tree, options: NormalizedSchema) {
  const src = `${options.amplifyFunctionPath}/src`;
  const files = getRecursiveFilesFromDirectory(src);
  files.forEach((filePath) => {
    const appPath = path.normalize(`${options.projectRoot}/src/app`);
    const baseName = path.basename(filePath);
    const extName = path.extname(filePath);

    if (extName === '.js') {
      // Change import and export  notation before converting to *.ts
      let content = tree.read(filePath).toString('utf-8');
      content = content.replace(
        /module\.exports\s*=\s*([a-zA-Z0-9]*)/g,
        'export = $1'
      );
      content = content.replace(
        /exports\.handler/g,
        `import { Handler } from './aws-lambda-handler';

        export const handler: Handler<any,unknown>`
      );
      content = content.replace(
        /(?:const|let|var)\s+([a-zA-Z0-9]*)\s*=\s*(require\(.*\).*)/g,
        'import $1 = $2'
      );
      const targetFilePath = path.normalize(
        `${appPath}/${baseName.replace(/\.js$/g, '.ts')}`
      );
      tree.write(targetFilePath, content);
    }

    if (baseName === 'package.json') {
      let content = tree.read(filePath).toString('utf-8');
      const json = JSON.parse(content);
      // If there are dependencies, add the appropriate @types packages
      if (json.dependencies) {
        json.devDependencies = {
          ...json.devDependencies,
          ...Object.keys(json.dependencies).reduce(
            (sum, key) => ({
              ...sum,
              [`@types/${key}`]: 'latest',
            }),
            {}
          ),
        };
      }
      json.name = options.importPath ?? json.name;
      content = JSON.stringify(json, null, 2);
    }
  });
}

/** Add scripts to package.json to build and debug the Lambda function */
function updatePackageJson(tree: Tree, options: NormalizedSchema) {
  updateJson(tree, 'package.json', (json) => {
    const { name, projectName: pName, amplifyFunctionPath: fnPath } = options;
    json.scripts = {
      ...json.scripts,
      [`amplify:${name}`]: `rm -rf ${fnPath}/src && nx run ${pName}:build:production && cd ${fnPath}/src && npm i`,
      [`run:${name}`]: `cd ${fnPath}/src && node -e "require('./main').handler(require('./event.json')).then(r => console.log('${name} result: ',r));"`,
    };
    return json;
  });
}

/** Adjust the main handler in the CloudFormation file */
function updateCloudformationJson(tree: Tree, options: NormalizedSchema) {
  updateJson(
    tree,
    `${options.amplifyFunctionPath}/${options.name}-cloudformation-template.json`,
    (json) => {
      json.Resources.LambdaFunction.Properties.Handler = 'main.handler';
      return json;
    }
  );
}

function updateWorkspaceJson(tree: Tree, options: NormalizedSchema) {
  const projectConfig = readProjectConfiguration(tree, options.projectName);
  projectConfig.targets.build.options.outputPath = `${options.amplifyFunctionPath}/src`;
  projectConfig.targets.build.options.externalDependencies = [
    'aws-sdk',
    'aws-lambda',
  ];
  projectConfig.targets.build.configurations.production.extractLicenses = false;
  projectConfig.targets.build.configurations.production.sourceMap = false;
  projectConfig.targets.build.configurations.production.buildOptimizer = true;
  projectConfig.targets.build.options.assets = [
    ...projectConfig.targets.build.options.assets,
    `${options.projectRoot}/src/package.json`,
  ];

  updateProjectConfiguration(tree, options.projectName, projectConfig);
}

export default async function (host: Tree, options: FunctionGeneratorSchema) {
  const normalizedOptions = normalizeOptions(host, options);

  // Generate @nrwl/node app
  await applicationGenerator(host, {
    name: normalizedOptions.name,
    directory: normalizedOptions.directory,
    tags: normalizedOptions.tags,
    linter: normalizedOptions.linter,
    babelJest: normalizedOptions.babelJest,
    skipFormat: normalizedOptions.skipFormat,
    unitTestRunner: normalizedOptions.unitTestRunner,
  });

  // add template files
  addFiles(host, normalizedOptions);
  console.warn('generator', { host, normalizedOptions });

  copyAmplifyFunctionFiles(host, normalizedOptions);
  updatePackageJson(host, normalizedOptions);
  updateWorkspaceJson(host, normalizedOptions);
  updateCloudformationJson(host, normalizedOptions);
  await formatFiles(host);
}
