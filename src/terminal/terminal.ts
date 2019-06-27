import chalk from 'chalk';
import { Inquirer, Question } from 'inquirer';

export interface IQuestionsToAnswers {
  name: string;
  displayName: string;
  description: string;
  version: string;
}

export class Terminal {
  public static requiredString(value: string): boolean {
    return value.trim() !== '';
  }

  private _inquirer: Inquirer;

  public constructor(inquirer: Inquirer) {
    this._inquirer = inquirer;
  }

  public async askQuestions(): Promise<IQuestionsToAnswers> {
    return await this._inquirer.prompt(
      [
        this.questionName(),
        this.questionDisplayName(),
        this.questionDescription(),
        this.questionUnityVersion(),
        this.authorName(),
        this.authorEmail(),
        this.authorUrl(),
      ],
    ) as IQuestionsToAnswers;
  }

  private questionName(): Question {
    const packageNameFormat = chalk.blue('com.<company-name>.<package-name>');
    const packageNameExample = chalk.blue('com.unity.timeline');

    return {
      message: `Package name? Internal ID that's permanent. Example ${packageNameFormat} or ${packageNameExample}`,
      name: 'name',
      type: 'input',
      validate: Terminal.requiredString,
    };
  }

  private questionDisplayName(): Question {
    const example = chalk.blue('Unity Timeline');
    const exampleAlt = chalk.blue('ProBuilder');

    return {
      message: `Package display name? Should be user-friendly. Example ${example} or ${exampleAlt}`,
      name: 'displayName',
      type: 'input',
      validate: Terminal.requiredString,
    };
  }

  private questionDescription(): Question {
    return {
      message: `Package description?. Will appear in the package manager window`,
      name: 'description',
      type: 'input',
    };
  }

  private questionUnityVersion(): Question {
    const example = chalk.blue('2019.1');

    return {
      message: `Minimum Unity version?. No version indicates all versions of Unity. Example ${example}`,
      name: 'version',
      type: 'input',
    };
  }

  private authorName(): Question {
    return {
      message: `What is the author's name?`,
      name: 'authorName',
      type: 'input',
    };
  }

  private authorEmail(): Question {
    return {
      message: `What is the author's email?`,
      name: 'authorEmail',
      type: 'input',
    };
  }

  private authorUrl(): Question {
    return {
      message: `What is the author's url?`,
      name: 'authorUrl',
      type: 'input',
    };
  }
}
