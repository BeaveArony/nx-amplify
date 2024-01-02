import {
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { NormalizedSchema } from './normalized-schema';

export function updateWorkspaceJson(host: Tree, options: NormalizedSchema) {
  const projectConfig = readProjectConfiguration(host, options.projectName);
  projectConfig.targets.build.options.outputPath = `${options.amplifyFunctionPath}/src`;
  projectConfig.targets.build.configurations.production.extractLicenses = false;
  projectConfig.targets.build.configurations.production.sourceMap = false;
  projectConfig.targets.build.configurations.production.buildOptimizer = true;
  projectConfig.targets.build.options.assets = [
    ...projectConfig.targets.build.options.assets,
    `${options.projectRoot}/src/package.json`,
  ];
  projectConfig.targets.build.options.externalDependencies = [
    ...(projectConfig.targets.build.options.externalDependencies ?? []),
    '@aws-sdk',
    '@aws-lambda',
  ];

  updateProjectConfiguration(host, options.projectName, projectConfig);
}
