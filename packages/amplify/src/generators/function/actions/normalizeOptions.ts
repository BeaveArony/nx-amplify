import { getWorkspaceLayout, names, Tree } from '@nx/devkit';
import { NormalizedSchema } from './normalized-schema';
import { FunctionGeneratorSchema } from '../schema';

export function normalizeOptions(
  host: Tree,
  options: FunctionGeneratorSchema
): NormalizedSchema {
  const { appsDir, npmScope } = getWorkspaceLayout(host);
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  const importPath = `@${npmScope}/${projectName}`;
  const amplifyFunctionPath = `amplify/backend/function/${options.name}`;

  const normalizedOpts = {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    importPath,
    amplifyFunctionPath,
  };
  console.warn('Normalized Options', normalizedOpts);
  return normalizedOpts;
}
