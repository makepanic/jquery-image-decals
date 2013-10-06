/*global
 $,
 require
 */
var FNNAME = 'imageComposer';

$.fn[FNNAME] = function (options) {
    'use strict';

    var defaults = {
            tools: []
        },
        settings = $.extend({}, defaults, options);

    this.each(function () {
        var $this = $(this),
            isImage,
            hasImageBackground,
            imgSrc,
            compImg;

        // check if $this is an image using the tagName
        isImage = (this.tagName === 'IMAGE' || this.tagName === 'IMG');

        // check if the background-image is set
        hasImageBackground = $this.css('background-image').length > 0;

        if (isImage || hasImageBackground) {

            imgSrc = isImage ? this.getAttribute('src') : $this.css('background-image');

//            compImg = new CompImg(imgSrc);
//            compImg.dimension(function (dimension) {
//                var x = dimension.x,
//                    y = dimension.y;
//
//                // init app
//
//            });

        } else {
            throw 'jquery-image-composer requires an image or element with background image to work';
        }

    });

    // returns the jQuery object to allow for chainability.
    return this;
}