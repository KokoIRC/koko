![koko](./resource/logo.png)

Yet another IRC client for me and you :koko:

`ココ` is pronounced `koko`, which means `here` in Japanese.

# About `ココ`

`ココ` is an open source and free IRC client mainly for me and hopefully for others.

It provides simple UI and VIM-like shortcuts. It depends on the power of
HTML5, CSS and JavaScript through [Electron](http://electron.atom.io),
so you can customise it as you want.

The logo is strongly inspired by
[Campfire](https://color.adobe.com/Campfire-color-theme-2528696/) color theme.


# Features

* Built on Electron
* Cross platform
* VIM-like shortcuts
* Minimalistic design and function
* Several encoding support
* Free

# Development

If interested in the development, please refer to the [Issues](https://github.com/hachibasu/koko/issues) page.
There are still many things left to be done and every contribution will be welcomed.
Issues labelled `help wanted` are good ones to start from.

To install deps, build and run `koko` in Electron:

```bash
$ make dep # only for the first time to install deps
$ make run
```

To pack the app and create an executable: (currently only for OS X)

```bash
$ make dep # only for the first time to install deps
$ make package
```

# License
MIT
