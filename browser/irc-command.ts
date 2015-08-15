import _ = require('underscore');

const commands: IDict<string[]> = {
  'join': ['channel'],
  'part': ['?channel', '!message'],
  'ctcp': ['target', 'type', '!text'],
  'action': ['target', '!message'],
  'whois': ['nick'],
  'list': [],
  'nick': ['nick'],
  'mode': ['?channel', 'mode', 'nick'],
  'kick': ['?channel', 'nick', '!message'],
  'ban': ['?channel', 'nick'],
  'unban': ['?channel', 'nick'],
  'kickban': ['?channel', 'nick', '!message'],
  'topic': ['?channel', '!topic'],
  'quote': ['command', '...args'],
  'raw': ['command', '...args'],
};

export class CommandError implements Error {
  message: string;
  name: string;
  constructor(message: string) {
    this.message = message;
  }
}

export function parse(raw: string, context: ICommandContext): IIrcCommand {
  let tokens = raw.split(' ');
  let commandName = tokens[0];
  let args = tokens.splice(1);
  let command = commands[commandName];

  if (!command) {
    throw new CommandError(`Invalid command name: ${commandName}`);
  }

  args = parseArgs(commandName, _.clone(command), args, context);
  return {name: commandName, args};
}

function parseArgs(commandName: string, argList: string[], args: string[], context: ICommandContext): string[] {
  let parsedArgs = [];
  while (true) {
    let argNeeded = argList.shift();
    if (_.isUndefined(argNeeded)) {
      break;
    }

    if (argNeeded.startsWith('?')) {
      if (argNeeded === '?channel' && !(args[0] && args[0].startsWith('#'))) {
        parsedArgs.push(context.target);
      } else {
        parsedArgs.push(args.shift());
      }
    } else if (argNeeded.startsWith('!')) {
      if (args.length > 0) {
        parsedArgs.push(args.join(' '));
      }
      break;
    } else if (argNeeded.startsWith('...')) {
      parsedArgs.push(args);
      break;
    } else {
      let arg = args.shift();
      if (_.isUndefined(arg)) {
        throw new CommandError(`Command argument needed: [${argNeeded}]`);
      } else {
        parsedArgs.push(arg);
      }
    }
  }

  return parsedArgs.map<string>(reprocess.bind(null, commandName));
}

function reprocess(commandName: string, value: string, idx: number): string {
  switch (commandName) {
  case 'join':
    if (idx === 0) {
      if (value[0] !== '#') {
        value = '#' + value;
      }
    }
    break;
  case 'mode':
    if (idx === 1) {
      if (!(value[0] === '+' || value[0] === '0')) {
        value = '+' + value;
      }
    }
    break;
  }
  return value;
}
