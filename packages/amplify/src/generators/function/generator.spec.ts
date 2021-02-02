import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration, readJson } from '@nrwl/devkit';

import generator from './generator';
import { FunctionGeneratorSchema } from './schema';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('function generator', () => {
  let appTree: Tree;
  const options: FunctionGeneratorSchema = {
    name: 'test',
    directory: 'functions',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    appTree.write('/amplify/backend/function/test/index.js', 'blah');
    const workspaceJson = readJson(appTree, 'workspace.json');
    console.warn('appTree', { appTree, workspaceJson });
    await generator(appTree, options);
    const config = readJson(appTree, 'workspace.json');
    console.warn('appTree', { appTree, config });
    // const config = readProjectConfiguration(appTree, 'test');
    // expect(config).toBeDefined();
  });
});
