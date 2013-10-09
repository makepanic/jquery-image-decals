var DecalComposer = function ($target, opts) {

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

            decalObj = jQuery.extend(true, {}, that.cfg.decals[item.key]);
            decalObj.width = item.width;
            decalObj.height = item.height;
            decalObj.left = item.left;
            decalObj.top = item.top;

            that.decalHolder.addDecal(new Decal(decalObj), true);
        });

        this.decalHolder.render();
        this.decalPalette.render();
    }
};