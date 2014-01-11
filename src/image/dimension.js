/*global Img */

/**
 * Function to calculate dimension of an image
 * @param {Boolean} useSrcDimension loads the image and uses the loaded ressource dimension
 * @param {Function} done callback if it calculated the dimension
 */
Img.prototype.dimension = function (useSrcDimension, done) {
    'use strict';

    var img,
        that = this,
        imageLoaded,
        doneIsFn = (Object.prototype.toString.call(done) === '[object Function]');

    if (useSrcDimension) {
        // load dimension based on src
        imageLoaded = function () {
            // this represents the HTMLImageElement
            that.width = this.width;
            that.height = this.height;

            if (doneIsFn) {
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

    } else {
        // load dimension based on existing dom element
        this.width = this.$el.width();
        this.height = this.$el.height();

        if (doneIsFn) {
            img = new Image();
            img.onload = function () {
                done({
                    x: that.width,
                    y: that.height
                });
            };
            img.src = this.src;
            this.img = img;
        }

    }

};