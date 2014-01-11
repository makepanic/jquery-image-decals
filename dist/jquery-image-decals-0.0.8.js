/*global
 jQuery,
 require
 */

/**
 * jQuery plugin registration
 * @param options
 * @returns {jQuery.fn}
 */
jQuery.fn.imageDecals = function (options) {
    'use strict';

    var defaults = {
            tools: []
        },
        settings = jQuery.extend({}, defaults, options);

    // load bootstrapping code (which loads the rest of the application)


var _lastId = 0,
    /**
     * Unique identifier generator
     * @returns {String} unique String
     */
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


/*global
    Img,
    jQuery,
    Events,
    Decal,
    DecalCanvasRenderer,
    DecalHolder,
    DecalPalette,
    DecalActionBar
*/

/**
 * basically initialization of the complete plugin using an jQuery element and a config object
 * @param {*} $target
 * @param {Object} opts
 * @constructor
 */
var DecalComposer = function ($target, opts) {

    var that = this,
        noop = function () {},
        defaults = {
            actions: [],
            actionBar: undefined,
            showActions: false,
            actionTemplate: undefined,

            useImageSrcDimension: true,
            clickUnfocus: false,
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

    // create config by merging defaults and given options
    this.cfg = jQuery.extend({}, defaults, opts);
    this.scale = {
        width: 1,
        height: 1
    };

    // load dimension and initialize decalComposer
    this.img.dimension(this.cfg.useImageSrcDimension, function () {
        that.init();
    });

    // more variable setting
    this.events = this.cfg.events;
    this.$target = $target;
};
DecalComposer.prototype = {
    /**
     * Function that generates JSON with each decal object and the domain. This is used to store the current composition in a database.
     * @returns {*}
     */
    toJSON: function () {
        var obj = this.decalHolder.toObject(),
            config = {
                decals: obj,
                domain: this.cfg.domain
            };

        return JSON.stringify(config);
    },
    /**
     * initializes everything
     */
    init: function () {
        var that = this,
            decalObj,
            elImgDecals = jQuery('<div class="image-composer-decals"></div>'),
            elPalette = jQuery('<div class="image-composer-palette"></div>');

        // calculate scale using the image dimension and stored domain
        this.scale.width = this.img.width / this.cfg.domain.width;
        this.scale.height = this.img.height / this.cfg.domain.height;

        // create DecalCanvasRenderer
        this.renderer = new DecalCanvasRenderer(this.$target, this.img,
            (!this.cfg.resizable && !this.cfg.clickable && !this.cfg.resizable));

        // create decalHolder container
        this.renderer.$target.parent().find('.image-composer-canvas').append(elImgDecals);

        // cerate DecalHolder
        this.decalHolder = new DecalHolder(elImgDecals, {
            clickUnfocus: this.cfg.clickUnfocus,
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

        // initialize event listener for decal item clicked
        this.decalHolder.$target.on(Events.decalItemClicked, function (e, data) {
            that.selectedDecal = data.decal;
            if (that.cfg.showActions) {
                that.actionBar.show();
            }
            that.events.onDecalClicked.call(e.target, e, data.decal);
        });
        // initialize event listener for decal item focus changed
        this.decalHolder.$target.on(Events.decalItemFocusChanged, function (e, data) {
            if (data.focus === false) {
                that.selectedDecal = null;

                if (that.cfg.showActions) {
                    that.actionBar.hide();
                }
            }
        });

        if (this.cfg.showPalette) {
            // create palette container
            this.renderer.$target.parent().append(elPalette);
            this.decalPalette = new DecalPalette(elPalette, this.cfg.decals);
            this.decalPalette.$target.on(Events.decalPaletteItemClicked, function (e, data) {
                that.decalHolder.addDecal(new Decal(that.cfg.decals[data.decal.key]));
            });
        }

        if (this.cfg.showActions) {
            // create actionbar
            this.actionBar = new DecalActionBar(this.cfg.actionBar, {
                actions: this.cfg.actions,
                actionTemplate: this.cfg.actionTemplate,
                holder: this.decalHolder
            });
            // initialize event listener for decal action clicked
            this.actionBar.$target.on(Events.decalActionClicked, function (e, data) {
                var action = data.action;
                action.trigger(that.selectedDecal, e, that.decalHolder);
            });
        }

        // restore decals from given data
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

        // render decal holder
        this.decalHolder.render();

        if (this.cfg.showPalette) {
            // render palette
            this.decalPalette.render();
        }
        if (this.cfg.showActions) {
            // render actionbar and hide it
            this.actionBar.hide();
            this.actionBar.render();
        }

    }
};

/*global require */

/**
 * Object that represents an image that is an HTMLElement image or an element with a background-image
 * @param $el
 * @constructor
 */
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

/*global require, jQuery, uid */


/*global jQuery, Events, console */

/**
 * wrapper that contains all placed decals
 * @param $target
 * @param cfg
 * @constructor
 */
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

    if (this.cfg.clickUnfocus) {
        this.$target.on('click', function (e) {
            if (e.target.className === 'image-composer-decals') {
                that.removeFocus();
            }
        });
    }

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
    /**
     * renders all decals
     */
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
    /**
     * applies jqueryui resizeable to all decals that have 'resizable-aspect-ratio' or 'resizable-no-aspect-ratio' for className
     * @private
     */
    _applyResizeable: function () {
        var that = this,
            /**
             * Function that is called once the resize stopped. It updates the dimension of the resized decal.
             * @param e
             * @param ui
             */
            stopFn = function (e, ui) {
            // once resize is done, update decal dimension
            var uid = e.target.getAttribute('data-uid');

            that.itemsMap[uid].width = ui.size.width;
            that.itemsMap[uid].height = ui.size.height;

            // loop through each item and check if uid equals element uid
            that.items.every(function (item) {
                var found = false;

                if (item.uid === uid) {
                    // update found item dimension
                    item.width = ui.size.width;
                    item.height = ui.size.height;
                    found = true;
                }

                return !found;
            });
        };

        // apply resizable without aspectRatio
        this.$target.find('.resizable-no-aspect-ratio').resizable({
            containment: 'parent',
            stop: stopFn
        });

        // apply resizable with aspectRatio
        this.$target.find('.resizable-aspect-ratio').resizable({
            containment: 'parent',
            aspectRatio: true,
            stop: stopFn
        });
    },
    /**
     * Applies jqueryui draggable to all elements that have the draggable className
     * @private
     */
    _applyDraggable: function () {
        var that = this;

        this.$target.find('.draggable').draggable({
            start: function(){
                // add container drag class indicator
                that.$target.addClass('decal-dragged');
            },
            drag: function(ev, ui){
                // check if element is outside of holder bounds
                if (that._itemOutsideHolder({
                    left: ui.position.left,
                    top: ui.position.top,
                    width: ev.target.clientWidth,
                    height: ev.target.clientHeight
                })){
                    // add indicator classname
                    jQuery(ev.target).addClass('decal-out');
                    that.$target.addClass('has-decal-out');
                } else if (~ev.target.className.indexOf('decal-out')) {
                    // is inside bounds, but has classname, remove
                    jQuery(ev.target).removeClass('decal-out');
                    that.$target.removeClass('has-decal-out');
                }
            },
            stop: function (e, ui) {
                // once drag is done, update decal positions
                var uid = e.target.getAttribute('data-uid'),
                    foundItem;

                // remove container drag class indicator
                that.$target.removeClass('decal-dragged');

                that.itemsMap[uid].left = ui.position.left;
                that.itemsMap[uid].top = ui.position.top;

                that.items.every(function (item) {
                    var found = false;

                    if (item.uid === uid) {
                        item.left = ui.position.left;
                        item.top = ui.position.top;
                        foundItem = item;
                        found = true;
                    }

                    return !found;
                });

                // check if element is outside canvas
                if (foundItem) {
                    if (that._itemOutsideHolder(foundItem)){
                        that.removeDecal(foundItem);
                    }
                } else {
                    console.error('y u no found item?', uid);
                }
            }
        });
    },
    /**
     * Function that tests if the center of a decal is outside the container
     * @param item
     * @returns {boolean} if the element is outside
     * @private
     */
    _itemOutsideHolder: function(item){
        var isOutside,
            centerPoint = {
                x: item.left + item.width / 2,
                y: item.top + item.height / 2
            };

        isOutside =
            // left boundary
            centerPoint.x < 0 ||
            // upper boundary
            centerPoint.y < 0 ||
            // right boundary
            centerPoint.x > this.cfg.dimension.width ||
            // lower boundary
            centerPoint.y > this.cfg.dimension.height;

        return isOutside;
    },
    /**
     * Creates a span HTMLElement from a decal object
     * @param item
     * @returns {HTMLElement}
     * @private
     */
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

        span.className += item.resizeAspectRatio ? ' resizable-aspect-ratio' : ' resizable-no-aspect-ratio';

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
    /**
     * renders decals from a given start index
     * @param from
     */
    renderOne: function (from) {
        var item,
            span;

        // check if from is a number
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
    /**
     * Adds a decal and gives option to render it directly using the renderOne function
     * @param decal
     * @param skipRender if true doesnt render from the added decal
     */
    addDecal: function (decal, skipRender) {
        this.items.push(decal);
        this.itemsMap[decal.uid] = decal;

        if (!skipRender) {
            this.renderOne(this.items.length - 1);
        }
    },
    /**
     * Removes focus className from all decals that have the focus className
     */
    removeFocus: function () {
        this.$target.find('.image-composer-decal-selected').removeClass('image-composer-decal-selected');
        this.$target.trigger(Events.decalItemFocusChanged, {
            focus: false
        });
    },
    /**
     * removes a decal
     * @param decal
     */
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
            // remove from itemMap
            delete this.itemsMap[decal.uid];
            // remove from items array
            this.items.splice(removeIndex, 1);
            // remove dom element
            this.$target.find('[data-uid=' + decal.uid + ']').remove();
        }
    }
};

/**
 * Model that represents a decal
 * @param cfg
 * @constructor
 */
var Decal = function (cfg) {

    var defaultDecal = {
        key: '',
        src: undefined,
        width: -1,
        height: -1,
        left: 0,
        top: 0,
        title: '',
        className: undefined,
        resizeAspectRatio: false
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
    this.resizeAspectRatio = cfg.resizeAspectRatio;
};


/*global DecalHolder */

/**
 * basic serialization method
 * @returns {Array}
 */
DecalHolder.prototype.toObject = function () {
    var storage = [],
        data;

    this.items.forEach(function (item) {
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


/*global Decal, Events */

/**
 * Palette with all available decals
 * @param $target
 * @param itemsMap
 * @constructor
 */
var DecalPalette = function ($target, itemsMap) {
    var that = this,
        item;

    this.items = [];
    this.itemsMap = itemsMap;

    // fill items array with newly created Decal objects based on each item
    for (item in this.itemsMap) {
        if (this.itemsMap.hasOwnProperty(item)) {
            this.items.push(new Decal(this.itemsMap[item]));
        }
    }

    this.$target = $target;

    // add click listener on each palette item
    this.$target.on('click', '.decal-palette-item', function (e) {
        if (e.target && e.target.getAttribute('data-key')) {
            var decalId = e.target.getAttribute('data-key'),
                decal = that.itemsMap.hasOwnProperty(decalId) ? that.itemsMap[decalId] : undefined;

            // trigger palette item clicked with decal as parameter
            that.$target.trigger(Events.decalPaletteItemClicked, {
                decal: decal
            });
        }
    });
};
DecalPalette.prototype = {
    /**
     * renders the palette
     */
    render: function () {
        var frag = document.createDocumentFragment(),
            i,
            span,
            wrapper,
            item;

        for (i = 0; i < this.items.length; i += 1) {
            item = this.items[i];

            // basic item element setup
            span = document.createElement('div');
            span.className = 'decal-palette-item';

            wrapper = document.createElement('div');
            wrapper.className = 'decal-palette-item-wrapper';

            if (item.className) {
                span.className += ' ' + item.className;
            }

            span.setAttribute('data-key', item.key);

            if (item.src) {
                span.style.backgroundImage = 'url(' + item.src + ')';
            }
            span.style.width = item.width + 'px';
            span.style.height = item.height + 'px';

            wrapper.appendChild(span);
            frag.appendChild(wrapper);
        }

        this.$target.append(frag);
    }
};

/*global jQuery, Events */

/**
 * Actionbar to allow
 * @param $target
 * @param givenCfg
 * @constructor
 */
var DecalActionBar = function ($target, givenCfg) {
    var that = this,
        defaultCfg = {
            actions: [],
            actionTemplate: undefined,
            holder: undefined
        },
        cfg = jQuery.extend({}, defaultCfg, givenCfg);

    // basic initializing
    this.className = 'decal-action-bar';
    this.hiddenclassName = 'action-bar-hidden';
    this.actionClassName = 'decal-action';
    this.actions = {};
    this.template = cfg.actionTemplate;

    // create action map
    cfg.actions.forEach(function (action) {
        that.actions[action.key] = action;
    });

    if ($target && $target.length) {
        // has target and found element
        this.$target = $target;
    } else {
        // create element
        var el = document.createElement('div');
        el.className = this.className;

        // prepend $target before holder parent
        this.$target = jQuery(el);
        cfg.holder.$target.parent().after(this.$target);
    }

    // apply click handler
    this.$target.on('click', '.' + this.actionClassName, function (e) {
        if (e.target &&
            // check if target has key or parent
            (e.target.getAttribute('data-key') || e.target.parentNode.getAttribute('data-key'))) {

            // get key and load action from action map
            var actionKey = e.target.getAttribute('data-key') || e.target.parentNode.getAttribute('data-key'),
                action = that.actions.hasOwnProperty(actionKey) ? that.actions[actionKey] : undefined;

            // trigger decalActionClicked with action object
            that.$target.trigger(Events.decalActionClicked, {
                action: action
            });
        }
    });
};

DecalActionBar.prototype = {
    /**
     * hides the actionbar by adding the hiddenClassName class
     */
    hide: function () {
        this.$target.addClass(this.hiddenclassName);
    },
    /**
     * shows the actionbar by removing the hiddenClassName class
     */
    show: function () {
        this.$target.removeClass(this.hiddenclassName);
    },
    /**
     * renders the actionbar
     */
    render: function () {
        var frag = document.createDocumentFragment(),
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

    this.each(function () {
        // initialize DecalComposer on given element
        var $this = jQuery(this),
            imageDecals = new DecalComposer($this, settings);

        // set imageDecals data with initialized DecalComposer
        $this.data('imageDecals', imageDecals);
    });

    // returns the jQuery object to allow for chainability.
    return this;
}