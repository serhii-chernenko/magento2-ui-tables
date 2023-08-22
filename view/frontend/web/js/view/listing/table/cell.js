define(['uiElement'], (uiElement) => {
    'use strict';

    return uiElement.extend({
        defaults: {
            selectedAction: null,
            tracks: {
                selectedAction: true
            },
            listens: {
                selectedAction: 'onActionSelect'
            }
        },

        /**
         * Redirect to a URL when option of actions select chosen.
         * @returns {Object} This.
         */
        onActionSelect() {
            if (!this.selectedAction) return this;

            window.location.href = this.selectedAction;
        }
    });
});
