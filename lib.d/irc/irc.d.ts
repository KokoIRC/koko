declare module 'irc' {
  export class Client {
    constructor(server: string, nick: string, opt: any);
    connect();
    on(eventName: string, handler: (...args: any[]) => void);
    say(target: string, text: string);
  }
}
