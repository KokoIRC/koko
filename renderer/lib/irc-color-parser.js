import _ from 'underscore';
import irc from 'irc';

export default class IrcColorParser {
  constructor(text) {
    this.text = text;
    this._idx = 0;
    this._reversed = false;
    this._colorCount = 0;
  }

  replaceTextStyle(code, className) {
    let tag = `<span class='${className}'>`;
    this.text = this.text.replace(code, tag);
    this._colorCount += 1;
    this._idx += tag.length;
  }

  getCodes() {
    let code = '';
    let bgCode = '';
    let originalCode = '';
    let isBg = false;
    for (let i = 1; ; i++) {
      let codeChunk = this.text[this._idx + i];
      if (_.isNaN(parseInt(codeChunk, 10))) {
        if (code.length > 0 && codeChunk === ',') {
          originalCode += ',';
          isBg = true;
        } else {
          break;
        }
      } else {
        if (isBg) {
          bgCode += codeChunk;
        } else {
          code += codeChunk;
        }
        originalCode += codeChunk;
      }
    }
    code = code.length === 0 ? 1 : code;
    code = (parseInt(code, 10) % 16) + '';
    code = code.length === 1 ? '0' + code : code;
    if (bgCode) {
      bgCode = (parseInt(bgCode, 10) % 16) + '';
      bgCode = bgCode.length === 1 ? '0' + bgCode : bgCode;
    }
    return [code, bgCode, originalCode];
  }

  toClassName(code) {
    let camelcased = _.invert(irc.colors.codes)['\u0003' + code];
    if (camelcased) {
      return camelcased.replace(/([A-Z])/g, '-$1').toLowerCase();
    } else {
      return '';
    }
  }

  process() {
    while (true) {
      let c = this.text[this._idx];
      if (c === '\u0003') {
        let [code, bgCode, originalCode] = this.getCodes();
        let colorName = this.toClassName(code);
        let bgColorName = bgCode ? 'bg-' + this.toClassName(bgCode) : '';
        let spanTag = `<span class='${colorName} ${bgColorName}'>`;
        this.text = this.text.replace('\u0003' + originalCode, spanTag);
        this._colorCount += 1;
        this._idx += spanTag.length;
      } else if (c === '\u0002') {
        this.replaceTextStyle('\u0002', 'bold');
      } else if (c === '\u001f') {
        this.replaceTextStyle('\u001f', 'underline');
      } else if (c === '\u0016') {
        if (!this._reversed) {
          this.replaceTextStyle('\u0016', 'reverse');
          this._reversed = true;
        } else {
          let closeSpanTag = "</span>";
          this.text = this.text.replace('\u0016', closeSpanTag);
          this._colorCount -= 1;
          this._reversed = false;
          this._idx += closeSpanTag.length;
        }
      } else if (c === '\u000f') {
        let closeSpanTag = '</span>'.repeat(this._colorCount);
        this.text = this.text.replace('\u000f', closeSpanTag);
        this._colorCount = 0;
        this._reversed = false;
        this._idx += closeSpanTag.length;
      } else if (_.isUndefined(c)) {
        break;
      } else {
        this._idx += 1;
      }
    }
    if (this._colorCount > 0) {
      this.text = this.text + '</span>'.repeat(this._colorCount);
    }
    return this.text;
  }
};
