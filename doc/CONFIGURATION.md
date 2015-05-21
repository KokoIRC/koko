# Configuration

There are two kinds of configuration. One is default config, and the other is
surely user config. Basically every default config is also configurable with
the user config. So it may be worth describing the default config first.

## Default configuration

The default config files are placed in the [config](../config) directory of the
project. Each config is described below in the form of `key: default`.

### `app`

It contains configs of the app's basic behaviour.

##### `scrollback-limit: 1000`
The maximum number of logs per buffer

##### `input-history-limit: 100`
The maximum number of input histories preserved per window

##### `shortcut-serial-input-timeout: 800`
The timeout to input a serial shortcut inputs, in milliseconds

##### `command-symbol: '/'`
The symbol with which commands start

##### `root-channel-name: '~'`
The name of the root channel

* it must be different from possible channel names
* it must be different from possible nick names

### `keys`

It contains shortcut configs. For more information of each shortcut,
please refer to the [default shortcuts](USERGUIDE.md#default-shortcuts) section
of the [user guide] (USERGUIDE.md).

##### `message: ["i"]`
##### `command: ["/"]`
##### `exit: ["esc", "ctrl+c"]`
##### `next-tab: ["g>t"]`
##### `previous-tab: ["g>T"]`
##### `scroll-down: ["j"]`
##### `scroll-up: ["k"]`
##### `scroll-top: ["g>g"]`
##### `scroll-bottom: ["G"]`
##### `page-down: ["ctrl+f"]`
##### `page-up: ["ctrl+b"]`
##### `input-history-back: ["up"]`
##### `input-history-forward: ["down"]`
##### `autocomplete: ["tab"]`

## User configuration

User config can be set with done with `.koko.yml` in each user's home
directory.

```bash
$ vi ~/.koko.yml
```

Basically, every category and field of the default config can be overwritten.

```yml
# .koko.yml
app:
  scrollback-limit: 20000
  root-channel-name: '$'

keys:
  message: ["M"] # or "shift+m" works too
  next-tab: ["ctrl+tab"]
  scroll-down: ["d>d"]
```

Also, there are configs which is configurable only in the user config. The
following categories are some configs of the case.

### `user`

Default user information for every server. Each field is configurable in
server config too.

```yml
user:
  nick: octocat
  username: octocat
  realname: octocat
```

### `servers`

Servers to be shown in a select box in the server form of `ココ`. Not to fill
the form everytime connecting to servers, it's mandatory to set this config.

`servers` config is a list of server configs. Each server config
should contain `name` and `host`. `port` and `encoding` are optional. If there's
no value set for the optional fields, default values are used(`6667` and
`UTF-8`). Lastly, the fields in the `user` config(`nick`, `username`
and `realname`) can be set in each server config too.

```yml
servers:
  - name: HanIRC
    host: irc.hanirc.org
    encoding: CP949
    nick: doge
  - name: Freenode
    host: irc.freenode.net
    port: 8080
    realname: octokat
```

## Example

Here is an example `.koko.yml`

```yml
app:
  scrollback-limit: 20000
  root-channel-name: '$'

keys:
  message: ["M"]
  next-tab: ["ctrl+tab"]
  scroll-down: ["d>d"]

user:
  nick: octocat
  username: octocat
  realname: octocat

servers:
  - name: HanIRC
    host: irc.hanirc.org
    encoding: CP949
    nick: doge
  - name: Freenode
    host: irc.freenode.net
    port: 8080
    realname: octokat
```

## Need more help!

Please...

* Upload an issue in [Issues](https://github.com/hachibasu/koko/issues)
* Drop an email to any member of [Hachimitsu Busters](http://hachibasu.github.io)
