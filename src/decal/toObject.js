/*global DecalHolder */

/**
 * basic serialization method
 * @returns {Array}
 */
DecalHolder.prototype.toObject = function () {
    var storage = [],
        data;

    this.items.forEach(function (item) {
        data = {
            key: item.key,

            // could be later replaced for rendered width/height
            width: item.width,
            height: item.height,
            left: item.left,
            top: item.top
        };

        storage.push(data);
    });

    return storage;
};
