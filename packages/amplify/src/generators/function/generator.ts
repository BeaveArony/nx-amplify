import { formatFiles, Tree } from '@nrwl/devkit';
import { applicationGenerator } from '@nrwl/node';
import { addFiles } from './actions/addFiles';
import { copyAmplifyFunctionFiles } from './actions/copyAmplifyFunctionFiles';
import { normalizeOptions } from './actions/normalizeOptions';
import { FunctionGeneratorSchema } from './schema';
import { updateCloudformationJson } from './actions/updateCloudformationJson';
import { updateGitIgnore } from './actions/updateGitIgnore';
import { updatePackageJson } from './actions/updatePackageJson';
import { updateWorkspaceJson } from './actions/updateWorkspaceJson';
import { updateAmplifyStateJson } from './actions/updateAmplifyStateJson';

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

  copyAmplifyFunctionFiles(host, normalizedOptions);

  // change various files
  updatePackageJson(host, normalizedOptions);
  updateWorkspaceJson(host, normalizedOptions);
  updateCloudformationJson(host, normalizedOptions);
  updateAmplifyStateJson(host, normalizedOptions);
  updateGitIgnore(host, normalizedOptions);

  await formatFiles(host);
}
