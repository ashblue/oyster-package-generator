import { nanoid } from 'nanoid';
import IConfigRaw from '../../commands/shared/config/i-config-raw';

export default class BuilderConfigRaw {
  private _oysterVersion = '0.0.0';

  public withOysterVersion(version: string): BuilderConfigRaw {
    this._oysterVersion = version;
    return this;
  }

  public build(): IConfigRaw {
    return {
      author: {
        email: 'asdf@asdf.com',
        name: nanoid(),
        url: nanoid(),
      },
      description: nanoid(),
      displayName: nanoid(),
      keywords: ['a', 'b', 'c'],
      oysterVersion: this._oysterVersion,
      packageName: 'com.a.b',
      packageScope: 'com.a',
      repo: {
        gitUrl: nanoid(),
        gitUrlNoHttp: nanoid(),
      },
      unityVersion: '2019.1',
    };
  }
}
