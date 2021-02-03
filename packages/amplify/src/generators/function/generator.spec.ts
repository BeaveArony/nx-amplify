import { readJson, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import generator from './generator';
import { FunctionGeneratorSchema } from './schema';

describe('function generator', () => {
  let appTree: Tree;
  const options: FunctionGeneratorSchema = {
    name: 'test',
    directory: 'functions',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it.skip('should run successfully', async () => {
    // Currently this does not work, see https://github.com/nrwl/nx/issues/4538
    await generator(appTree, options);
    const workspaceJson = readJson(appTree, 'workspace.json');
    expect(workspaceJson).toBeDefined();
  });
});
