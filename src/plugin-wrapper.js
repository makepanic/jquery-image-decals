/*global
 jQuery,
 require
 */

jQuery.fn.imageDecals = function (options) {
    'use strict';

    var defaults = {
            tools: []
        },
        settings = jQuery.extend({}, defaults, options);

    require('./bootstrap');

    this.each(function () {
        var $this = jQuery(this),
            imageDecals = new DecalComposer($this, settings);
            $this.data('imageDecals', imageDecals);
    });

    // returns the jQuery object to allow for chainability.
    return this;
}