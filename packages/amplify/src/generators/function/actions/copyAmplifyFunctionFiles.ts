import { Tree } from '@nx/devkit';
import * as path from 'path';
import { getRecursiveFilesFromDirectory } from '../../utils/getRecursiveFilesFromDirectory';
import { NormalizedSchema } from './normalized-schema';

export function copyAmplifyFunctionFiles(
  host: Tree,
  options: NormalizedSchema
) {
  const src = `${options.amplifyFunctionPath}/src`;
  const files = getRecursiveFilesFromDirectory(src);
  files.forEach((filePath) => {
    const appPath = path.normalize(`${options.projectRoot}/src/app`);
    const baseName = path.basename(filePath);
    const extName = path.extname(filePath);

    if (extName === '.js') {
      // Change import and export  notation before converting to *.ts
      let content = host.read(filePath).toString('utf-8');
      content = content.replace(
        /module\.exports\s*=\s*([a-zA-Z0-9]*)/g,
        'export = $1'
      );
      content = content.replace(
        /exports\.handler/g,
        `import { Handler } from './types';
        // import type { AmplifyGraphQlResolverHandler } from 'aws-lambda';

        // export const handler: AmplifyGraphQlResolverHandler
        export const handler: AmplifyGraphQlResolverHandler`
      );
      content = content.replace(
        /(?:const|let|var)\s+([a-zA-Z0-9]*)\s*=\s*(require\(.*\).*)/g,
        'import $1 = $2'
      );
      const targetFilePath = path.normalize(
        `${appPath}/${baseName.replace(/\.js$/g, '.ts')}`
      );
      host.write(targetFilePath, content);
    }

    if (baseName === 'package.json') {
      let content = host.read(filePath).toString('utf-8');
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
