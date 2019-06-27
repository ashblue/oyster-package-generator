export interface IGitDetails {
  gitUrlNoHttp: string;
  gitUrl: string;
}

export class GitDetector {
  private readonly _gitRemoteOriginUrl: any;

  constructor(gitRemoteOriginUrl: any) {
    this._gitRemoteOriginUrl = gitRemoteOriginUrl;
  }

  public async getDetails(): Promise<IGitDetails> {
    const remote = await this._gitRemoteOriginUrl();

    let gitUrl = remote.replace(
      'git@github.com:',
      'https://github.com/',
    );
    gitUrl = gitUrl.replace('.git', '');

    let gitUrlNoHttp = remote.replace(
      'git@github.com:',
      'github.com/',
    );
    gitUrlNoHttp = gitUrlNoHttp.replace('.git', '');

    return {
      gitUrl,
      gitUrlNoHttp,
    };
  }
}
