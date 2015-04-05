import _ from 'underscore';
import app from '../../config/app';

const configs = {app};
const defaultConfigType = 'app';

export default {
  get(typeOrName, name) {
    let type;
    if (_.isUndefined(name)) {
      type = defaultConfigType;
      name = typeOrName;
    } else {
      type = typeOrName;
      name = name;
    }

    return configs[type][name];
  }
}
