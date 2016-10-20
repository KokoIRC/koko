declare class BrowserWindow {
  constructor(opt: any);
  loadURL(url: string);
  on(eventName: string, callback: () => void);
  webContents: WebContents;
  toggleDevTools(): void;
}

declare module 'browser-window' {
  export = BrowserWindow;
}

interface WebContents {
  openDevTools(): void;
  on(eventName: string, callback: (e: Event, url: string) => void);
  send(eventName: string, data: string);
}

declare module 'ipc' {
  export function on(eventName: string, callback: (event: {sender: WebContents}, args: string) => void);
}

declare module 'shell' {
  export function openExternal(url: string);
}

interface Menu {
}

declare module 'menu' {
  export function buildFromTemplate(template: any): Menu;
  export function setApplicationMenu(menu: Menu);
}

declare module 'app' {
  function on(eventName: string, callback: () => void);
  function getPath(pathName: string): string;
  function quit();
}

declare module 'crash-reporter' {
  function start();
}
