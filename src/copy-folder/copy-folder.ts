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

interface ICopyFolderResults {
  skippedFilePaths: string[];
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

function findPreExistingFiles(source: string, destination: string) {
  const sourceFiles = glob.sync(`${source}/**/*`, {nodir: true})
    .map((f) => f.replace(source, ''));
  const destFiles = glob.sync(`${destination}/**/*`, {nodir: true});

  const matches: string[] = [];
  destFiles.forEach((f) => {
    const path = f.replace(destination, '');
    if (sourceFiles.includes(path)) {
      matches.push(f);
    }
  });

  return matches;
}

export async function copyFolder(
  source: string,
  destination: string,
  options: ICopyFolderOptions = {}): Promise<ICopyFolderResults> {

  fs.mkdirSync(destination, {recursive: true});

  const skippedFilePaths = findPreExistingFiles(source, destination);
  copyDir.sync(source, destination, {cover: false});

  const destinationPaths = glob.sync(`${destination}/**/*`);
  destinationPaths.push(destination);

  const replaceMatches: Array<{key: string, value: string}> = [];
  destinationPaths.forEach((path) => {

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

  return {
    skippedFilePaths,
  };
}
