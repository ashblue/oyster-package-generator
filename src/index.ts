import CommandController from './commands/commands-controller';

/* istanbul ignore file */
const commandInstall = new CommandController();
commandInstall.run(process.argv[process.argv.length - 1]);
