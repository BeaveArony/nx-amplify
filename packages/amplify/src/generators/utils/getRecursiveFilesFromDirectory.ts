import * as fs from 'fs';
import * as path from 'path';

export function getRecursiveFilesFromDirectory(dir: string) {
  const files = [];
  function readDirectory(directory: string) {
    fs.readdirSync(directory).forEach((file) => {
      const absPath = path.join(directory, file);
      if (fs.statSync(absPath).isDirectory()) {
        return readDirectory(absPath);
      }
      return files.push(absPath);
    });
  }
  readDirectory(dir);
  return files;
}
