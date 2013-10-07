Img = function ($el) {
    'use strict';

    var el = $el[0];

    this.width = $el.width();
    this.height = $el.height();
    this.src = el.getAttribute('src');
    this.img = undefined;
};

require('./dimension');
require('./persistence/fromObject');
require('./persistence/toObject');