import * as inquirer from 'inquirer';
import {Terminal} from './terminal/terminal';

const terminal = new Terminal(inquirer);
terminal.askQuestions();
