let configs: any = _require('remote').getGlobal('configuration');

export = {
  setConfigs(loadedConfigs: any) {
    configs = loadedConfigs;
  },
  getConfig(configName: string): any {
    return configs[configName];
  },
  get(configName: string, fieldName: string): any {
    return configs[configName][fieldName];
  }
};
