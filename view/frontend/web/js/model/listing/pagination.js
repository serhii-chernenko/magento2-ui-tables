define([], () => {
    'use strict';

    return {
        /**
         * Check if the rendered page is first.
         * @param {string | number} item - Rendered page.
         * @returns {boolean} True - When the rendered page equals 1.
         */
        isFirst(item) {
            return item === 1;
        },

        /**
         * Check if the rendered page is last.
         * @param {string | number} item  - Rendered page.
         * @param {number}          pages - Quantity of all pages.
         * @returns {boolean} True - When the rendered page equals quantity of all pages.
         */
        isLast(item, pages) {
            return item === pages;
        },

        /**
         * Check if the rendered item is a divider "jump".
         * @param {string | number} item - Rendered item.
         * @returns {boolean} True - When the rendered item equals "jump".
         */
        isJump(item) {
            return item === 'jump';
        },

        /**
         * Check if the rendered page is current.
         * @param {string | number} item - Rendered item.
         * @param {number}          page - Current page.
         * @returns {boolean} True - When the rendered item equals the current page.
         */
        isCurrent(item, page) {
            return item === page;
        },

        /**
         * Check if the rendered page has to be a clickable button.
         * @param {string | number} item - Rendered item.
         * @param {number}          page - Current page.
         * @returns {boolean} True - When the rendered item doesn't equal current page and "jump".
         */
        isCTA(item, page) {
            return !this.isCurrent(item, page) && !this.isJump(item);
        },

        /**
         * Return a page value:
         * - '...' for a divider "jump";
         * - page number for a page.
         * @param {string | number} item  - Rendered item.
         * @param {string}          label - "..." by default.
         * @returns {string} If current item is jump, returns '...', if not returns the page value.
         */
        getLabel(item, label = '...') {
            return this.isJump(item) ? label : item;
        }
    };
});
