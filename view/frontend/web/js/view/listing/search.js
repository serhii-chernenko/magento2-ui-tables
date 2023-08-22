define(['uiElement', 'mage/translate'], (uiElement, $t) => {
    'use strict';

    return uiElement.extend({
        defaults: {
            prevValue: '',
            value: '',
            links: {
                value: '${ $.provider }:search'
            },
            listens: {
                value: 'onValueChange'
            },
            modules: {
                parentComponent: '${ $.provider }'
            },
            tracks: {
                value: true
            }
        },
        timer: null,

        resetTimer() {
            this.timer && clearTimeout(this.timer);
        },

        onValueChange() {
            this.resetTimer();

            this.timer = setTimeout(() => {
                this.resetTimer();

                if (this.value === this.prevValue) {
                    return this;
                }

                this.parentComponent().resetParams();
                this.parentComponent().fetchData();
            }, this.inputDelay);
        }
    });
});
