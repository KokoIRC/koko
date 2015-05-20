declare module 'irc' {
  import net = require("net");

  export class Client {
    _nick: string;
    constructor(server: string, nick: string, opt: any);
    connect();
    on(eventName: string, handler: (...args: any[]) => void);
    say(target: string, text: string);
    conn: net.Socket;
  }

  interface Colors {
    codes: {[colorName: string]: string};
  }

  export var colors: Colors;
}
