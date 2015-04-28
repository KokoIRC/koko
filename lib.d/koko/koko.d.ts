interface Dict<T> {
  [key: string]: T;
}

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

interface JsonCallback {
  (json: any): void;
}

declare function _require(moduleName: string): any;

interface IrcRawMessage {
  user: string;
  host: string;
}

interface ShortcutCallback {
  (): void;
}

interface ShortcutKeyInput {
  key: string;
  modifier: string;
}

interface ShortcutKeyConfig {
  action: string;
  shortcuts: (ShortcutKeyInput[])[];
}

interface ModifierState {
  [mod: string]: boolean;
}
