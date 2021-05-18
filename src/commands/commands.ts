import chalk from 'chalk';
import CommandInstall from './install/command-install';

export default class Commands {
  private _cmdInstall = new CommandInstall();

  public run(argument: string): void {
    if (argument === 'init') {
      void this._cmdInstall.run();
      return;
    }

    console.log(chalk.yellow('Please run the command with an argument such as `oyster init`'));
  }
}
