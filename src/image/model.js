IMGCOMP.Img = function (src) {
    'use strict';

    this.width = -1;
    this.height = -1;
    this.ready = false;
    this.src = src;
    this.img = undefined;
};

require('./dimension');
require('./persistence/fromObject');
require('./persistence/toObject');