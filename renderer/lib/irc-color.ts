import _ = require('underscore');

const ircColors = [
  'white',
  'black',
  'dark-blue',
  'dark-green',
  'light-red',
  'dark-red',
  'magenta',
  'orange',
  'yellow',
  'light-green',
  'cyan',
  'light-cyan',
  'light-blue',
  'light-magenta',
  'gray',
  'light-gray',
];

class Color {
  type: string;
  index: number;
  length: number;
  color: string;
  bgColor: string;

  constructor(type: string, index: number, length: number, color?: string, bgColor?: string) {
    this.index = index;
    this.length = length;
    this.type = type;
    this.color = color;
    this.bgColor = bgColor;
  }

  static parse(text: string): Color[] {
    let result: Color[] = [];
    result = result.concat(Color.colorsOf(text));
    result = result.concat(Color.symbolsOf(text, '\u0002', 'bold'));
    result = result.concat(Color.symbolsOf(text, '\u001f', 'underline'));
    result = result.concat(Color.symbolsOf(text, '\u0016', 'reverse'));
    result = result.concat(Color.symbolsOf(text, '\u000f', 'close'));
    return _.sortBy(result, 'index');
  }

  static colorsOf(text: string): Color[] {
    let result: Color[] = [];
    let idx = 0;
    while (true) {
      idx = text.indexOf('\u0003', idx);
      if (idx < 0) {
        break;
      }

      let startIdx = idx;
      let color, bgColor;
      let colorCode = '';
      idx++;
      while (/[0-9]/.test(text[idx]) && colorCode.length <= 2) {
        colorCode += text[idx];
        idx++;
      }
      colorCode = '0'.repeat(2 - colorCode.length) + colorCode;
      color = ircColors[parseInt(colorCode, 10) % 16];
      if (text[idx] === ',') {
        colorCode = '';
        idx++;
        while (/[0-9]/.test(text[idx]) && colorCode.length <= 2) {
          colorCode += text[idx];
          idx++;
        }
        colorCode = '0'.repeat(2 - colorCode.length) + colorCode;
        bgColor = ircColors[parseInt(colorCode, 10) % 16];
      }
      result.push(new Color('color', startIdx, idx - startIdx, color, bgColor));
    }
    return result;
  }

  static symbolsOf(text: string, code: string, type: string): Color[] {
    let result: Color[] = [];
    let idx = 0;
    while (true) {
      idx = text.indexOf(code, idx);
      if (idx < 0) {
        break;
      }
      result.push(new Color(type, idx, 1));
      idx++;
    }
    return result;
  }
}

export = Color;
