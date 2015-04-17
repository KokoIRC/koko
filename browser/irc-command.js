import _ from 'underscore';

const commands = {
  'join': {args: ['channel']},
  'part': {args: ['?channel', '?message']},
  'ctcp': {args: ['target', 'type', 'text']},
  'action': {args: ['target', 'message']},
  'whois': {args: ['nick']},
  'list': {args: []},
  'nick': {args: ['nick']},
};

export const CommandParser = {
  applyArgs(command, args, context) {
    let maxLength = command.args.length;
    let minLength = command.args.filter(s => s.charAt(0) !== '?').length;
    if (args.length < minLength || maxLength < args.length) {
      throw new Error(`Invalid command arguments: [${command.args}]`);
    }

    command.args = _.compact(command.args.map(function (argName, idx) {
      if (_.isUndefined(args[idx])) {
        if (argName[0] !== '?') {
          let argFormat = `${command.name}: [${command.args}]`;
          throw new Error(`No ${argName} provided. ${argFormat}`);
        } else {
          return this.processArg(command, null, idx, context);
        }
      } else {
        return this.processArg(command, args[idx], idx, context);
      }
    }.bind(this)));
  },
  processArg(command, value, idx, context) {
    switch (command.name) {
    case 'join':
      if (idx === 0) {
        if (value[0] !== '#') {
          value = '#' + value;
        }
      }
      break;
    case 'part':
      if (idx === 0) {
        if (value === null) {
          value = context.target;
        } else if (value[0] !== '#') {
          value = '#' + value;
        }
      }
      break;
    }
    return value;
  },
  parse(raw, context) {
    let tokens = raw.split(' ');
    let commandName = tokens[0];
    let args = tokens.splice(1);
    let command = _.clone(commands[commandName]);

    if (!command) {
      throw new Error('Invalid command name');
    }

    command.name = commandName;

    this.applyArgs(command, args, context);
    return command;
  },
};
