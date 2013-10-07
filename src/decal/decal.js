Decal = function (cfg) {
    this.key = cfg.key;
    this.src = cfg.src;
    this.width = cfg.width || -1;
    this.height = cfg.height || -1;
    this.left = cfg.left || -1;
    this.top = cfg.top || -1;
    this.title = cfg.title || '';
    this.uid = uid();
};