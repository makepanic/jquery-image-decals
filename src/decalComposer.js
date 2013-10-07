DecalComposer = function ($target, opts) {

    // bootstrap layout elements

    var that = this,
        noop = function () {},
        defaults = {
            decals: [],
            data: [],
            events: {
                onDecalClicked: noop
            }
        };

    this.img = new Img($target.attr('src'));

    this.cfg = $.extend({}, defaults, opts);
    this.img.dimension(function () {
        that.init();
    });

    this.events = this.cfg.events;
    this.$target = $target;
};
DecalComposer.prototype = {
    toJSON: function () {
        var obj = this.img.toObject();
        obj.decals = this.decalHolder.toObject();

        return JSON.stringify(obj);
    },
    init: function () {
        var that = this,
            decalObj,
            //TODO without jquery
            elImgDecals = $('<div class="image-composer-decals"></div>'),
            elPalette = $('<div class="image-composer-palette"></div>');

        this.renderer = new DecalCanvasRenderer(this.$target, this.img);

        // create decalHolder container
        this.renderer.$target.parent().find('.image-composer-canvas').append(elImgDecals);

        this.decalHolder = new DecalHolder(elImgDecals, {
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
            decalObj = that.cfg.decals[item.key];
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