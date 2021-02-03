import { names } from '@nrwl/devkit';
import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  tmpProjPath,
  uniq,
  renameFile,
  listFiles,
  readFile,
} from '@nrwl/nx-plugin/testing';
import { copySync } from 'fs-extra';
import * as path from 'path';

describe('amplify e2e', () => {
  it('should create amplify nodejs typescript function', async (done) => {
    const plugin = uniq('amplifyFunction');
    const defaultDir = 'functions';
    ensureNxProject('@mgustmann/amplify', 'dist/packages/amplify');
    copyAmplifyDirectory(plugin);
    await runNxCommandAsync(`generate @mgustmann/amplify:function ${plugin}`);

    const result = await runNxCommandAsync(
      `build ${defaultDir}-${names(plugin).fileName}`
    );
    expect(result.stdout).toContain('Built at');

    done();
  });

  describe('--directory', () => {
    it('should create src in the specified directory', async (done) => {
      const plugin = uniq('amplify');
      ensureNxProject('@mgustmann/amplify', 'dist/packages/amplify');
      copyAmplifyDirectory(plugin);
      await runNxCommandAsync(
        `generate @mgustmann/amplify:function ${plugin} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`apps/subdir/${plugin}/src/main.ts`)
      ).not.toThrow();
      done();
    });
  });

  describe('--tags', () => {
    it('should add tags to nx.json', async (done) => {
      const plugin = uniq('amplify');
      ensureNxProject('@mgustmann/amplify', 'dist/packages/amplify');
      copyAmplifyDirectory(plugin);
      await runNxCommandAsync(
        `generate @mgustmann/amplify:function ${plugin} --tags e2etag,e2ePackage`
      );
      const nxJson = readJson('nx.json');
      expect(nxJson.projects[`functions-${plugin}`].tags).toEqual([
        'e2etag',
        'e2ePackage',
      ]);
      done();
    });
  });
  describe('files', () => {
    const name = uniq('amplify');

    beforeAll(async () => {
      ensureNxProject('@mgustmann/amplify', 'dist/packages/amplify');
      copyAmplifyDirectory(name);
      await runNxCommandAsync(`generate @mgustmann/amplify:function ${name}`);
    });

    it('should point to main in CloudFormation json', async (done) => {
      const cfnJson = readJson(
        `amplify/backend/function/${name}/${name}-cloudformation-template.json`
      );
      expect(cfnJson.Resources.LambdaFunction.Properties.Handler).toEqual(
        'main.handler'
      );
      done();
    });

    it('should add scripts to root package.json', async (done) => {
      const packageJson = readJson(`package.json`);
      const scriptNames = Object.keys(packageJson.scripts);
      expect(scriptNames.includes(`amplify:${name}`)).toBeTruthy();
      expect(scriptNames.includes(`run:${name}`)).toBeTruthy();
      done();
    });

    it('should add @types packages to root package.json', async (done) => {
      const packageJson = readJson(`package.json`);
      const deps = Object.keys(packageJson.devDependencies);
      expect(deps.includes(`@types/aws-lambda`)).toBeTruthy();
      expect(deps.includes(`@types/aws-sdk`)).toBeTruthy();
      done();
    });

    it('should rename .js to .ts', async (done) => {
      expect(() =>
        checkFilesExist(`apps/functions/${name}/src/main.ts`)
      ).not.toThrow();

      const files = listFiles(`apps/functions/${name}/src/app`);
      files.forEach((file) => {
        expect(file.endsWith('.js')).toBeFalsy();
      });
      done();
    });

    it('should add app package.json', async (done) => {
      expect(() =>
        checkFilesExist(`apps/functions/${name}/src/package.json`)
      ).not.toThrow();
      const packageJson = readJson(`apps/functions/${name}/src/package.json`);
      expect(packageJson.name).toEqual(`@proj/functions-${name}`);
      done();
    });

    it('should add function/src to .gitignore file', async (done) => {
      const gitIgnoreFile = readFile(`.gitignore`);
      expect(gitIgnoreFile.includes(`${name}/src/*`)).toBeTruthy();
      done();
    });
  });
});

function copyAmplifyDirectory(name: string) {
  copySync(path.join(__dirname, '..', 'amplify'), `${tmpProjPath()}/amplify`);
  renameFile(
    `amplify/backend/function/myFunction/myFunction-cloudformation-template.json`,
    `amplify/backend/function/myFunction/${name}-cloudformation-template.json`
  );
  renameFile(
    `amplify/backend/function/myFunction`,
    `amplify/backend/function/${name}`
  );
}
