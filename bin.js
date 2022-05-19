#!/usr/bin/env node
/* eslint-disable no-console, no-use-before-define */

const argv = require('minimist')(process.argv.slice(2),
  {
    boolean: ['d', 'display', 'p', 'print', 'h', 'help', 'prompt', 'setup', 'no-specials', 'no-uppers', 'no-numbers'],
    string: ['v', 'version', 's', 'salt', 'l', 'length', 'custom-specials'],
  });
const fs = require('fs-extra');
const inquirer = require('inquirer');
const clipboard = require('clipboardy');
const os = require('os');
const pkgjson = require('./package.json');
const generator = require('.');

const commandName = Object.keys(pkgjson.bin)[0];

// Read config if it exists
const configDir = (pathExists(`${os.homedir()}/Persistent`) ? `${os.homedir()}/Persistent/.passgen` : `${os.homedir()}/.passgen`);
fs.ensureDirSync(configDir);
fs.ensureFileSync(`${configDir}/settings.json`);
let config = fs.readJsonSync(`${configDir}/settings.json`, { throws: false });
if (config === null) {
  config = {};
}

// Do stuff based on arguments
const versionValue = argv.v || argv.version;
config.version = versionValue && !isNaN(parseInt(versionValue, 10)) ? parseInt(versionValue, 10) : 2;
config.salt = config.salt || process.env.PASSGEN_SALT || '';
const lengthValue = config.length || argv.l || argv.length;
config.length = lengthValue && !isNaN(parseInt(lengthValue, 10)) ? parseInt(lengthValue, 10) : 40;
config.print = argv.d || argv.display || argv.print;
config.noSpecials = argv['no-specials'];
config.noUppers = argv['no-uppers'];
config.noNumbers = argv['no-numbers'];
config.customSpecials = argv['custom-specials'] || '!@#$%^&*';

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
  console.log(' -v, --version            override passgen algorithm version (default 2)');
  console.log(' -s, --salt               salt appended to passphrase (default env[PASSGEN_SALT])');
  console.log(' -l, --length             password length (default 40 or env[PASSGEN_LENGTH])');
  console.log('     --print              print the generated password');
  console.log('     --no-specials        no special characters (v2 only)');
  console.log('     --no-uppers          no uppercase characters (v2 only)');
  console.log('     --no-numbers         no number characters (v2 only)');
  console.log('     --custom-specials    custom special character set (v2 only)');
  console.log(' -h, --help               display this usage info');
  process.exit(0);
} else if (argv.setup) { // do setup
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
} else if (argv.prompt || argv._.length === 0) { // Prompt for passphrase
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
      config.passphrase = answers.passphrase;
      printOrCopy();
    });
} else {
  config.passphrase = argv._.join(' ');
  printOrCopy();
}

function printOrCopy() {
  const password = generator(config);
  if (config.print) {
    console.log(password);
  } else {
    clipboard.writeSync(password);
  }
}

function pathExists(path) {
  try {
    fs.accessSync(path, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}
