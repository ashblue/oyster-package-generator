import { IBuiltPackageJson } from '../../commands/shared/i-built-package-json';

export class BuilderBuiltPackageJson {
  public build(): IBuiltPackageJson {
    return {
      author: {
        email: 'asdf@asdf.com',
        name: 'Asdf',
        url: 'asdf.com',
      },
      description: 'Desc goes here',
      displayName: 'A B',
      keywords: ['a', 'b', 'c'],
      name: 'com.a.b',
      unity: '2019.1',
    };
  }
}
