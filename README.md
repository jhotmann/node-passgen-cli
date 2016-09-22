# How it works
Type passgen "some passphrase here" into the terminal or command prompt. PassGen takes your input string,
appends a unique salt string to it, and then generates a hash. The resulting hash is then
base91 encoded so that it uses all uppercase and lowercase letters, numbers, and standard
symbols.  A subset of 15-100 (default is 40 and can be changed in the setup) characters
is picked from the base91 encoded hash and then placed in your clipboard to be pasted into
a password field.

Every time you use the same input string, you will get the same result from PassGen. This
allows you to use an easy to remember passphrases to generate lengthy,
complicated passwords that no one can reproduce unless they know your passphrase, salt,
and method of generating passwords.

# Installation
1. Install NodeJS if you haven't already https://nodejs.org
2. If you're on Linux, make sure xclip is isntalled (`sudo apt-get install xclip`, or equivalent command for your distro)
3. Type `npm install -g passgen-cli` into your terminal or command window
4. Type `passgen -s` and hit enter to launch the setup process. If you haven't used passgen before a random salt will have been generated for you. Replace this salt with your own if you've already used passgen elsewhere.
5. Done. You can now generate passwords.

## Links to Dependencies
- Base91 https://github.com/mscdex/base91.js
- Skein hash https://github.com/drostie/sha3-js
- Minimist https://github.com/substack/minimist
- Prompt https://github.com/flatiron/prompt
- copy-paste https://github.com/xavi-/node-copy-paste
- fs-extra https://github.com/jprichardson/node-fs-extra
