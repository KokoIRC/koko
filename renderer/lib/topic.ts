class Topic {
  text: string;
  by: string;
  constructor(text: string, by?: string) {
    this.text = text;
    this.by = by;
  }

  get fullText() {
    return this.by ? `"${this.text}" set by ${this.by}` : this.text;
  }
}

export = Topic;
