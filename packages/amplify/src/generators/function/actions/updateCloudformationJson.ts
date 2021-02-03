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
      return json;
    }
  );
}
