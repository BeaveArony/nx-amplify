import { Tree, updateJson } from '@nrwl/devkit';
import { NormalizedSchema } from './normalized-schema';

/** Adjust the main handler in the CloudFormation file */
export function updateCloudformationJson(
  host: Tree,
  options: NormalizedSchema
) {
  updateJson(
    host,
    `${options.amplifyFunctionPath}/${options.name}-cloudformation-template.json`,
    (json) => {
      json.Resources.LambdaFunction.Properties.Handler = 'main.handler';
      json.Resources.LambdaFunction.Properties.Runtime = 'nodejs18.x';
      json.Resources.LambdaFunction.Properties.MemorySize = 128;
      json.Resources.LambdaFunction.Properties.Timeout = 15;
      json.Resources.LambdaFunction.Properties.Architectures = ['arm64'];
      return json;
    }
  );
}
