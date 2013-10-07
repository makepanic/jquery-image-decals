/*global
 $,
 require
 */

$.fn.imageDecals = function (options) {
    'use strict';

    var defaults = {
            tools: []
        },
        settings = $.extend({}, defaults, options);

    require('./bootstrap');

    this.each(function () {
        var $this = $(this),
            imageDecals = new DecalComposer($this, settings);
            $this.data('imageDecals', imageDecals);
    });

    // returns the jQuery object to allow for chainability.
    return this;
}