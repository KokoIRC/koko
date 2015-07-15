# User Guide

## Install

Currently, the application pacakge only for OS X is downloadable in the
[releases](https://github.com/noraesae/koko/releases) page. To install, move
the `koko.app` to `Applications` and that's it. Security setting may be needed
to run `ココ` for recent versions of OS X.

Packages for other platforms will be supported in the near future.

## Basic usage

When connecting to a server properly, you'll see an IRC view. Basically, there's
no much mouse interaction needed to use `ココ`. Everything can be done with
a keyboard, so it's important to check the basic shortcuts and commands.
shortcuts are surely configurable. How to configure them is described in the
[configuration](CONFIGURATION.md) documentation.

First, like using VIM's commmand and insert modes, we can focus the text
input of the view pressing `i` or `/`. To return to the normal mode just press
`esc` in the input mode.

In the input mode, you can input commmands or just a message. The type and
usage of commands are described later.

In the normal mode, you can scroll logs, move to tabs or etc. The shortcuts are
described in the following section.

## Default shortcuts

The shortcuts are described in the format like below:

###### `(key)` (Working modes)
(Description)

* `(key)>(key)` means pressing the keys sequentially.
* `(key)+(key)` means pressing the keys simultaniously.
* `shift+(lower character)` can also be written `(upper character)`.

#### `i` Normal
Enter to input mode

#### `/` Normal
Enter to input mode, but with a command character `/` at the beginning

#### `esc`, `ctrl+c` Input
Exit from input mode, enter to normal mode

#### `g>t` Normal
Move to a next tab

#### `g>T` Normal
Move to a previous tab

#### `j`, `k` Normal
Scroll logs down and up

#### `g>g`, `G` Normal
Scroll logs to top and bottom

#### `ctrl+f`, `ctrl+b` Normal
Scroll logs one page down and up

#### `up`, `down` Input
Looking up input histories

#### `tab` Input
Autocomplete usernames


## Commands

As explained in the [basic usage](#basic-usage) section, to input commands, `ココ`
should be in the input mode. Commands start with a command character, `/` by default.
This character is also configurable. About the configuration, please refer to
the [configuration](CONFIGURATION.md) documentation. In this section, we'll explain
with the default symbol `/`.

The commands are described in the format like below:

###### `/(command) (...arguments)`
(Description)

* Arguments are space-separated.
* `(?arg)` means it's optional.
* `(...arg)` means it's a space-separated array.
* `(!arg)` means it's a text that can contain spaces. It's always optional.

#### `/join (channel)`
Join a channel.

* `#` can be omitted from the channel name.

#### `/part (?channel) (!message)`
Part a channel.

* If no channel name is provided, part the current channel or personal chat.
* If no message is provided, use the default message used in `node-irc`.

#### `/ctcp (target) (type) (!text)`
Send a ctcp.

#### `/action (target) (!message)`
Do an action.

#### `/whois (nick)`
See the information of a user.


#### `/nick (nick)`
Change my nick to the provided `nick`.

#### `/mode (?channel) (mode) (nick)`
Give a mode to a user in a channel

* If no channel name is provided, use the current channel.
* `mode` can be `+(mode character)`, `-(mode character)` and just `(mode character)`.
  If no `+` or `-` is provided, `+` is used by default.
  The mode character is like `v` or `o`.

#### `/kick (?channel) (nick) (!message)`
Kick a user from a channel.

* If no channel name is provided, use the current channel.
* If no message is provided, use the default message used in `node-irc`.

#### `/ban (?channel) (nick)`, `/unban (?channel) (nick)`
Just sugars for `/mode (channel) +/-b (nick)`. Ban or unban a user from a channel.

#### `/kickban (?channel) (nick) (!message)`
Just a sugar to do `/kick` and `/ban` at the same time. Kick and ban a user from a channel.

#### `/topic (?channel) (!topic)`
Set or show the topic of a channel.

* If no channel name is provided, use the current channel.
* If no parameter is provided at all, just show the topic of the current channel.

#### `/msg (nick) (!message)`
Send a personal message and start a personal chat.

#### `/quote (command) (...args)`, `/raw (command) (...args)`
Send a raw IRC message.

### For developers

This small section is for developers finding information about implementing
or fixing commands. If not interested, please ignore this section.

Most of the commands are placed in `irc-command.ts` in browser. However, some
cases are handled in renderer process, specifically in `irc-view.ts`. Here are
the cases.

* `/topic` without any parameter
* `/part` from a personal chat
* `/msg` to open a new buffer.

The reason they aren't handled in `irc-command.ts`, but in `irc-view.ts`, is that
the cases cannot or needn't be handled in backend with `node-irc`. You can find
the local handler, `tryHandleLocally()` in `irc-view.ts`.

We know it doesn't seem good, but we're afriad they'll remain for the time being.

## Need more help!

Please...

* Upload an issue in [Issues](https://github.com/noraesae/koko/issues)
* Drop an email to [contributors](https://github.com/noraesae/koko/graphs/contributors)
