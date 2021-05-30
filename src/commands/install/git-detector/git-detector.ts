export interface IGitDetails {
  gitUrlNoHttp: string;
  gitUrl: string;
}

export interface IRepoStatus {
  isGitRepo: boolean;
  message: string;
}

export interface IGitDetector {
  getDetails(): Promise<IGitDetails>;
}

export default class GitDetector implements IGitDetector {
  private readonly _gitRemoteOriginUrl: () => Promise<string>;

  constructor(gitRemoteOriginUrl: () => Promise<string>) {
    this._gitRemoteOriginUrl = gitRemoteOriginUrl;
  }

  public async checkIfGitRepo(): Promise<IRepoStatus> {
    let isGitRepo = true;
    let message = '';

    try {
      await this._gitRemoteOriginUrl();
    } catch (e) {
      isGitRepo = false;
      if (typeof e === 'string') {
        message = e;
      }
    }

    return {
      isGitRepo,
      message,
    };
  }

  public async getDetails(): Promise<IGitDetails> {
    const remote = await this._gitRemoteOriginUrl();

    let gitUrl = remote.replace('git@github.com:', 'https://github.com/');
    gitUrl = gitUrl.replace('.git', '');

    let gitUrlNoHttp = remote.replace('git@github.com:', 'github.com/');
    gitUrlNoHttp = gitUrlNoHttp.replace('.git', '');

    return {
      gitUrl,
      gitUrlNoHttp,
    };
  }
}
