# Contribution

## Opening

First of all, thank you very much for your contribution on `ココ`. We started
this project mainly for our own pleasure, and we will be really happy to share
the pleasure with you guys. Please come and help us!

We welcome every kind of contribution including reporting bugs, suggesting new
features, or uploading pull requests(will love this the most!).

## What and how to do

If you have any suggestion or bugs to fix, it's good to start from implementing
or fixing them by yourself. It gives us brilliant feeling that we're contributing
and helping. Most of all, the project is maintained by a very small group and
without your help, it will take tons of time to improve. Please don't worry
and try doing it first. This document is to help you, and we will also help as
much as we can.

If you don't have anything you'd like to add for the time being,
[`help wanted` issues](https://github.com/noraesae/koko/labels/help%20wanted)
are the best point to start from. We will keep posting parts to implement. However,
we will be happier if others do it. To participate in the process,
just drop a reply and that may be it.

Lastly, Jun who wrote the first version of this documentations is not a native
English speaker, so there must be grammatical errors everywhere. It will be really
helpful if they can be corrected!

## 3rd parties

Before implementing something, here is the list of components used in this
project. If you already know them, please just skip this section. Unless,
please check them out as they are awesome libraries and tools by themselves.

* [Electron](http://electron.atom.io): `nw.js` based shell where `ココ` is running
* [TypeScript](http://typescriptlang.org): JavaScript superset helping us use JavaScript in type-safe and elegant way
* [React](http://reactjs.com): Frontend framework built by Facebook
  * [TypedReact](https://github.com/Asana/typed-react): A binding layer between React and TypeScript
* [Browserify](http://browserify.org): Frontend JavaScript packager letting us `require('modules')`
* [Less](http://lesscss.org): A CSS preprocessor
* [noraesae/irc](https://github.com/noraesae/irc): A clone of [martynsmith/node-irc](https://github.com/martynsmith/node-irc)
to add encoding support and some additional sugars.
  * [Documentation](https://node-irc.readthedocs.org/en/latest/) of the original `node-irc`.

## How to run `ココ`

##### Currently only for OS X. Cross platform support is also a thing to be done. Please help!

```bash
$ git clone git@github.com:noraesae/koko.git
```

To install deps, usually only for the first time unless there are additional modules.

```bash
$ make dep
```

To build and run `ココ` in Electron:

```bash
$ make build # Only to build, mainly to check if it builds well
$ make run # build and run
```

To pack the app and create an executable

```bash
$ make package
```

For the details, please refer to `Makefile` as it's simple enough.

## Project structure

Firstly, here is the directory structure of `ココ`.

* browser: backend scripts to be run by browser process
* renderer: frontend scripts to be run by renderer process, mainly React components
  * lib: also frontend scripts, which are not React components
* config: config yml files
* doc: documentations
* lib.d: TypeScript type definition files, mainly from [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped)
* resource: static assets
* style: `.less` stylesheets

Basically, there are two main parts in an Electron app. One is browser process
and the other is renderer process. You can think that the browser process is
backend in a normal Node.js app and the renderer one is frontend. The browser
process manages the entire windows and runs backend logic. The renderer process
draws a browser view and runs client-side logic. Electron basically provides ways
for them to communicate with each other, mainly by IPC(socket). In `ココ`, we
also separate browser and renderer scripts and make them communicate with IPC.

The logic inside the scripts is not so complicated. If you have basic knowledge
of the 3rd parties described above, you may not have difficulty in looking
around source codes. But if any, please feel free to ask us.

## Need more help!

Please...

* Upload an issue in [Issues](https://github.com/noraesae/koko/issues)
* Drop an email to [contributors](https://github.com/noraesae/koko/graphs/contributors)
