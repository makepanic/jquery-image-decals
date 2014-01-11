/*global jQuery, Events, console */
var DecalHolder = function ($target, cfg) {
    'use strict';

    var that = this,
        i;

    this.scale = cfg.scale;
    this.items = cfg.items;
    this.scaleDecalDimension = cfg.scaleDecalDimension;
    this.itemsMap = {};

    for (i = 0; i < this.items.length; i += 1) {
        this.itemsMap[this.items[i].uid] = this.items[i];
    }

    this.cfg = cfg;
    this.$target = $target;
    this.$target.css('width', cfg.dimension.width + 'px');
    this.$target.css('height', cfg.dimension.height + 'px');

    if (this.cfg.clickUnfocus) {
        this.$target.on('click', function (e) {
            if (e.target.className === 'image-composer-decals') {
                that.removeFocus();
            }
        });
    }

    if (this.cfg.clickable) {
        this.$target.on('click', 'span', function (e) {
            if (e.target && e.target.getAttribute('data-uid')) {
                var decalId = e.target.getAttribute('data-uid'),
                    decal = that.itemsMap.hasOwnProperty(decalId) ? that.itemsMap[decalId] : undefined;

                that.$target.find('.image-composer-decal-selected').removeClass('image-composer-decal-selected');
                jQuery(e.target).addClass('image-composer-decal-selected');
                that.$target.trigger(Events.decalItemClicked, {
                    decal: decal
                });
            }
        });
    }
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

        if (this.cfg.draggable) {
            this._applyDraggable();
        }
        if (this.cfg.resizable) {
            this._applyResizeable();
        }
    },
    _applyResizeable: function () {
        var that = this,
            stopFn = function (e, ui) {
            // once resize is done, update decal dimension
            var uid = e.target.getAttribute('data-uid');

            that.itemsMap[uid].width = ui.size.width;
            that.itemsMap[uid].height = ui.size.height;

            that.items.every(function (item) {
                var found = false;

                if (item.uid === uid) {
                    item.width = ui.size.width;
                    item.height = ui.size.height;
                    found = true;
                }

                return !found;
            });
        };

        this.$target.find('.resizable-no-aspect-ratio').resizable({
            // limit movement to parent container
            containment: 'parent',
            stop: stopFn
        });
        this.$target.find('.resizable-aspect-ratio').resizable({
            // limit movement to parent container
            containment: 'parent',
            aspectRatio: true,
            stop: stopFn
        });

        console.log(this.$target.find('.resize-w-aspect-ratio'));
    },
    _applyDraggable: function () {
        var that = this;

        this.$target.find('.draggable').draggable({
            // limit movement to parent container
//            containment: 'parent',

            start: function(){
                // add container drag class indicator
                that.$target.addClass('decal-dragged');
            },

            drag: function(ev, ui){
                // check if element is outside of holder bounds
                if (that._itemOutsideHolder({
                    left: ui.position.left,
                    top: ui.position.top,
                    width: ev.target.clientWidth,
                    height: ev.target.clientHeight
                })){
                    // add indicator classname
                    jQuery(ev.target).addClass('decal-out');
                    that.$target.addClass('has-decal-out');
                } else if (~ev.target.className.indexOf('decal-out')) {
                    // is inside bounds, but has classname, remove
                    jQuery(ev.target).removeClass('decal-out');
                    that.$target.removeClass('has-decal-out');
                }
            },

            stop: function (e, ui) {
                // once drag is done, update decal positions
                var uid = e.target.getAttribute('data-uid'),
                    foundItem;

                // remove container drag class indicator
                that.$target.removeClass('decal-dragged');

                that.itemsMap[uid].left = ui.position.left;
                that.itemsMap[uid].top = ui.position.top;

                that.items.every(function (item) {
                    var found = false;

                    if (item.uid === uid) {
                        item.left = ui.position.left;
                        item.top = ui.position.top;
                        foundItem = item;
                        found = true;
                    }

                    return !found;
                });

                // check if element is outside canvas
                if (foundItem) {
                    if (that._itemOutsideHolder(foundItem)){
                        that.removeDecal(foundItem);
                    }
                } else {
                    console.error('y u no found item?', uid);
                }
            }
        });
    },
    _itemOutsideHolder: function(item){
        var isOutside,
            centerPoint = {
                x: item.left + item.width / 2,
                y: item.top + item.height / 2
            };

        isOutside =
            // left boundary
            centerPoint.x < 0 ||
            // upper boundary
            centerPoint.y < 0 ||
            // right boundary
            centerPoint.x > this.cfg.dimension.width ||
            // lower boundary
            centerPoint.y > this.cfg.dimension.height;

        return isOutside;
    },
    _createElement: function (item) {
        var span = document.createElement('span'),
            intFn = Math.floor;

        span.className = item.className || item.key;
        if (this.cfg.draggable) {
            span.className += ' draggable';
        }
        if (this.cfg.resizable) {
            span.className += ' resizable';
        }

        span.title = item.title;
        span.setAttribute('data-uid', item.uid);

        if (item.src) {
            span.style.backgroundImage = 'url(' + item.src + ')';
        }

        span.className += item.resizeAspectRatio ? ' resizable-aspect-ratio' : ' resizable-no-aspect-ratio';

        if (this.scaleDecalDimension) {
            span.style.width = intFn(this.scale.width * item.width) + 'px';
            span.style.height = intFn(this.scale.height * item.height) + 'px';
        } else {
            span.style.width = item.width + 'px';
            span.style.height = item.height + 'px';
        }

        span.style.left = intFn(this.scale.width * item.left) + 'px';
        span.style.top = intFn(this.scale.height * item.top) + 'px';
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

            if (this.cfg.draggable) {
                this._applyDraggable();
            }
            if (this.cfg.resizable) {
                this._applyResizeable();
            }
        }
    },
    addDecal: function (decal, skipRender) {
        this.items.push(decal);
        this.itemsMap[decal.uid] = decal;

        if (!skipRender) {
            this.renderOne(this.items.length - 1);
        }
    },
    removeFocus: function () {
        this.$target.find('.image-composer-decal-selected').removeClass('image-composer-decal-selected');
        this.$target.trigger(Events.decalItemFocusChanged, {
            focus: false
        });
    },
    removeDecal: function (decal) {
        var removeIndex = -1,
            found = false;

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