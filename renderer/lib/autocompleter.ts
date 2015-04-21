import _ = require('underscore');

class Autocompleter {
  private completeIdx: number;
  private wordsToComplete: string[];
  private names: string[];

  constructor() {
    this.completeIdx = -1;
    this.wordsToComplete = [];
    this.names = [];
  }

  setNames(names: string[]) {
    if (_.isArray(names)) {
      this.names = names;
    }
  }

  complete(word: string): string {
    if (this.wordsToComplete.length > 0 && this.completeIdx >= 0) {
      this.completeIdx = (this.completeIdx + 1) % this.wordsToComplete.length;
      return this.wordsToComplete[this.completeIdx];
    } else {
      let properNames = this.names.filter(n => n.indexOf(word) === 0);
      if (properNames.length === 0) {
        return null;
      } else if (properNames.length === 1) {
        return properNames[0];
      } else {
        this.wordsToComplete = properNames;
        this.completeIdx = 0;
        return properNames[0];
      }
    }
  }

  reset() {
    this.wordsToComplete = [];
    this.completeIdx = -1;
  }
}

export = Autocompleter;
