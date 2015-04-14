export default {
  getMeta(src, onload, onerror) {
    let img = new Image();
    img.src = src;
    img.onload = function () {
      let width = parseInt(this.width, 10);
      let height = parseInt(this.height, 10);
      onload(width, height);
    };
    img.onerror = onerror;
  }
};
