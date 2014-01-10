DecalHolder.prototype.toObject = function () {
    var storage = [],
        data,
        $obj;

    this.items.forEach(function (item) {

        $obj = jQuery('[data-uid=' + item.uid + ']');

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
