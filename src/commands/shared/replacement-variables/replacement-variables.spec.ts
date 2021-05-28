import { A } from '../../../utils/builders/a';
import { IKeyValuePair } from '../copy-folder/copy-folder';
import { getReplacementKeyValuePairs } from './replacement-variables';

describe('replacementVariables functions', () => {
  describe('getReplacementKeyValuePairs method', () => {
    it('should convert config to key value pairs', () => {
      const config = A.configRaw().build();
      const keyValuePairs: IKeyValuePair[] = [
        { key: 'packageScope', value: config.packageScope },
        { key: 'year', value: new Date().getFullYear().toString() },
        { key: 'gitignore', value: '.gitignore' },
        { key: 'packageName', value: config.packageName },
        { key: 'gitUrl', value: config.repo.gitUrl },
        { key: 'gitUrlNoHttp', value: config.repo.gitUrlNoHttp },
        { key: 'authorEmail', value: config.author.email },
        { key: 'authorName', value: config.author.name },
        { key: 'authorUrl', value: config.author.url },
        { key: 'description', value: config.description },
        { key: 'displayName', value: config.displayName },
        { key: 'keywords', value: JSON.stringify(config.keywords, null, 2) },
        { key: 'unityVersion', value: config.unityVersion },
      ];

      const result = getReplacementKeyValuePairs(config);

      expect(result).toEqual(keyValuePairs);
    });
  });
});
