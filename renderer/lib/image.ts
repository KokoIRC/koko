interface ImageSizeCallback {
  (width: number, height: number): void;
}

export = {
  getMeta(src: string, onload: ImageSizeCallback, onerror: (e) => void) {
    let img = new Image();
    img.src = src;
    img.onload = function () {
      let width = this.width;
      let height = this.height;
      onload(width, height);
    };
    img.onerror = onerror;
  }
};
