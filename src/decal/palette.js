var DecalPalette = function ($target, itemsMap) {
    var that = this,
        item;

    this.items = [];
    this.itemsMap = itemsMap;

    for (item in this.itemsMap) {
        if (this.itemsMap.hasOwnProperty(item)) {
            this.items.push(new Decal(this.itemsMap[item]));
        }
    }

    this.$target = $target;
    this.$target.on('click', '.decal-palette-item', function (e) {
        if (e.target && e.target.getAttribute('data-key')) {
            var decalId = e.target.getAttribute('data-key'),
                decal = that.itemsMap.hasOwnProperty(decalId) ? that.itemsMap[decalId] : undefined;

            that.$target.trigger('decal-palette-item-clicked', {
                decal: decal
            });
        }
    });
};
DecalPalette.prototype = {
    render: function () {
        var frag = document.createDocumentFragment(),
            i,
            span,
            item;

        for (i = 0; i < this.items.length; i += 1) {
            item = this.items[i];

            // basic item element setup
            span = document.createElement('div');
            span.className = 'decal-palette-item';
            span.setAttribute('data-key', item.key);
            span.style.backgroundImage = 'url(' + item.src + ')';
            span.style.width = item.width + 'px';
            span.style.height = item.height + 'px';

            frag.appendChild(span);
        }

        this.$target.append(frag);
    }
}