#!/usr/bin/env node
/* eslint-disable no-console, no-use-before-define */

const argv = require('minimist')(process.argv.slice(2), { boolean: ['d', 'display', 'h', 'help', 'p', 'prompt', 's', 'setup', 'v'] });
const fs = require('fs-extra');
const inquirer = require('inquirer');
const os = require('os');
const pkgjson = require('./package.json');
const thecommand = require('.');

const commandName = Object.keys(pkgjson.bin)[0];

// Read config or create it if not exists
const configDir = (pathExists(`${os.homedir()}/Persistent`) ? `${os.homedir()}/Persistent/.passgen` : `${os.homedir()}/.passgen`);
fs.ensureDirSync(configDir);
fs.ensureFileSync(`${configDir}/settings.json`);
let config = fs.readJsonSync(`${configDir}/settings.json`, { throws: false });
if (config === null) {
  config = {
    salt: (Math.random() + 1).toString(36).slice(2) + (Math.random() + 1).toString(36).slice(2),
    length: 40,
  };
  fs.writeJson(`${configDir}/settings.json`, config);
}

// Do stuff based on arguments
config.hidden = true;
if (argv.d || argv.display) config.hidden = false;
if (argv.l) config.length = argv.l;
else if (argv.length) config.length = argv.length;
if (argv.help || argv.h) { // Display help
  console.log(`${commandName} v${pkgjson.version}`);
  console.log('');
  console.log(`Usage: ${commandName} "your passphrase here"`);
  console.log(` Or simply type ${commandName} to be prompted for your passphrase`);
  console.log('');
  console.log(' The resulting password will be placed in your clipboard for pasting');
  console.log('');
  console.log('Options:');
  console.log('');
  console.log(' -h, --help      Display this usage info');
  console.log(' -s, --setup     Will guide you through the setup process');
  console.log(' -d, --display   Display the generated password');
  console.log(' -l, --length    Override default password length');
  console.log(' -p, --prompt    Prompt for passphrase');
  process.exit(0);
} else if (argv.setup || argv.s) { // do setup
  console.log('');
  console.log('===============================================================================');
  console.log('==                               PassGen Setup                               ==');
  console.log('===============================================================================');
  console.log('');
  console.log('Input a new value or press enter to keep the existing value (in parentheses)');
  console.log('');
  const questions = [{
    name: 'salt',
    message: 'Salt: the string that is appended to all your passphrases before generating the password',
    default: config.salt,
  }, {
    name: 'length',
    type: 'number',
    message: 'Length: how long the generated password will be',
    default: config.length,
  }];
  inquirer.prompt(questions)
    .then((answers) => {
      config = {
        salt: answers.salt,
        length: answers.length,
      };
      fs.writeJson(`${configDir}/settings.json`, config);
      console.log('');
      console.log('Configuration saved!');
    });
} else if (argv.v) {
  console.log(pkgjson.version);
} else if (argv.prompt || argv.p || argv._.length === 0) { // Prompt for passphrase
  console.log('');
  console.log('===============================================================================');
  console.log('==                                  PassGen                                  ==');
  console.log('===============================================================================');
  console.log('');
  const questions = [{
    name: 'passphrase',
    type: 'password',
    message: 'Passphrase',
    mask: '*',
  }];
  inquirer.prompt(questions)
    .then((answers) => {
      thecommand(answers.passphrase, config);
    });
} else {
  thecommand(argv._[0], config);
}

function pathExists(path) {
  try {
    fs.accessSync(path, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}
