define(['uiElement', 'mage/translate'], (uiElement, $t) => {
    'use strict';

    return uiElement.extend({
        getTotalsMessage() {
            if (this.total === this.limit) {
                return this.getTotalsMessageAllItems();
            } else if (this.skip === 0) {
                return this.getTotalsMessageFromFirstPage();
            }

            return this.getTotalsMessageWithSkip();
        },

        getTotalsMessageAllItems() {
            return $t('%1 item(s)').replace('%1', this.limit);
        },

        getTotalsMessageFromFirstPage() {
            return $t('Items %1 of %2')
                .replace('%1', this.limit)
                .replace('%2', this.total);
        },

        getTotalsMessageWithSkip() {
            return $t('Items %1-%2 of %3')
                .replace('%1', this.skip + 1)
                .replace('%2', Math.min(this.skip + this.limit, this.total))
                .replace('%3', this.total);
        }
    });
});
