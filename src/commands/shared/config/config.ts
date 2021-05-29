import * as fs from 'fs';
import path from 'path';
import IConfig from './i-config';
import IConfigRaw from './i-config-raw';

export default class Config implements IConfigRaw, IConfig {
  public description: string;
  public displayName: string;
  public keywords: string[];
  public oysterVersion: string;
  public packageName: string;
  public packageScope: string;
  public unityVersion: string;

  public author: { name: string; email: string; url: string };
  public repo: { gitUrl: string; gitUrlNoHttp: string };

  constructor(data: IConfigRaw) {
    this.description = data.description;
    this.displayName = data.displayName;
    this.keywords = data.keywords;
    this.oysterVersion = data.oysterVersion;
    this.packageName = data.packageName;
    this.packageScope = data.packageScope;
    this.unityVersion = data.unityVersion;

    this.author = {
      name: data.author.name,
      email: data.author.email,
      url: data.author.url,
    };

    this.repo = {
      gitUrl: data.repo.gitUrl,
      gitUrlNoHttp: data.repo.gitUrlNoHttp,
    };
  }

  public syncVersion(): void {
    const oysterPackagePath = path.resolve(
      __dirname,
      './../../../../package.json',
    );
    const oysterPackageContents = fs.readFileSync(oysterPackagePath);
    const { version } = JSON.parse(oysterPackageContents.toString()) as {
      version: string;
    };

    this.oysterVersion = version;
  }
}
