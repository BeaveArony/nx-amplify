import { Tree } from '@nx/devkit';
import { NormalizedSchema } from './normalized-schema';

export function updateGitIgnore(host: Tree, options: NormalizedSchema) {
  let gitIgnoreFile = host.read('.gitignore')?.toString('utf-8');
  if (gitIgnoreFile) {
    gitIgnoreFile = `${gitIgnoreFile}
# ${options.projectName}
${options.amplifyFunctionPath}/src/*
!${options.amplifyFunctionPath}/src/.gitkeep
${options.projectRoot}/**/*event.json
`;
    host.write('.gitignore', gitIgnoreFile);
  } else {
    console.warn(`Couldn't find .gitignore file to update`);
  }
}
