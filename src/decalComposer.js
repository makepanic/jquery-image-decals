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
            if (that.showActions) {
                that.actionBar.$target.show();
            }
            that.events.onDecalClicked.call(e.target, e, data.decal);
        });
        this.decalHolder.$target.on(Events.decalItemFocusChanged, function (e, data) {
            if (data.focus === false) {
                that.selectedDecal = null;

                if (that.showActions) {
                    that.actionBar.$target.hide();
                }
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