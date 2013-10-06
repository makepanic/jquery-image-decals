IMGCOMP.DecalHolder.prototype.toObject = function (obj) {
    var storage = [],
        data,
        $obj;

    this.items.forEach(function (item) {

        $obj = $('[data-uid=' + item.uid + ']');

        data = {
            key: item.key,

            // could be later replaced for rendered width/height
            width: item.width,
            height: item.height,
            left: $obj.css('left'),
            top: $obj.css('top')
        };

        data.left = parseInt(data.left === 'auto' ? '0' : data.left, 10);
        data.top = parseInt(data.top === 'auto' ? '0' : data.top, 10);


        storage.push(data);
    });

    return storage;
};
