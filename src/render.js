/*global require, Img */

/**
 * Function that wraps an target with a wrapper
 * @param $target
 * @param compImg
 * @param noInteraction
 * @constructor
 */
var DecalCanvasRenderer = function ($target, compImg, noInteraction) {
    if (!compImg instanceof Img) {
        throw 'need Img instance to render';
    }

    $target.wrap('<div class="image-composer-wrap' + (noInteraction ? ' image-no-interaction' : '') + '"></div>');

    this.$target = $target;
    this.compImg = compImg;

    this.place();
};

/**
 * puts an image-composer-canvas after the initial image and hides the image
 */
DecalCanvasRenderer.prototype.place = function () {
    'use strict';

    this.$target.hide();

    var imgContainer = document.createElement('div');
    imgContainer.className = 'image-composer-canvas';
    imgContainer.appendChild(this.compImg.img);

    // place canvas for image

    this.$target.after(imgContainer);
};