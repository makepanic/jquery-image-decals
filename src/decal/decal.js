Decal = function (cfg) {
    this.key = cfg.key;
    this.src = cfg.src;
    this.width = cfg.width || -1;
    this.height = cfg.height || -1;
    this.left = cfg.left;
    this.top = cfg.top;
    this.title = cfg.title || '';
    this.uid = uid();
};