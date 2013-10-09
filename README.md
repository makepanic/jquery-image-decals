#jquery-image-decals

##demo

I have a running version of the plugin on [http://lab.rndm.de/jquery-image-decals/](http://lab.rndm.de/jquery-image-decals/).

##usage

To use __jquery-image-decals__ you have to call the `imageDecals` function on a jquery element.

```
$('.foobar').imageDecals(/* options */);
```

##options

defaults:

```
{
    showPalette: false,
    clickable: false,
    draggable: false,
    scaleDecalDimension: false,
    domain: {
        width: 100,
        height: 100
    },
    decals: [],
    data: [],
    events: {
        onDecalClicked: function(){}
    }
}
```

###showPalette `Boolean`

Enable or disable the palette.

###clickable `Boolean`

Enable or disable click on a decal.

###draggable `Boolean`

Enable or disable drag'n'drop of a decal.

###scaleDecalDimension `Boolean`

Set to `true` if you want to scale the width and height of the decals depending on the calculated scale.

###domain `Object`

This object contains the input domain of the real image. That means it contains the width and height of the image where the
original decals where collected. This is required to allow positioning the decals correct on different image sizes.

###decals `Array`

This is a lookup map for the plugin to generate the decal palette.

In this example the decals map is set to contain one item, 'foobar'. The palette uses the src to display the image for all 'foobar' decals.
In addition it acts as a default for placed decals.

```
decals = {
    'foobar': {
        key: 'foobar',
        src: 'http://placehold.it/100x100',
        title: 'foobar',
        width: 100,
        height: 100,
        left: 0,
        top: 0
    }
}
```

###data `Array`

The `data` property allows to prepopulate the canvas with decals.
It uses the `key` property to search in the decals object for required data.
Using `left` and `top` it allows to position the decal.

```
data = [{
    "key":"foobar",
    "width":100,
    "height":100,
    "left":213,
    "top":145
}]
```

###events `Object`

Currently there is one supported event that calls a callback from the events object.

####onDecalClicked `Function`

This function is called if the user clicks on a placed decal.
The function is called with 2 parameters and the scope of `the event.target`.

```
events: {
    onDecalClicked: function (event, decal) {
        // react on decal clicked event
    }
}
```

##requirements

Jquery-decal-composer depends on jquery and jqueryui-draggable.

This plugin uses some es5 functions ( with possible polyfills):

- Array.forEach ( via [dev.mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) )
- Array.every ( via [dev.mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every) )
- JSON.stringify ( via [json3](http://bestiejs.github.io/json3/) or [json2](https://github.com/douglascrockford/JSON-js) )
- JSON.parse ( via [json3](http://bestiejs.github.io/json3/) or [json2](https://github.com/douglascrockford/JSON-js) )
