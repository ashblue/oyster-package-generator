import * as fs from 'fs';
import * as nodePath from 'path';
import * as glob from 'glob';
import * as del from 'del';
import fse from 'fs-extra';

const TMP_PATH = nodePath.resolve(__dirname, '../../tmp/build');

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

export type CopyFolderType = (
  source: string,
  destination: string,
  options?: ICopyFolderOptions) => Promise<void>;

export type FindPreExistingFilesType = (
  source: string,
  destination: string,
  variables: IKeyValuePair[]) => string[];

const renameFileWithVariables = (path: string, variables: IKeyValuePair[] | undefined): string => {
  if (!path.includes('{') || !path.includes('}')) {
    return path;
  }
  if (!variables) {
    return path;
  }

  const newPath = replaceVariables(path, variables);
  if (fs.existsSync(newPath)) {
    return newPath;
  }

  fs.renameSync(path, newPath);

  return newPath;
};

const replaceVariables = (text: string, variables: IKeyValuePair[]): string => {
  let newText = text;
  variables.forEach((r) => {
    const matches = new RegExp(`{${r.variable}}`, 'g');
    newText = newText.replace(matches, r.value);
  });

  return newText;
};

const replaceFileContents = (path: string, variables: IKeyValuePair[] | undefined) => {
  if (!variables) {
    return;
  }
  const details = fs.statSync(path);
  if (details.isDirectory()) {
    return;
  }

  const text = fs.readFileSync(path).toString();
  const newText = replaceVariables(text, variables);

  fs.writeFileSync(path, newText);
};

export const findPreExistingFiles = (
  source: string,
  destination: string,
  variables: IKeyValuePair[]
): string[] => {
  const matches: string[] = [];
  const sourceFiles = glob.sync(`${source}/**/*`, {nodir: true, dot: true})
    .filter((f) => !f.includes('.DS_Store'))
    .map((f) => {
      const partial = f.replace(source, '');
      return replaceVariables(partial, variables);
    });

  const destFiles = glob.sync(`${destination}/**/*`, {nodir: true, dot: true});

  destFiles.forEach((f) => {
    let path = f.replace(destination, '');
    if (path.charAt(0) !== '/') {
      path = '/' + path;
    }

    if (sourceFiles.includes(path)) {
      matches.push(f);
    }
  });

  return matches;
};

const copyFilesWithVariables = async (source: string, destination: string, options: ICopyFolderOptions) => {
  await del.default(TMP_PATH, {force: true});

  fs.mkdirSync(destination, {recursive: true});
  fse.copySync(source, destination);

  const destinationPaths = glob.sync(`${destination}/**/*`, {dot: true});
  const replaceMatches: Array<{ key: string; value: string }> = [];
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
};

export const copyFolder = async (
  source: string,
  destination: string,
  options: ICopyFolderOptions = {replaceVariables: []}
): Promise<void> => {

  await copyFilesWithVariables(source, TMP_PATH, options);

  fse.copySync(TMP_PATH, destination);
};
