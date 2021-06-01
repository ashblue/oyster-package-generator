import * as fs from 'fs';
import Config from '../config';
import IConfig from '../i-config';
import IConfigRaw from '../i-config-raw';

export interface IConfigManager {
  read(): IConfig | null;
  generate(data: IConfigRaw): void;
}

export default class ConfigManager implements IConfigManager {
  public generate(data: IConfigRaw): void {
    const configDataJson = JSON.stringify(data, null, 2);
    fs.writeFileSync('./.oyster.json', configDataJson);
  }

  public read(): IConfig | null {
    let configRaw: IConfigRaw | null = null;
    try {
      const fileContents = fs.readFileSync('./.oyster.json');
      configRaw = JSON.parse(fileContents.toString()) as IConfigRaw;
    } catch (e) {
      return null;
    }

    return new Config(configRaw);
  }
}
