const commands = {
  'join': ['channel'],
  'part': ['?channel', '?message'],
  'ctcp': ['target', 'type', 'text'],
  'action': ['target', 'message'],
  'whois': ['nick'],
  'list': [],
};

const defaultPartMessage = 'bye';

export const CommandParser = {
  validateArgs(info, args) {
    return info.length === args.length ||
           info.filter(s => s.charAt(0) !== '?').length === args.length;
  },
  processArgs(commandName, args, context) {
    switch (commandName) {
    case 'join':
      if (args[0].charAt(0) !== '#') {
        args[0] = '#' + args[0];
      }
      break;
    case 'part':
      if (args.length === 0) {
        args.push(context.from);
      } else if (args[0].charAt(0) !== '#') {
        args[0] = '#' + args[0];
      }
      break;
    }
    return args;
  },
  parse(raw, context) {
    let tokens = raw.split(' ');
    let commandName = tokens[0];
    let args = tokens.splice(1);
    let commandInfo = this.info(commandName);

    if (!commandInfo) {
      return {valid: false, errMsg: 'Invalid command name'};
    }

    if (this.validateArgs(commandInfo, args)) {
      args = this.processArgs(commandName, args, context);
      return {valid: true, name: commandName, args: args};
    } else {
      return {valid: false, errMsg: `Invalid command arguments: [${commandInfo}]`};
    }
  },
  info(commandName) {
    return commands[commandName];
  },
};
