var DecalActionBar = function ($target, actions) {
    var that = this;

    this.className = 'decal-action-bar';
    this.actionClassName = 'decal-action';
    this.actions = {};

    // create action map
    actions.forEach(function (action) {
        that.actions[action.key] = action;
    });

    this.$target = $target;
    this.$target.on('click', '.' + this.actionClassName, function (e) {
        if (e.target && e.target.getAttribute('data-key')) {
            var actionKey = e.target.getAttribute('data-key'),
                action = that.actions.hasOwnProperty(actionKey) ? that.actions[actionKey] : undefined;

            that.$target.trigger(Events.decalActionClicked, {
                action: action
            });
        }
    });
};
DecalActionBar.prototype = {
    render: function () {
        var frag = document.createDocumentFragment(),
            i,
            el,
            actionIndex,
            action;

        for (actionIndex in this.actions) {
            if (this.actions.hasOwnProperty(actionIndex)) {
                action = this.actions[actionIndex];

                // basic item element setup
                el = document.createElement('div');
                el.className = this.actionClassName;

                // add className if given
                if (action.className.length) {
                    el.className += ' ' + action.className;
                }
                // add background image if given
                if (action.background.length) {
                    el.style.backgroundImage = 'url(' + action.background + ')';
                }

                el.setAttribute('data-key', action.key);
                frag.appendChild(el);
            }
        }

        this.$target.append(frag);
    }
};