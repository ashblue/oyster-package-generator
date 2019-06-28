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

export interface ICopyLocation {
  destination: string;
  source: string;
}

export type copyFolderType = (
  locations: ICopyLocation[],
  options?: ICopyFolderOptions) => Promise<void>;

export type findPreExistingFilesType = (locations: ICopyLocation[], variables: IKeyValuePair[]) => string[];

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

export function findPreExistingFiles(locations: ICopyLocation[], variables: IKeyValuePair[]) {
  const matches: string[] = [];
  locations.forEach((location) => {
    const sourceFiles = glob.sync(`${location.source}/**/*`, {nodir: true})
      .map((f) => {
        const partial = f.replace(location.source, '');
        return replaceVariables(partial, variables);
      });

    const destFiles = glob.sync(`${location.destination}/**/*`, {nodir: true});

    destFiles.forEach((f) => {
      let path = f.replace(location.destination, '');
      if (path.charAt(0) !== '/') {
        path = '/' + path;
      }

      if (sourceFiles.includes(path)) {
        matches.push(f);
      }
    });
  });

  return matches;
}

export async function copyFolder(
  locations: ICopyLocation[],
  options: ICopyFolderOptions = {replaceVariables: []}): Promise<void> {

  locations.forEach((location) => {
    fs.mkdirSync(location.destination, {recursive: true});

    copyDir.sync(location.source, location.destination, {cover: false});

    const destinationPaths = glob.sync(`${location.destination}/**/*`);
    destinationPaths.push(location.destination);

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
  });
}
