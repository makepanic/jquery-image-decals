var _lastId = 0,
    uid = function () {
        _lastId += 1;
        return 'image-composer-uid-' + _lastId;
    };

require('./decalComposer.js');
require('./decalComposer.js');
require('./image/model.js');
require('./decal/model.js');
require('./decal/palette.js');
require('./decal/options.js');
require('./render.js');

