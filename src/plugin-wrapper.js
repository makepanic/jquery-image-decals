/*global
 jQuery,
 require
 */

/**
 * jQuery plugin registration
 * @param options
 * @returns {jQuery.fn}
 */
jQuery.fn.imageDecals = function (options) {
    'use strict';

    var defaults = {
            tools: []
        },
        settings = jQuery.extend({}, defaults, options);

    // load bootstrapping code (which loads the rest of the application)
    require('./bootstrap');

    this.each(function () {
        // initialize DecalComposer on given element
        var $this = jQuery(this),
            imageDecals = new DecalComposer($this, settings);

        // set imageDecals data with initialized DecalComposer
        $this.data('imageDecals', imageDecals);
    });

    // returns the jQuery object to allow for chainability.
    return this;
}