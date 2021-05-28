import * as fs from 'fs';
import { resolve } from 'path';
import * as glob from 'glob';
import * as del from 'del';
import fse from 'fs-extra';

export interface IKeyValuePair {
  key: string;
  value: string;
}

export interface ICopyFileFolderOptions {
  replaceVariables: IKeyValuePair[];
}

export interface ICopyFolderResults {
  skippedFilePaths: string[];
}

export type CopyFolderType = (
  source: string,
  destination: string,
  options?: ICopyFileFolderOptions,
) => Promise<void>;

export type FindPreExistingFilesType = (
  source: string,
  destination: string,
  variables: IKeyValuePair[],
) => string[];

const renameFileWithVariables = (
  path: string,
  variables: IKeyValuePair[],
): string => {
  if (!path.includes('{') || !path.includes('}')) {
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
    const matches = new RegExp(`{${r.key}}`, 'g');
    newText = newText.replace(matches, r.value);
  });

  return newText;
};

const replaceFileContents = (path: string, variables: IKeyValuePair[]) => {
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
  variables: IKeyValuePair[],
): string[] => {
  const matches: string[] = [];
  const sourceFiles = glob
    .sync(`${source}/**/*`, { nodir: true, dot: true })
    .filter((f) => !f.includes('.DS_Store'))
    .map((f) => {
      const partial = f.replace(source, '');
      return replaceVariables(partial, variables);
    });

  const destFiles = glob.sync(`${destination}/**/*`, {
    nodir: true,
    dot: true,
  });
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

const getDestinationPaths = (isFile: boolean, destination: string) => {
  if (isFile) {
    return [destination];
  }

  return glob.sync(`${destination}/**/*`, { dot: true });
};

const copyFolderWithVariables = async (
  source: string,
  destination: string,
  options: ICopyFileFolderOptions,
) => {
  await del.default(destination, { force: true, dot: true });

  const sourceType = fs.statSync(source);
  if (!sourceType.isFile()) {
    fs.mkdirSync(destination, { recursive: true });
  }

  fse.copySync(source, destination);

  const replaceMatches: Array<{ key: string; value: string }> = [];
  const destinationPaths = getDestinationPaths(
    sourceType.isFile(),
    destination,
  );
  destinationPaths.forEach((path) => {
    replaceMatches.forEach((match) => {
      /* istanbul ignore next */
      if (path.includes(match.key)) {
        path = path.replace(match.key, match.value);
      }
    });

    const newPath = renameFileWithVariables(path, options.replaceVariables);
    if (newPath !== path) {
      replaceMatches.push({ key: path, value: newPath });
    }

    replaceFileContents(newPath, options.replaceVariables);
  });
};

export const copyFileFolder = async (
  source: string,
  destination: string,
  options: ICopyFileFolderOptions = { replaceVariables: [] },
): Promise<void> => {
  const tmpPath = resolve(__dirname, '../../../../tmp/build');

  await copyFolderWithVariables(source, tmpPath, options);

  fse.copySync(tmpPath, destination);
};
