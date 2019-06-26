const copyDir = require('copy-dir');
import * as fs from 'fs';
import * as glob from 'glob';

export interface IKeyValuePair {
  variable: string;
  value: string;
}

export interface ICopyFolderOptions {
  replaceVariables?: IKeyValuePair[];
}

export type copyFolderType = (source: string, destination: string, options?: ICopyFolderOptions) => Promise<void>;

function renameFileWithVariables(path: string, variables: IKeyValuePair[] | undefined): string {
  if (!path.includes('{') || !path.includes('}')) { return path; }
  if (!variables) { return path; }

  let newPath = path;
  variables.forEach((r) => {
    newPath = newPath.replace(`{${r.variable}}`, r.value);
  });

  fs.renameSync(path, newPath);

  return newPath;
}

function replaceFileContents(path: string, variables: IKeyValuePair[] | undefined) {
  if (!variables) { return; }
  const details = fs.statSync(path);
  if (details.isDirectory()) { return; }

  let contents = fs.readFileSync(path).toString();
  variables.forEach((r) => {
    const matches = new RegExp(`{${r.variable}}`, 'g');
    contents = contents.replace(matches, r.value);
  });

  fs.writeFileSync(path, contents);
}

export async function copyFolder(source: string, destination: string, options: ICopyFolderOptions = {}) {
  fs.mkdirSync(destination, {recursive: true});

  copyDir.sync(source, destination, {});

  const filePaths = glob.sync(`${destination}/**/*`);
  filePaths.push(destination);

  const replaceMatches: Array<{key: string, value: string}> = [];
  filePaths.forEach((path) => {

    replaceMatches.forEach((match) => {
      if (path.includes(match.key)) {
        path = path.replace(match.key, match.value);
      }
    });

    const newPath = renameFileWithVariables(path, options.replaceVariables);
    if (newPath !== path) {
      replaceMatches.push({key: path, value: newPath});
    }

    replaceFileContents(newPath, options.replaceVariables);
  });
}
