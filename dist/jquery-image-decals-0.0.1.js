/*global
 $,
 require
 */

$.fn.imageDecals = function (options) {
    'use strict';

    var defaults = {
            tools: []
        },
        settings = $.extend({}, defaults, options);


var _lastId = 0,
    uid = function () {
        _lastId += 1;
        return 'image-composer-uid-' + _lastId;
    };


var DecalComposer = function ($target, opts) {

    console.log('constructor');

    // bootstrap layout elements

    var that = this,
        noop = function () {},
        defaults = {
            scaleDecalDimension: false,
            domain: {
                width: 100,
                height: 100
            },
            decals: [],
            data: [],
            events: {
                onDecalClicked: noop
            }
        };

    this.img = new Img($target);

    this.cfg = $.extend({}, defaults, opts);
    this.scale = {
        width: 1,
        height: 1
    };

    this.img.dimension(function () {
        that.init();
    });

    this.events = this.cfg.events;
    this.$target = $target;
};
DecalComposer.prototype = {
    toJSON: function () {
        var obj = this.decalHolder.toObject();

        return JSON.stringify(obj);
    },
    init: function () {
        console.log('init');

        var that = this,
            decalObj,
            elImgDecals = $('<div class="image-composer-decals"></div>'),
            elPalette = $('<div class="image-composer-palette"></div>');

        this.scale.width = this.img.width / this.cfg.domain.width;
        this.scale.height = this.img.height / this.cfg.domain.height;

        console.log('scale', this.scale, 'domain', this.cfg.domain);
        console.log('img', this.img.width, this.img.height);

        this.renderer = new DecalCanvasRenderer(this.$target, this.img);

        // create decalHolder container
        this.renderer.$target.parent().find('.image-composer-canvas').append(elImgDecals);
        this.decalHolder = new DecalHolder(elImgDecals, {
            scaleDecalDimension: this.cfg.scaleDecalDimension,
            dimension: {
                width: this.img.width,
                height: this.img.height
            },
            scale: this.scale,
            items: []
        });
        this.decalHolder.$target.on('decal-item-clicked', function (e, data) {
            that.events.onDecalClicked.call(e.target, e, data.decal);
        });

        // create palette container
        this.renderer.$target.parent().append(elPalette);
        this.decalPalette = new DecalPalette(elPalette, this.cfg.decals);
        this.decalPalette.$target.on('decal-palette-item-clicked', function (e, data) {
            that.decalHolder.addDecal(new Decal(that.cfg.decals[data.decal.key]));
        });

        this.cfg.data.forEach(function (item) {
            // clone cfg object

            decalObj = $.extend(true, {}, that.cfg.decals[item.key]);
            decalObj.width = item.width;
            decalObj.height = item.height;
            decalObj.left = item.left;
            decalObj.top = item.top;

            that.decalHolder.addDecal(new Decal(decalObj), true);
        });

        console.log('rendering everything');

        this.decalHolder.render();
        this.decalPalette.render();
    }
};

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

    } else {
        throw 'jquery-image-composer requires an image or element with background image to work';
    }
};


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

var DecalHolder = function ($target, cfg) {
    'use strict';

    var that = this,
        i;

    this.scale = cfg.scale;
    this.items = cfg.items;
    this.scaleDecalDimension = cfg.scaleDecalDimension;
    this.itemsMap = {};

    for (i = 0; i < this.items.length; i += 1) {
        this.itemsMap[this.items[i].uid] = this.items[i];
    }

    // config stuff
    this.cfg = cfg;
    this.$target = $target;
    this.$target.css('width', cfg.dimension.width + 'px');
    this.$target.css('height', cfg.dimension.height + 'px');

    this.$target.on('click', 'span', function (e) {
        console.log('span clicked', e);
        if (e.target && e.target.getAttribute('data-uid')) {
            var decalId = e.target.getAttribute('data-uid'),
                decal = that.itemsMap.hasOwnProperty(decalId) ? that.itemsMap[decalId] : undefined;

            that.$target.find('.image-composer-decal-selected').removeClass('image-composer-decal-selected');
            $(e.target).addClass('image-composer-decal-selected');
            that.$target.trigger('decal-item-clicked', {
                decal: decal
            });
        }
    });
};
DecalHolder.prototype = {
    render: function () {
        'use strict';

        var frag = document.createDocumentFragment(),
            that = this,
            span;

        this.items.forEach(function (item) {

            // basic item element bootstrap
            span = that._createElement(item);
            frag.appendChild(span);
            
        });

        this.$target.append(frag);
        this._applyDraggable();
    },
    _applyDraggable: function () {
        var that = this;

        this.$target.find('.draggable').draggable({
            // limit movement to parent container
            containment: 'parent',

            stop: function (e, ui) {
                // once drag is done, update decal positions
                var uid = e.target.getAttribute('data-uid');

                that.itemsMap[uid].left = ui.position.left;
                that.itemsMap[uid].top = ui.position.top;

                that.items.every(function (item) {
                    var found = false;

                    if (item.uid === uid) {
                        item.left = ui.position.left;
                        item.top = ui.position.top;
                        found = true;
                    }

                    return !found;
                });
            }
        });
    },
    _createElement: function (item) {
        var span = document.createElement('span'),
            intFn = Math.floor;

        console.log('createElement from', item);

        span.className = item.key + ' draggable';
        span.title = item.title;
        span.setAttribute('data-uid', item.uid);
        span.style.backgroundImage = 'url(' + item.src + ')';

        if (this.scaleDecalDimension) {
            span.style.width = intFn(this.scale.width * item.width) + 'px';
            span.style.height = intFn(this.scale.height * item.height) + 'px';
        } else {
            span.style.width = item.width + 'px';
            span.style.height = item.height + 'px';
        }

        span.style.left = intFn(this.scale.width * item.left) + 'px';
        span.style.top = intFn(this.scale.height * item.top) + 'px';
        return span;
    },
    renderOne: function (from) {
        var item,
            span;

        from = Object.prototype.toString.call(from) === '[object Number]' ? from : -1;
        if (from !== -1) {
            item = this.items[from];
            span = this._createElement(item);
            this.$target.append(span);
            this._applyDraggable();
        }
    },
    addDecal: function (decal, skipRender) {
        this.items.push(decal);
        this.itemsMap[decal.uid] = decal;

        if (!skipRender) {
            this.renderOne(this.items.length - 1);
        }
    },
    removeDecal: function (decal) {
        var removeIndex = -1,
            found = false;

        console.log('removing', decal);

        this.items.every(function (item, index) {
            if (item.uid === decal.uid) {
                removeIndex = index;
                found = true;
            }

            // inverse found because we want to break on found but .every breaks on false
            return !found;
        });

        if (removeIndex !== -1 && found) {
            delete this.itemsMap[decal.uid];
            this.items.splice(removeIndex, 1);
            this.$target.find('[data-uid=' + decal.uid + ']').remove();
        }
    }
};


var Decal = function (cfg) {
    this.key = cfg.key;
    this.src = cfg.src;
    this.width = cfg.width || -1;
    this.height = cfg.height || -1;
    this.left = cfg.left;
    this.top = cfg.top;
    this.title = cfg.title || '';
    this.uid = uid();
};

DecalHolder.prototype.toObject = function (obj) {
    var storage = [],
        data,
        $obj;

    this.items.forEach(function (item) {

        $obj = $('[data-uid=' + item.uid + ']');

        data = {
            key: item.key,

            // could be later replaced for rendered width/height
            width: item.width,
            height: item.height,
            left: item.left,
            top: item.top
        };

        storage.push(data);
    });

    return storage;
};


var DecalPalette = function ($target, itemsMap) {
    var that = this,
        item;

    this.items = [];
    this.itemsMap = itemsMap;

    for (item in this.itemsMap) {
        if (this.itemsMap.hasOwnProperty(item)) {
            this.items.push(new Decal(this.itemsMap[item]));
        }
    }

    this.$target = $target;
    this.$target.on('click', '.decal-palette-item', function (e) {
        if (e.target && e.target.getAttribute('data-key')) {
            var decalId = e.target.getAttribute('data-key'),
                decal = that.itemsMap.hasOwnProperty(decalId) ? that.itemsMap[decalId] : undefined;

            that.$target.trigger('decal-palette-item-clicked', {
                decal: decal
            });
        }
    });
};
DecalPalette.prototype = {
    render: function () {
        var frag = document.createDocumentFragment(),
            i,
            span,
            item;

        for (i = 0; i < this.items.length; i += 1) {
            item = this.items[i];

            // basic item element setup
            span = document.createElement('div');
            span.className = 'decal-palette-item';
            span.setAttribute('data-key', item.key);
            span.style.backgroundImage = 'url(' + item.src + ')';
            span.style.width = item.width + 'px';
            span.style.height = item.height + 'px';

            frag.appendChild(span);
        }

        this.$target.append(frag);
    }
}

var DecalCanvasRenderer = function ($target, compImg) {
    if (!compImg instanceof Img) {
        throw 'need Img instance to render';
    }

    $target.wrap('<div class="image-composer-wrap"></div>');

    this.$target = $target;
    this.compImg = compImg;

    this.place();
};

DecalCanvasRenderer.prototype.place = function () {
    'use strict';

    this.$target.hide();

    var imgContainer = document.createElement('div');

    imgContainer.className = 'image-composer-canvas';
    imgContainer.appendChild(this.compImg.img);

    // place canvas for image

    this.$target.after(imgContainer);
}

    this.each(function () {
        var $this = $(this),
            imageDecals = new DecalComposer($this, settings);
            $this.data('imageDecals', imageDecals);
    });

    // returns the jQuery object to allow for chainability.
    return this;
}