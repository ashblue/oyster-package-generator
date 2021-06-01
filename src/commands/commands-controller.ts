import chalk from 'chalk';
import gitRemoteOriginUrl from 'git-remote-origin-url';
import CommandGenerateConfig from './generate-config/command-generate-config';
import CommandInstall from './install/command-install';
import GitDetector from './install/git-detector/git-detector';
import ConfigManager from './shared/config/manager/config-manager';
import CommandUpgrade from './upgrade/command-upgrade';

export default class CommandsController {
  private _configManager = new ConfigManager();
  private _cmdInstall = new CommandInstall();
  private _cmdUpgrade = new CommandUpgrade(this._configManager);
  private _cmdGenerateConfig = new CommandGenerateConfig(
    this._configManager,
    new GitDetector(gitRemoteOriginUrl),
  );

  public run(argument: string): void {
    if (argument === 'init') {
      void this._cmdInstall.run();
      return;
    } else if (argument === 'upgrade') {
      void this._cmdUpgrade.run();
      return;
    } else if (argument === 'generate-config') {
      void this._cmdGenerateConfig.run();
      return;
    }

    console.log(
      chalk.yellow(
        'Please run the command with an argument such as `oyster init`',
      ),
    );
  }
}
