interface KeyboardEvent {
  keyIdentifier: string;
}

interface String {
  startsWith(needle: string): boolean;
  endsWith(needle: string): boolean;
  includes(needle: string): boolean;
  repeat(times: number): string;
}

interface Error {
  stack?: string;
}

interface ErrorConstructor {
  captureStackTrace: (_this: any, _constructor: any) => void;
}

declare class Notification {
  constructor(title: string, option: {
    title: string,
    body: string
  });
}
