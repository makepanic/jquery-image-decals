var _lastId = 0,
    uid = function () {
        _lastId += 1;
        return 'image-composer-uid-' + _lastId;
    };

var Events = {
    decalItemFocusChanged: 'decal-item-focus-changed',
    decalPaletteItemClicked: 'decal-palette-item-clicked',
    decalActionClicked: 'decal-action-clicked',
    decalItemClicked: 'decal-item-clicked'
};

require('./decalComposer.js');
require('./decalComposer.js');
require('./image/img.js');
require('./decal/decal.js');
require('./decal/palette.js');
require('./decal/actions.js');
require('./render.js');

