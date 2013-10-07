#jquery-decals-composer

##options

    {
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


##requirements

Jquery-decal-composer depends on jquery and jqueryui-draggable.

This plugin uses some es5 functions ( with possible polyfills):

- Array.forEach ( via [dev.mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) )
- Array.every ( via [dev.mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every) )
- JSON.stringify ( via [json3](http://bestiejs.github.io/json3/) or [json2](https://github.com/douglascrockford/JSON-js) )
- JSON.parse ( via [json3](http://bestiejs.github.io/json3/) or [json2](https://github.com/douglascrockford/JSON-js) )