DecalHolder = function ($target, cfg) {
    'use strict';

    var that = this,
        i;

    this.items = cfg.items || [];
    this.itemsMap = {};

    for (i = 0; i < this.items.length; i += 1) {
        this.itemsMap[this.items[i].uid] = this.items[i];
    }

    // config stuff
    this.cfg = cfg;
    this.$target = $target;

    this.$target.on('click', 'span', function (e) {
        console.log('span clicked', e);
        if (e.target && e.target.getAttribute('data-uid')) {
            var decalId = e.target.getAttribute('data-uid'),
                decal = that.itemsMap.hasOwnProperty(decalId) ? that.itemsMap[decalId] : undefined;

            that.$target.find('.image-composer-decal-selected').removeClass('image-composer-decal-selected');
            $(e.target).addClass('image-composer-decal-selected');
            that.$target.trigger('decal-item-clicked', {
                decal: decal
            });
        }
    });
};
DecalHolder.prototype = {
    render: function () {
        'use strict';

        var frag = document.createDocumentFragment(),
            that = this,
            span;

        this.items.forEach(function (item) {

            // basic item element bootstrap
            span = that._createElement(item);
            frag.appendChild(span);
            
        });

        this.$target.append(frag);
        this._applyDraggable();
    },
    _applyDraggable: function () {
        var that = this;

        this.$target.find('.draggable').draggable({
            // limit movement to parent container
            containment: 'parent',

            stop: function (e, ui) {
                // once drag is done, update decal positions
                var uid = e.target.getAttribute('data-uid');

                that.itemsMap[uid].left = ui.position.left;
                that.itemsMap[uid].top = ui.position.top;

                that.items.every(function (item) {
                    var found = false;

                    if (item.uid === uid) {
                        item.left = ui.position.left;
                        item.top = ui.position.top;
                        found = true;
                    }

                    return !found;
                });
            }
        });
    },
    _createElement: function (item) {
        var span = document.createElement('span');

        span.className = item.key + ' draggable';
        span.title = item.title;
        span.setAttribute('data-uid', item.uid);
        span.style.backgroundImage = 'url(' + item.src + ')';
        span.style.width = item.width + 'px';
        span.style.height = item.height + 'px';
        span.style.left = item.left + 'px';
        span.style.top = item.top + 'px';
        return span;
    },
    renderOne: function (from) {
        var item,
            span;

        from = Object.prototype.toString.call(from) === '[object Number]' ? from : -1;
        if (from !== -1) {
            item = this.items[from];
            span = this._createElement(item);
            this.$target.append(span);
            this._applyDraggable();
        }
    },
    addDecal: function (decal, skipRender) {
        this.items.push(decal);
        this.itemsMap[decal.uid] = decal;

        if (!skipRender) {
            this.renderOne(this.items.length - 1);
        }
    },
    removeDecal: function (decal) {
        var removeIndex = -1,
            found = false;

        console.log('removing', decal);

        this.items.every(function (item, index) {
            if (item.uid === decal.uid) {
                removeIndex = index;
                found = true;
            }

            // inverse found because we want to break on found but .every breaks on false
            return !found;
        });

        if (removeIndex !== -1 && found) {
            delete this.itemsMap[decal.uid];
            this.items.splice(removeIndex, 1);
            this.$target.find('[data-uid=' + decal.uid + ']').remove();
        }
    }
};

require('./decal');
require('./render');
require('./persistence/fromObject');
require('./persistence/toObject');
