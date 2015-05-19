import _ = require('underscore');
import fs = require('fs');
import path = require('path');
import yaml = require('js-yaml');

const configDir = path.join(__dirname, '../config');

export function load(): any {
  let configs = fs.readdirSync(configDir);
  configs = configs
    .filter(c => c.endsWith('.yml'))
    .reduce((result: any, c) => {
      let ymlContent = fs.readFileSync(path.join(configDir, c)).toString();
      result[path.basename(c, path.extname(c))] = yaml.load(ymlContent);
      return result;
    }, {});
  return configs;
}
