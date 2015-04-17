interface CommandContext {
  target: string;
}

interface IrcCommand {
  name: string;
  args: string[];
}

interface ConnectionData {
  server: string;
  nick: string;
  username: string;
  realname: string;
  port: string;
  encoding: string;
}
