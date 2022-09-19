import chalk from 'chalk';
import { Question, PromptModule } from 'inquirer';

export interface IQuestionsToAnswers {
  authorEmail: string;
  authorName: string;
  authorUrl: string;
  description: string;
  displayName: string;
  keywords: string[];
  unityVersion: string;
}

export default class InstallQuestions {
  private _inquirer: PromptModule;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  constructor(inquirerRef: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    this._inquirer = inquirerRef.prompt;
  }

  public static requiredString(value: string): boolean {
    return value.trim() !== '';
  }

  public async askName(): Promise<string> {
    const question = await this._inquirer([this.questionName()]);

    return question.name as string;
  }

  public async askQuestions(): Promise<IQuestionsToAnswers> {
    const answers = await this._inquirer([
      this.questionDisplayName(),
      this.questionDescription(),
      this.questionUnityVersion(),
      this.questionAuthorName(),
      this.questionAuthorEmail(),
      this.questionAuthorUrl(),
      this.questionKeywords(),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    answers.keywords = this.keywordsToJsonStringArray(answers.keywords);

    return answers as IQuestionsToAnswers;
  }

  private keywordsToJsonStringArray(keywords: string): string[] {
    if (!keywords || keywords.trim() === '') {
      return [];
    }

    const keywordArray = keywords.split(',').map((k: string) => k.trim());

    return keywordArray;
  }

  private questionName(): Question {
    const packageNameFormat = chalk.blue('com.<company-name>.<package-name>');
    const packageNameExample = chalk.blue('com.unity.timeline');

    /* istanbul ignore next */
    return {
      message: `Package name? Internal ID that's permanent. Example ${packageNameFormat} or ${packageNameExample}`,
      name: 'name',
      type: 'input',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      validate: (value) => InstallQuestions.requiredString(value),
    };
  }

  private questionDisplayName(): Question {
    const example = chalk.blue('Unity Timeline');
    const exampleAlt = chalk.blue('ProBuilder');

    /* istanbul ignore next */
    return {
      message: `Package display name? Should be user-friendly. Example ${example} or ${exampleAlt}`,
      name: 'displayName',
      type: 'input',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      validate: (value) => InstallQuestions.requiredString(value),
    };
  }

  private questionDescription(): Question {
    return {
      message:
        'Package description?. Will appear in the package manager window',
      name: 'description',
      type: 'input',
    };
  }

  private questionUnityVersion(): Question {
    const example = chalk.blue('2019.1');

    return {
      message: `Minimum Unity version?. No version indicates all versions of Unity. Example ${example}`,
      name: 'unityVersion',
      type: 'input',
    };
  }

  private questionAuthorName(): Question {
    return {
      message: "What is the author's name?",
      name: 'authorName',
      type: 'input',
    };
  }

  private questionAuthorEmail(): Question {
    return {
      message: "What is the author's email?",
      name: 'authorEmail',
      type: 'input',
    };
  }

  private questionAuthorUrl(): Question {
    return {
      message: "What is the author's url?",
      name: 'authorUrl',
      type: 'input',
    };
  }

  private questionKeywords(): Question {
    return {
      message:
        'Keywords that identify this package. Please separate with a comma',
      name: 'keywords',
      type: 'input',
    };
  }
}
