import { Linter } from '@nx/linter';

export interface FunctionGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
  linter?: Linter;
  babelJest?: boolean;
  skipFormat?: boolean;
  unitTestRunner?: 'jest' | 'none';
}
