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
    cfg = $.extend({}, defaultDecal, cfg);

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