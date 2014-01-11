/*global Decal, Events */

/**
 * Palette with all available decals
 * @param $target
 * @param itemsMap
 * @constructor
 */
var DecalPalette = function ($target, itemsMap) {
    var that = this,
        item;

    this.items = [];
    this.itemsMap = itemsMap;

    // fill items array with newly created Decal objects based on each item
    for (item in this.itemsMap) {
        if (this.itemsMap.hasOwnProperty(item)) {
            this.items.push(new Decal(this.itemsMap[item]));
        }
    }

    this.$target = $target;

    // add click listener on each palette item
    this.$target.on('click', '.decal-palette-item', function (e) {
        if (e.target && e.target.getAttribute('data-key')) {
            var decalId = e.target.getAttribute('data-key'),
                decal = that.itemsMap.hasOwnProperty(decalId) ? that.itemsMap[decalId] : undefined;

            // trigger palette item clicked with decal as parameter
            that.$target.trigger(Events.decalPaletteItemClicked, {
                decal: decal
            });
        }
    });
};
DecalPalette.prototype = {
    /**
     * renders the palette
     */
    render: function () {
        var frag = document.createDocumentFragment(),
            i,
            span,
            wrapper,
            item;

        for (i = 0; i < this.items.length; i += 1) {
            item = this.items[i];

            // basic item element setup
            span = document.createElement('div');
            span.className = 'decal-palette-item';

            wrapper = document.createElement('div');
            wrapper.className = 'decal-palette-item-wrapper';

            if (item.className) {
                span.className += ' ' + item.className;
            }

            span.setAttribute('data-key', item.key);

            if (item.src) {
                span.style.backgroundImage = 'url(' + item.src + ')';
            }
            span.style.width = item.width + 'px';
            span.style.height = item.height + 'px';

            wrapper.appendChild(span);
            frag.appendChild(wrapper);
        }

        this.$target.append(frag);
    }
};