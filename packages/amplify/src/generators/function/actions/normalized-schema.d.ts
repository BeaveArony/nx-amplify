import { FunctionGeneratorSchema } from '../schema';

export interface NormalizedSchema extends FunctionGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
  importPath: string;
  amplifyFunctionPath: string;
}
