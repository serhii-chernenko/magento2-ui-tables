define([
    'uiElement',
    'Chernenko_Tables/js/model/listing/pagination',
    'mage/translate'
], (uiElement, Pagination, $t) => {
    'use strict';

    return uiElement.extend({
        defaults: {
            showAllPagesWhenLessThan: 5,
            pagination: [],
            isPrevButtonVisible: false,
            isNextButtonVisible: false,
            Pagination,
            links: {
                skip: '${ $.provider }:skip'
            },
            tracks: {
                pagination: true,
                isPrevButtonVisible: true,
                isNextButtonVisible: true,
                skip: true
            }
        },

        /**
         * Default initialize method.
         * @callback _super
         * @callback setPages
         * @returns {Object} This.
         */
        initObservables() {
            this._super();
            this.setPages();

            return this;
        },

        setPages() {
            this.page = Math.floor(this.skip / this.limit) + 1;
            this.pages = Math.ceil(this.total / this.limit);
        },

        /**
         * Default initialize method.
         * @callback _super
         * @callback createPagination
         * @returns {Object} This.
         */
        initialize() {
            this._super();
            this.setPages();
            this.createPagination();

            return this;
        },

        /**
         * Create pagination when quantity of pages is more than 1.
         * Choose a type of pagination:
         * - if "pages" is bigger than "limit" create a complicated pagination;
         * - if "pages" is less or equals "limit" create a simple pagination.
         * @callback showButtons
         * @callback createComplicatedPagination
         * @callback createSimplePagination
         * @returns {Object} This.
         */
        createPagination() {
            if (this.pages < 2) return this;

            this.showButtons();
            this.pages > this.showAllPagesWhenLessThan ||
            (this.resolution === 'mobile' && this.showAllPagesWhenLessThan > 3)
                ? this.createComplicatedPagination()
                : this.createSimplePagination();
        },

        /**
         * Call methods to render "Prev" and "Next" buttons.
         * @callback showPrevButton
         * @callback showNextButton
         * @returns {Object} This.
         */
        showButtons() {
            this.showPrevButton();
            this.showNextButton();
        },

        /**
         * Show "Prev" button when current page doesn't equal 1.
         * @returns {Object} This.
         */
        showPrevButton() {
            this.isPrevButtonVisible = this.page !== 1;
        },

        /**
         * Show "Next" button when current page doesn't equal last page.
         * @returns {Object} This.
         */
        showNextButton() {
            this.isNextButtonVisible = this.page !== this.pages;
        },

        /**
         * Create simple pagination without jumps.
         * @returns {Object} This.
         * @example
         * 1, 2, 3, 4, 5, ...
         *
         */
        createSimplePagination() {
            for (let page = 1; page <= this.pages; page++) {
                this.pagination.push(page);
            }
        },

        /**
         * Create complicated pagination with jumps.
         * @returns {Object} This.
         * @example
         * 1, ..., 5, ..., 10
         *
         */
        createComplicatedPagination() {
            if (this.page !== 1) {
                this.pagination.push(1);
            }

            if (this.page > 2) {
                this.pagination.push('jump');
            }

            this.pagination.push(this.page);

            if (this.page < this.pages - 1) {
                this.pagination.push('jump');
            }

            if (this.page !== this.pages) {
                this.pagination.push(this.pages);
            }
        },

        /**
         * Go to the previous page.
         * @callback goToPage
         * @returns {Object} This.
         */
        goToPrevPage() {
            this.goToPage(this.page - 1);
        },

        /**
         * Go to thew next page.
         * @callback goToPage
         * @returns {Object} This.
         */
        goToNextPage() {
            this.goToPage(this.page + 1);
        },

        /**
         * Go to a page:
         * - update trackable variable;
         * - fetch data with new parameters.
         * @callback sendAjax
         * @param {number} page - Current page.
         * @returns {Object} This.
         */
        goToPage(page) {
            this.skip = (page - 1) * this.limit;
        }
    });
});
