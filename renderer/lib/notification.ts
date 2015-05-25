export function show(target: string, nick: string, body: string) {
  let title = target === nick ? nick : `${nick} in ${target}`;
  new Notification(title, {title, body});
}
