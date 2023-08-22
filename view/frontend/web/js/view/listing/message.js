define(['uiElement'], (uiElement) => {
    'use strict';

    return uiElement.extend({
        defaults: {
            modules: {
                parentComponent: '${ $.provider }'
            }
        },

        reset() {
            this.parentComponent().set('search', '');
            this.parentComponent().resetParams();
            this.parentComponent().fetchData();
        }
    });
});
