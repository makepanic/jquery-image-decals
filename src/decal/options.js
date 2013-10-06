IMGCOMP.DecalOptions = function ($target, options) {
    var that = this;

    this.decal = undefined;
    this.renderMethod = options.renderMethod;
    this.$target = $target;
};
IMGCOMP.DecalOptions.prototype = {
    showOptions: function (decal) {
        var template = this.renderMethod(decal),
            $template = $(template);

        this.decal = decal;
        this.$target.empty();
        this.$target.append($template);
    }
}