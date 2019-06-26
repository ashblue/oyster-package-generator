const copyDir = require('copy-dir');
import * as fs from 'fs';
import * as glob from 'glob';

export interface IKeyValuePair {
  variable: string;
  value: string;
}

export interface ICopyFolderOptions {
  replaceVariables: IKeyValuePair[];
}

export interface ICopyFolderResults {
  skippedFilePaths: string[];
}

export type copyFolderType = (
  source: string,
  destination: string,
  options?: ICopyFolderOptions) => Promise<ICopyFolderResults>;

function renameFileWithVariables(path: string, variables: IKeyValuePair[] | undefined): string {
  if (!path.includes('{') || !path.includes('}')) { return path; }
  if (!variables) { return path; }

  const newPath = replaceVariables(path, variables);
  if (fs.existsSync(newPath)) {
    return newPath;
  }

  fs.renameSync(path, newPath);

  return newPath;
}

function replaceVariables(text: string, variables: IKeyValuePair[]): string {
  let newText = text;
  variables.forEach((r) => {
    const matches = new RegExp(`{${r.variable}}`, 'g');
    newText = newText.replace(matches, r.value);
  });

  return newText;
}

function replaceFileContents(path: string, variables: IKeyValuePair[] | undefined) {
  if (!variables) { return; }
  const details = fs.statSync(path);
  if (details.isDirectory()) { return; }

  const text = fs.readFileSync(path).toString();
  const newText = replaceVariables(text, variables);

  fs.writeFileSync(path, newText);
}

function findPreExistingFiles(source: string, destination: string, variables: IKeyValuePair[]) {
  const sourceFiles = glob.sync(`${source}/**/*`, {nodir: true})
    .map((f) => {
      const partial = f.replace(source, '');
      return replaceVariables(partial, variables);
    });

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
  options: ICopyFolderOptions = {replaceVariables: []}): Promise<ICopyFolderResults> {

  const skippedFilePaths = findPreExistingFiles(source, destination, options.replaceVariables);
  if (skippedFilePaths.length > 0) {
    return {
      skippedFilePaths,
    };
  }

  fs.mkdirSync(destination, {recursive: true});

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
