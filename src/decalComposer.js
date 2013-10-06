IMGCOMP.DecalComposer = function ($target, opts) {

    // bootstrap layout elements

    var that = this,
        defaults = {
            decals: []
        };

    this.img = new IMGCOMP.Img($target.attr('src'));

    this.$target = $target;
    this.cfg = $.extend({}, defaults, opts);

    this.img.dimension(function () {
        that.init();
    });
};
IMGCOMP.DecalComposer.prototype = {
    toJSON: function () {
        var obj = this.img.toObject();
        obj.decals = this.decalHolder.toObject();

        return JSON.stringify(obj);
    },
    init: function () {
        var that = this,
            //TODO without jquery
            elImgDecals = $('<div class="image-composer-decals"></div>'),
            elPalette = $('<div class="image-composer-palette"></div>');

        this.renderer = new IMGCOMP.DecalCanvasRenderer(this.$target, this.img);

        // create decalHolder container
        this.renderer.$target.parent().find('.image-composer-canvas').append(elImgDecals);

        this.decalHolder = new IMGCOMP.DecalHolder(elImgDecals, {
            items: []
        });
        this.decalHolder.$target.on('decal-item-clicked', function (e, data) {
            alert('decal item clicked');
        });

        // create palette container
        this.renderer.$target.parent().append(elPalette);
        this.decalPalette = new IMGCOMP.DecalPalette(elPalette, this.cfg.decals);
        this.decalPalette.$target.on('decal-palette-item-clicked', function (e, data) {
            that.decalHolder.addDecal(new IMGCOMP.Decal(that.cfg.decals[data.decal.key]));
        });

        this.decalHolder.render();
        this.decalPalette.render();
    }
}