import { addDependenciesToPackageJson, Tree, updateJson } from '@nrwl/devkit';
import { NormalizedSchema } from './normalized-schema';

/** Add scripts to package.json to build and debug the Lambda function */
export function updatePackageJson(host: Tree, options: NormalizedSchema) {
  updateJson(host, 'package.json', (json) => {
    const { name, projectName: pName, amplifyFunctionPath: fnPath } = options;
    json.scripts = {
      ...json.scripts,
      [`amplify:${name}`]: `rm -rf ${fnPath}/src && nx run ${pName}:build:production && cd ${fnPath}/src && npm i`,
      [`run:${name}`]: `cd ${fnPath}/src && node -e "require('./main').handler(require('./event.json')).then(r => console.log('${name} result: ',r));"`,
    };
    return json;
  });
  addDependenciesToPackageJson(
    host,
    {},
    {
      // Add to devDependencies, since it is provided by Lambda in run-time
      'aws-lambda': 'latest',
      '@types/aws-sdk': 'latest',
      '@types/aws-lambda': 'latest',
    }
  );
}
