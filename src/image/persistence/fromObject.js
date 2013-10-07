Img.prototype.toObject = function (obj) {
    var data = {};

    data = {
        width: this.width,
        height: this.height,
        src: this.src
    };

    return data;
};
