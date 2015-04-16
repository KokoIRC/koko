import IrcWindow from './irc-window';
import Menu from 'menu';
import MenuItem from 'menu-item';

export default {
  initialize(app, mainUrl) {
    let template = [
      { label: 'koko',
        submenu: [
          { label: 'About koko',
            selector: 'orderFrontStandardAboutPanel:' },
          { type: 'separator' },
          { label: 'Services',
            submenu: [] },
          { type: 'separator' },
          { label: 'Hide koko',
            accelerator: 'Command+H',
            selector: 'hide:' },
          { label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:' },
          { label: 'Show All',
            selector: 'unhideAllApplications:' },
          { type: 'separator' },
          { label: 'Quit',
            accelerator: 'Command+Q',
            click: function() { app.quit(); } },
        ] },
      { label: 'Edit',
        submenu: [
          { label: 'Undo',
            accelerator: 'Command+Z',
            selector: 'undo:' },
          { label: 'Redo',
            accelerator: 'Shift+Command+Z',
            selector: 'redo:' },
          { type: 'separator' },
          { label: 'Cut',
            accelerator: 'Command+X',
            selector: 'cut:' },
          { label: 'Copy',
            accelerator: 'Command+C',
            selector: 'copy:' },
          { label: 'Paste',
            accelerator: 'Command+V',
            selector: 'paste:' },
          { label: 'Select All',
            accelerator: 'Command+A',
            selector: 'selectAll:' },
        ] },
      { label: 'View',
        submenu: [
          { label: 'Toggle DevTools',
            accelerator: 'Alt+Command+I',
            click: function() {
              IrcWindow.currentBrowserWindow().toggleDevTools(); } },
        ] },
      { label: 'Window',
        submenu: [
          { label: 'Minimize',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:' },
          { label: 'Close',
            accelerator: 'Command+W',
            selector: 'performClose:' },
          { type: 'separator' },
          { label: 'New Window',
            accelerator: 'Command+N',
            click: IrcWindow.create.bind(null, mainUrl) },
        ] },
      { label: 'Help',
        submenu: [] },
    ];

    let menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
};
