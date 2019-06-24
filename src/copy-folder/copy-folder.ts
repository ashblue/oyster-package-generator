const copyDir = require('copy-dir');
import * as fs from 'fs';
import * as glob from 'glob';

interface keyValuePair {
  variable: string;
  value: string;
}

interface copyFolderOptions {
  replaceVariables?: keyValuePair[],
}

function renameFileWithVariables(path: string, variables: keyValuePair[] | undefined): string {
  if (!path.includes('{') || !path.includes('}')) return path;
  if (!variables) return path;

  let newPath = path;
  variables.forEach(r => {
    newPath = newPath.replace(`{${r.variable}}`, r.value);
  });

  fs.renameSync(path, newPath);

  return newPath;
}

function replaceFileContents(path: string, variables: keyValuePair[] | undefined) {
  if (!variables) return;
  const details = fs.statSync(path);
  if (details.isDirectory()) return;

  let contents = fs.readFileSync(path).toString();
  variables.forEach(r => {
    contents = contents.replace(`{${r.variable}}`, r.value);
  });

  fs.writeFileSync(path, contents);
}

export async function copyFolder(source: string, destination: string, options: copyFolderOptions = {}) {
  fs.mkdirSync(destination, {recursive: true});

  copyDir.sync(source, destination, {});

  const filePaths = glob.sync(`${destination}/**/*`);
  filePaths.push(destination);

  filePaths.forEach(path => {
    const newPath = renameFileWithVariables(path, options.replaceVariables);
    replaceFileContents(newPath, options.replaceVariables);
  });
}
