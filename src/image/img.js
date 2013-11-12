var Img = function ($el) {
    'use strict';

    var el = $el[0],
        isImage,
        hasImageBackground,
        src;

    // check if $this is an image using the tagName
    isImage = (el.tagName === 'IMAGE' || el.tagName === 'IMG');

    // check if the background-image is set
    hasImageBackground = $el.css('background-image').length > 0;

    if (isImage || hasImageBackground) {
        src = isImage ? el.getAttribute('src') : $el.css('background-image');

        this.width = $el.width();
        this.height = $el.height();
        this.src = src;
        this.img = undefined;
        this.$el = $el;

    } else {
        throw 'jquery-image-composer requires an image or element with background image to work';
    }
};

require('./dimension');