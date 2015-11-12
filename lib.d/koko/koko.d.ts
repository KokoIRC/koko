interface IDict<T> {
  [key: string]: T;
}

interface ICommandContext {
  target: string;
}

interface IIrcCommand {
  name: string;
  args: string[];
}

interface IConnectionData {
  host: string;
  nick: string;
  username: string;
  password: string;
  realname: string;
  port: string;
  encoding: string;
}

interface IJsonCallback {
  (json: any): void;
}

declare function _require(moduleName: string): any;

interface IIrcRawMessage {
  user: string;
  host: string;
}

interface IShortcutCallback {
  (): void;
}

interface IShortcutKeyInput {
  key: string;
  modifier: string;
}

interface IShortcutKeyConfig {
  action: string;
  shortcuts: (IShortcutKeyInput[])[];
}

interface IModifierState {
  [mod: string]: boolean;
  alt: boolean;
  control: boolean;
  meta: boolean;
  shift: boolean;
}

interface IServerInterface {
  nick?: string;
  username?: string;
  password: string;
  realname?: string;
  name: string;
  host: string;
  port?: string;
  encoding?: string;
}
