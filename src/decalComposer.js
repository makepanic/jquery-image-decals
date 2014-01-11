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