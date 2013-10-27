/*global
 jQuery,
 require
 */

jQuery.fn.imageDecals = function (options) {
    'use strict';

    var defaults = {
            tools: []
        },
        settings = jQuery.extend({}, defaults, options);


var _lastId = 0,
    uid = function () {
        _lastId += 1;
        return 'image-composer-uid-' + _lastId;
    };

var Events = {
    decalItemFocusChanged: 'decal-item-focus-changed',
    decalPaletteItemClicked: 'decal-palette-item-clicked',
    decalActionClicked: 'decal-action-clicked',
    decalItemClicked: 'decal-item-clicked'
};


var DecalComposer = function ($target, opts) {

    var that = this,
        noop = function () {},
        defaults = {
            actions: [],
            actionBar: undefined,
            showActions: false,
            actionTemplate: undefined,

            resizable: false,
            showPalette: false,
            clickable: false,
            draggable: false,
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

    this.selectedDecal = null;
    this.img = new Img($target);

    this.cfg = jQuery.extend({}, defaults, opts);
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
        var that = this,
            decalObj,
            elImgDecals = jQuery('<div class="image-composer-decals"></div>'),
            elPalette = jQuery('<div class="image-composer-palette"></div>');

        this.scale.width = this.img.width / this.cfg.domain.width;
        this.scale.height = this.img.height / this.cfg.domain.height;

        this.renderer = new DecalCanvasRenderer(this.$target, this.img);

        // create decalHolder container
        this.renderer.$target.parent().find('.image-composer-canvas').append(elImgDecals);

        this.decalHolder = new DecalHolder(elImgDecals, {
            resizable: this.cfg.resizable,
            modifier: this.cfg.modifier,
            clickable: this.cfg.clickable,
            draggable: this.cfg.draggable,
            scaleDecalDimension: this.cfg.scaleDecalDimension,
            dimension: {
                width: this.img.width,
                height: this.img.height
            },
            scale: this.scale,
            items: []
        });

        this.decalHolder.$target.on(Events.decalItemClicked, function (e, data) {
            that.selectedDecal = data.decal;
            that.actionBar.$target.show();
            that.events.onDecalClicked.call(e.target, e, data.decal);
        });
        this.decalHolder.$target.on(Events.decalItemFocusChanged, function (e, data) {
            if (data.focus === false) {
                that.selectedDecal = null;
                that.actionBar.$target.hide();
            }
        });

        // create palette container
        if (this.cfg.showPalette) {
            this.renderer.$target.parent().append(elPalette);
            this.decalPalette = new DecalPalette(elPalette, this.cfg.decals);
            this.decalPalette.$target.on(Events.decalPaletteItemClicked, function (e, data) {
                that.decalHolder.addDecal(new Decal(that.cfg.decals[data.decal.key]));
            });
        }

        if (this.cfg.showActions) {
            // decal-action-clicked
            this.actionBar = new DecalActionBar(this.cfg.actionBar, {
                actions: this.cfg.actions,
                actionTemplate: this.cfg.actionTemplate
            });
            this.actionBar.$target.on(Events.decalActionClicked, function (e, data) {
                var action = data.action;
                action.trigger(that.selectedDecal, e, that.decalHolder);
            });
        }

        this.cfg.data.forEach(function (item) {
            // clone cfg object

            decalObj = jQuery.extend(true, {}, that.cfg.decals[item.key]);
            decalObj.width = item.width;
            decalObj.height = item.height;
            decalObj.left = item.left;
            decalObj.top = item.top;
            decalObj.allowModifier = that.cfg.allowModifier;

            that.decalHolder.addDecal(new Decal(decalObj), true);
        });

        this.decalHolder.render();

        if (this.cfg.showPalette) {
            this.decalPalette.render();
        }
        if (this.cfg.showActions) {
            this.actionBar.$target.hide();
            this.actionBar.render();
        }

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

    this.cfg = cfg;
    this.$target = $target;
    this.$target.css('width', cfg.dimension.width + 'px');
    this.$target.css('height', cfg.dimension.height + 'px');

    if (this.cfg.clickable) {
        this.$target.on('click', 'span', function (e) {
            if (e.target && e.target.getAttribute('data-uid')) {
                var decalId = e.target.getAttribute('data-uid'),
                    decal = that.itemsMap.hasOwnProperty(decalId) ? that.itemsMap[decalId] : undefined;

                that.$target.find('.image-composer-decal-selected').removeClass('image-composer-decal-selected');
                jQuery(e.target).addClass('image-composer-decal-selected');
                that.$target.trigger(Events.decalItemClicked, {
                    decal: decal
                });
            }
        });
    }
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

        if (this.cfg.draggable) {
            this._applyDraggable();
        }
        if (this.cfg.resizable) {
            this._applyResizeable();
        }
    },
    _applyResizeable: function () {
        var that = this;

        this.$target.find('.resizable').resizable({
            // limit movement to parent container
            containment: 'parent',

            stop: function (e, ui) {
                // once resize is done, update decal dimension
                var uid = e.target.getAttribute('data-uid');

                that.itemsMap[uid].width = ui.size.width;
                that.itemsMap[uid].height = ui.size.height;

                that.items.every(function (item) {
                    var found = false;

                    if (item.uid === uid) {
                        item.width = ui.size.width;
                        item.height = ui.size.height;
                        found = true;
                    }

                    return !found;
                });
            }
        });
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

        span.className = item.className || item.key;
        if (this.cfg.draggable) {
            span.className += ' draggable';
        }
        if (this.cfg.resizable) {
            span.className += ' resizable';
        }

        span.title = item.title;
        span.setAttribute('data-uid', item.uid);

        if (item.src) {
            span.style.backgroundImage = 'url(' + item.src + ')';
        }

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

            if (this.cfg.draggable) {
                this._applyDraggable();
            }
            if (this.cfg.resizable) {
                this._applyResizeable();
            }
        }
    },
    addDecal: function (decal, skipRender) {
        this.items.push(decal);
        this.itemsMap[decal.uid] = decal;

        if (!skipRender) {
            this.renderOne(this.items.length - 1);
        }
    },
    removeFocus: function () {
        this.$target.find('.image-composer-decal-selected').removeClass('image-composer-decal-selected');
        this.$target.trigger(Events.decalItemFocusChanged, {
            focus: false
        });
    },
    removeDecal: function (decal) {
        var removeIndex = -1,
            found = false;

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

    var defaultDecal = {
        key: '',
        src: undefined,
        width: -1,
        height: -1,
        left: 0,
        top: 0,
        title: '',
        className: undefined
    };
    cfg = jQuery.extend({}, defaultDecal, cfg);

    this.key = cfg.key;
    this.src = cfg.src;
    this.width = cfg.width;
    this.height = cfg.height;
    this.left = cfg.left;
    this.top = cfg.top;
    this.title = cfg.title;
    this.uid = uid();
    this.className = cfg.className;
};


DecalHolder.prototype.toObject = function (obj) {
    var storage = [],
        data,
        $obj;

    this.items.forEach(function (item) {

        $obj = jQuery('[data-uid=' + item.uid + ']');

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

            that.$target.trigger(Events.decalPaletteItemClicked, {
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

            if (item.className) {
                span.className += ' ' + item.className;
            }

            span.setAttribute('data-key', item.key);

            if (item.src) {
                span.style.backgroundImage = 'url(' + item.src + ')';
            }
            span.style.width = item.width + 'px';
            span.style.height = item.height + 'px';

            frag.appendChild(span);
        }

        this.$target.append(frag);
    }
}

var DecalActionBar = function ($target, givenCfg) {
    var that = this,
        defaultCfg = {
            actions: [],
            actionTemplate: undefined
        },
        cfg = jQuery.extend({}, defaultCfg, givenCfg);


    this.className = 'decal-action-bar';
    this.actionClassName = 'decal-action';
    this.actions = {};
    this.template = cfg.actionTemplate;

    // create action map
    cfg.actions.forEach(function (action) {
        that.actions[action.key] = action;
    });

    this.$target = $target;
    this.$target.on('click', '.' + this.actionClassName, function (e) {
        if (e.target && e.target.getAttribute('data-key')) {
            var actionKey = e.target.getAttribute('data-key'),
                action = that.actions.hasOwnProperty(actionKey) ? that.actions[actionKey] : undefined;

            that.$target.trigger(Events.decalActionClicked, {
                action: action
            });
        }
    });
};
DecalActionBar.prototype = {
    render: function () {
        var frag = document.createDocumentFragment(),
            i,
            el,
            actionIndex,
            action;

        for (actionIndex in this.actions) {
            if (this.actions.hasOwnProperty(actionIndex)) {
                action = this.actions[actionIndex];

                // basic item element setup
                el = document.createElement('div');
                el.className = this.actionClassName;

                if (typeof this.template === 'function') {
                    // has template function
                    el.innerHTML = this.template(action);
                } else {
                    // use some default styling
                    // add className if given
                    if (action.className.length) {
                        el.className += ' ' + action.className;
                    }
                    // add background image if given
                    if (action.background.length) {
                        el.style.backgroundImage = 'url(' + action.background + ')';
                    }
                }

                el.setAttribute('data-key', action.key);
                frag.appendChild(el);
            }
        }

        this.$target.append(frag);
    }
};

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
        var $this = jQuery(this),
            imageDecals = new DecalComposer($this, settings);
            $this.data('imageDecals', imageDecals);
    });

    // returns the jQuery object to allow for chainability.
    return this;
}