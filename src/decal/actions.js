/*global jQuery, Events */

/**
 * Actionbar to allow
 * @param $target
 * @param givenCfg
 * @constructor
 */
var DecalActionBar = function ($target, givenCfg) {
    var that = this,
        defaultCfg = {
            actions: [],
            actionTemplate: undefined,
            holder: undefined
        },
        cfg = jQuery.extend({}, defaultCfg, givenCfg);

    // basic initializing
    this.className = 'decal-action-bar';
    this.hiddenclassName = 'action-bar-hidden';
    this.actionClassName = 'decal-action';
    this.actions = {};
    this.template = cfg.actionTemplate;

    // create action map
    cfg.actions.forEach(function (action) {
        that.actions[action.key] = action;
    });

    if ($target && $target.length) {
        // has target and found element
        this.$target = $target;
    } else {
        // create element
        var el = document.createElement('div');
        el.className = this.className;

        // prepend $target before holder parent
        this.$target = jQuery(el);
        cfg.holder.$target.parent().after(this.$target);
    }

    // apply click handler
    this.$target.on('click', '.' + this.actionClassName, function (e) {
        if (e.target &&
            // check if target has key or parent
            (e.target.getAttribute('data-key') || e.target.parentNode.getAttribute('data-key'))) {

            // get key and load action from action map
            var actionKey = e.target.getAttribute('data-key') || e.target.parentNode.getAttribute('data-key'),
                action = that.actions.hasOwnProperty(actionKey) ? that.actions[actionKey] : undefined;

            // trigger decalActionClicked with action object
            that.$target.trigger(Events.decalActionClicked, {
                action: action
            });
        }
    });
};

DecalActionBar.prototype = {
    /**
     * hides the actionbar by adding the hiddenClassName class
     */
    hide: function () {
        this.$target.addClass(this.hiddenclassName);
    },
    /**
     * shows the actionbar by removing the hiddenClassName class
     */
    show: function () {
        this.$target.removeClass(this.hiddenclassName);
    },
    /**
     * renders the actionbar
     */
    render: function () {
        var frag = document.createDocumentFragment(),
            el,
            actionIndex,
            action;

        for (actionIndex in this.actions) {
            if (this.actions.hasOwnProperty(actionIndex)) {
                action = this.actions[actionIndex];

                // basic item element setup
                el = document.createElement('div');
                el.className = this.actionClassName;

                if (typeof this.template === 'function') {
                    // has template function
                    el.innerHTML = this.template(action);
                } else {
                    // use some default styling
                    // add className if given
                    if (action.className.length) {
                        el.className += ' ' + action.className;
                    }
                    // add background image if given
                    if (action.background.length) {
                        el.style.backgroundImage = 'url(' + action.background + ')';
                    }
                }

                el.setAttribute('data-key', action.key);
                frag.appendChild(el);
            }
        }

        this.$target.append(frag);
    }
};