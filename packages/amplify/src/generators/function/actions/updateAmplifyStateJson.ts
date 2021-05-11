import { Tree, updateJson } from '@nrwl/devkit';
import { NormalizedSchema } from './normalized-schema';

/** Adjust the main handler in the amplify.state file */
export function updateAmplifyStateJson(host: Tree, options: NormalizedSchema) {
  updateJson(host, `${options.amplifyFunctionPath}/amplify.state`, (json) => {
    json.defaultEditorFile = 'src/main.js';
    return json;
  });
}
