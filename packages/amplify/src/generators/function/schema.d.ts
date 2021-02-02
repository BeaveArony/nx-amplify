export interface FunctionGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
  linter?: 'eslint' | 'tslint';
  babelJest?: boolean;
  skipFormat?: boolean;
  unitTestRunner?: 'jest' | 'none';
}
