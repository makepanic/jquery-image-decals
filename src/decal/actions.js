/*global jQuery, Events */
var DecalActionBar = function ($target, givenCfg) {
    var that = this,
        defaultCfg = {
            actions: [],
            actionTemplate: undefined,
            holder: undefined
        },
        cfg = jQuery.extend({}, defaultCfg, givenCfg);


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


    this.$target.on('click', '.' + this.actionClassName, function (e) {
        if (e.target &&
            // check if target has key or parent
            (e.target.getAttribute('data-key') || e.target.parentNode.getAttribute('data-key'))) {
            var actionKey = e.target.getAttribute('data-key') || e.target.parentNode.getAttribute('data-key'),
                action = that.actions.hasOwnProperty(actionKey) ? that.actions[actionKey] : undefined;

            that.$target.trigger(Events.decalActionClicked, {
                action: action
            });
        }
    });
};
DecalActionBar.prototype = {
    hide: function () {
        this.$target.addClass(this.hiddenclassName);
    },
    show: function () {
        this.$target.removeClass(this.hiddenclassName);
    },
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