#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs-extra');
var os = require('os');
var prompt = require('prompt');
var thecommand = require('./');

// Read config or create it if not exists
var configDir;
if (pathExists(os.homedir() + '/Persistent')) { // Tails user
  configDir = os.homedir() + '/Persistent/.passgen';
} else { // Non-Tails user
  configDir = os.homedir() + '/.passgen';
}
fs.ensureDirSync(configDir);
fs.ensureFileSync(configDir + '/settings.json');
var config = fs.readJsonSync(configDir + '/settings.json', { throws: false });
if (config === null) {
  config = {
    salt: (Math.random() + 1).toString(36).slice(2) + (Math.random() + 1).toString(36).slice(2),
    length: 40
  };
  fs.writeJson(configDir + '/settings.json', config);
}

// Do stuff based on arguments
if (argv.help || argv.h) { // Display help
  console.log('');
  console.log('Usage: %s "your passphrase here"', 'passgen');
  console.log(' Or simply type %s to be prompted for your passphrase', 'passgen');
  console.log('');
  console.log(' The resulting password will be placed in your clipboard for pasting');
  console.log('');
  console.log('Options:');
  console.log('');
  console.log(' -h, --help    Display this usage info');
  console.log(' -s, --setup   Will guide you through the setup process');
  process.exit(0);
} else if (argv.setup || argv.s) { // do setup
  console.log('');
  console.log('===============================================================================');
  console.log('==                               PassGen Setup                               ==');
  console.log('===============================================================================');
  console.log('');
  console.log('Input a new value or press enter to keep the existing value (in parentheses)');
  console.log('');
  var schema = {
    properties: {
      salt: {
        description: 'Salt: the string that is appended to all your passphrases before generating the password',
        type: 'string',
        default: config.salt,
        required: true
      },
      length: {
        description: 'Length: how long the generated password will be',
        type: 'integer',
        default: config.length,
        required: true
      }
    }
  };
  prompt.start();
  prompt.get(schema, function (err, result) {
    config = {
      salt: result.salt,
      length: result.length
    };
    fs.writeJson(configDir + '/settings.json', config);
    console.log('');
    console.log('Configuration saved!');
  });
} else if (argv.prompt || argv.p || argv._.length === 0) { // Prompt for passphrase
  console.log('');
  console.log('===============================================================================');
  console.log('==                                  PassGen                                  ==');
  console.log('===============================================================================');
  console.log('');
  console.log('Input your passphrase');
  console.log('');
  var schema = {
    properties: {
      passphrase: {
        hidden: true,
        description: ' '
      }
    }
  };
  prompt.start();
  prompt.get(schema, function (err, result) {
    thecommand(result.passphrase, config)
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