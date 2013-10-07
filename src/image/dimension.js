/*global
 $,
 Image,
 CompImg
 */

Img.prototype.dimension = function (done) {
    'use strict';

    var img,
        that = this,
        imageLoaded = function () {

            that.width = this.width;
            that.height = this.height;

            if (Object.prototype.toString.call(done) === '[object Function]') {
                done({
                    x: this.width,
                    y: this.height
                });
            }
        };

    img = new Image();
    img.onload = imageLoaded;
    img.src = this.src;

    this.img = img;
};