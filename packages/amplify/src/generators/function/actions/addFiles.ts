import { generateFiles, names, offsetFromRoot, Tree } from '@nrwl/devkit';
import * as path from 'path';
import { NormalizedSchema } from './normalized-schema';

export function addFiles(host: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    host,
    path.join(__dirname, '..', 'files'),
    options.projectRoot,
    templateOptions
  );
}
