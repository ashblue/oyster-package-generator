import chalk from 'chalk';
import CommandInstall from './install/command-install';
import ConfigManager from './shared/config/manager/config-manager';
import CommandUpgrade from './upgrade/command-upgrade';

export default class CommandsController {
  private _cmdInstall = new CommandInstall();
  private _cmdUpgrade = new CommandUpgrade(new ConfigManager());

  public run(argument: string): void {
    if (argument === 'init') {
      void this._cmdInstall.run();
      return;
    } else if (argument === 'upgrade') {
      void this._cmdUpgrade.run();
      return;
    }

    console.log(
      chalk.yellow(
        'Please run the command with an argument such as `oyster init`',
      ),
    );
  }
}
