var app = require('../../config/app');
var key = require('../../config/keys');

import _ = require('underscore');

const configs = {app, key};
const defaultConfigType = 'app';

export = {
  getConfig(configName: string): any {
    return configs[configName];
  },
  get(typeOrName: string, name?: string): any {
    let type;
    if (_.isUndefined(name)) {
      type = defaultConfigType;
      name = typeOrName;
    } else {
      type = typeOrName;
      name = name;
    }

    return this.getConfig(type)[name];
  }
}
