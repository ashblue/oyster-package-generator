import * as fs from 'fs';
import { nanoid } from 'nanoid';
import IConfigRaw from '../../shared/config/i-config-raw';
import { IQuestionsToAnswers } from '../install-questions/install-questions';
import PackageBuilder from './package-builder';

jest.mock('fs');

describe('PackageBuilder class', () => {
  interface IOptions {
    gitUrl?: string;
    gitUrlNoHttp?: string;
    packageName?: string;
    questionResponses?: IQuestionsToAnswers;
    oysterVersion?: string;
  }

  const setup = (options: IOptions = {}) => {
    const optionsDefault: IOptions = {
      oysterVersion: nanoid(),
      gitUrl: nanoid(),
      gitUrlNoHttp: nanoid(),
      packageName: `com.${nanoid()}.${nanoid()}`,
      questionResponses: {
        authorEmail: nanoid(),
        authorName: nanoid(),
        authorUrl: nanoid(),
        description: nanoid(),
        displayName: nanoid(),
        keywords: [nanoid()],
        unityVersion: nanoid(),
      },
    };

    const {
      gitUrl,
      gitUrlNoHttp,
      questionResponses,
      packageName,
      oysterVersion,
    } = { ...optionsDefault, ...options };

    const copyFolder = jest.fn(() => Promise.resolve());
    const findPreExistingFiles = jest.fn(() => []);

    const config = {
      generate: jest.fn(),
    };

    const installQuestions: any = {
      askName: () => Promise.resolve(packageName),
      askQuestions: () => Promise.resolve(questionResponses),
    };

    const gitDetector: any = {
      checkIfGitRepo: jest.fn(() =>
        Promise.resolve({
          isGitRepo: true,
        }),
      ),
      getDetails: jest.fn(() => ({ gitUrl, gitUrlNoHttp })),
    };

    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation(() => JSON.stringify({ version: oysterVersion }));

    jest.spyOn(console, 'log').mockImplementation();

    return {
      config,
      packageBuilder: new PackageBuilder(
        copyFolder,
        findPreExistingFiles,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        installQuestions,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        gitDetector,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        config as any,
      ),
    };
  };

  describe('build() method', () => {
    it('should return true on success', async () => {
      const { packageBuilder } = setup();

      const result = await packageBuilder.build('a', 'b');

      expect(result).toEqual(true);
    });

    it('should generate a config with the expected answers', async () => {
      const packageName = `com.${nanoid()}.${nanoid()}`;
      const oysterVersion = '1.0.0';

      const configValues: IConfigRaw = {
        description: nanoid(),
        displayName: nanoid(),
        keywords: [nanoid()],
        packageName,
        packageScope: packageName.split('.', 2).join('.'),
        unityVersion: nanoid(),
        oysterVersion,
        author: {
          email: nanoid(),
          name: nanoid(),
          url: nanoid(),
        },
        repo: {
          gitUrl: nanoid(),
          gitUrlNoHttp: nanoid(),
        },
      };

      const { config, packageBuilder } = setup({
        gitUrl: configValues.repo.gitUrl,
        gitUrlNoHttp: configValues.repo.gitUrlNoHttp,
        oysterVersion,
        packageName,
        questionResponses: {
          authorEmail: configValues.author.email,
          authorName: configValues.author.name,
          authorUrl: configValues.author.url,
          description: configValues.description,
          displayName: configValues.displayName,
          keywords: configValues.keywords,
          unityVersion: configValues.unityVersion,
        },
      });
      await packageBuilder.build('a', 'b');

      expect(config.generate).toHaveBeenCalledWith(configValues);
    });
  });
});
