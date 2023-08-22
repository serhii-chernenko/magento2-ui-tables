define([
    'uiCollection',
    'matchMedia',
    'uiLayout',
    'Chernenko_Tables/js/action/fetch',
    'mage/translate'
], (uiCollection, mediaCheck, uiLayout, fetchTableData, $t) => {
    'use strict';

    return uiCollection.extend({
        defaults: {
            template: 'Chernenko_Tables/listing',
            components: {
                message: {
                    component: 'Chernenko_Tables/js/view/listing/message',
                    template: 'Chernenko_Tables/listing/message',
                    name: 'message',
                    displayArea: 'general'
                },
                search: {
                    component: 'Chernenko_Tables/js/view/listing/search',
                    template: 'Chernenko_Tables/listing/search',
                    name: 'search',
                    displayArea: 'top-left',
                    inputDelay: 1000,
                    placeholder: $t('Search'),
                    fetchSource: {
                        url: '', // has to be set in XML
                        external: false // change to true in XML, if you want to fetch data from external source
                    }
                },
                table: {
                    skeleton: {
                        component: 'uiElement',
                        template: 'Chernenko_Tables/listing/table/skeleton',
                        name: 'skeleton-table',
                        displayArea: 'general'
                    },
                    general: {
                        component: 'Chernenko_Tables/js/view/listing/table',
                        template: 'Chernenko_Tables/listing/table',
                        name: 'table',
                        displayArea: 'general'
                    },
                    row: {
                        component: 'Chernenko_Tables/js/view/listing/table/row',
                        template: 'Chernenko_Tables/listing/table/row'
                    },
                    cell: {
                        default: {
                            component:
                                'Chernenko_Tables/js/view/listing/table/cell',
                            template:
                                'Chernenko_Tables/listing/table/cell/default'
                        },
                        details: {
                            component:
                                'Chernenko_Tables/js/view/listing/table/cell',
                            template:
                                'Chernenko_Tables/listing/table/cell/details'
                        },
                        actions: {
                            component:
                                'Chernenko_Tables/js/view/listing/table/cell',
                            templates: {
                                desktop:
                                    'Chernenko_Tables/listing/table/cell/actions/desktop',
                                mobile: 'Chernenko_Tables/listing/table/cell/actions/mobile'
                            }
                        }
                    }
                },
                amount: {
                    component: 'Chernenko_Tables/js/view/listing/amount',
                    template: 'Chernenko_Tables/listing/amount',
                    name: 'amount',
                    displayArea: 'bottom-left'
                },
                pagination: {
                    component: 'Chernenko_Tables/js/view/listing/pagination',
                    template: 'Chernenko_Tables/listing/pagination',
                    name: 'pagination',
                    displayArea: 'bottom-right',
                    showAllPagesWhenLessThan: 3
                }
            },
            fetchSource: {
                url: '', // has to be set in XML
                external: false, // change to true in XML, if you want to fetch data from external source
                selectOnlyColumns: false // change to true in XML, if you want to fetch only specified columns
            },
            htmlClass: 'ui-listing',
            mediaBreakpoint: '(min-width: 1025px)',
            resolution: 'desktop',
            columns: [],
            isLoading: false,
            search: '',
            sortBy: null,
            sortDirection: 'ASC',
            limit: 0,
            initialLimit: '${ $.limit } ',
            total: 0,
            skip: 0,
            listens: {
                sortBy: 'onParamsUpdate',
                sortDirection: 'onParamsUpdate',
                skip: 'onParamsUpdate'
            },
            tracks: {
                isLoading: true,
                resolution: true
            },
            statefull: {
                search: true,
                sortBy: true,
                sortDirection: true,
                limit: true,
                total: true,
                skip: true
            },
            debug: false
        },
        response: null,
        items: [],
        componentsToRender: [],

        initialize() {
            this._super();
            this.mediaCheck();

            return this;
        },

        mediaCheck() {
            if (!this.mediaBreakpoint) {
                if (this.debug) {
                    throw new Error(
                        'Set value for the mediaBreakpoint property!'
                    );
                }

                return this;
            }

            mediaCheck({
                media: this.mediaBreakpoint,
                entry: this.onResolutionUpdated.bind(this),
                exit: this.onResolutionUpdated.bind(this, 'mobile')
            });
        },

        onResolutionUpdated(resolution = 'desktop') {
            this.resolution = resolution;

            this.response ? this.buildApp() : this.fetchData();
        },

        /**
         * Dummyjson supports the select parameter to get only the necessary fields as in GraphQL.
         * Request only the fields that specified in columns as keys.
         * IMPORTANT! Dummyjson doesn't support the sortBy and sortDirection parameters.
         * @param {Object} params - Params to send in the request.
         * @return {Object} params
         */
        prepareAjaxParamsRequest(params = {}) {
            params = {
                ...params,
                limit: this.limit,
                skip: this.skip,
                sortBy: this.sortBy, // Not supported by Dummyjson
                sortDirection: this.sortDirection // // Not supported by Dummyjson
            };

            if (this.fetchSource.selectOnlyColumns) {
                params = {
                    ...params,
                    select: Object.keys(this.columns).join(',')
                };
            }

            if (this.search) {
                params = {
                    ...params,
                    q: this.search
                };
            }

            return params;
        },

        /**
         * When this method is called from the children components,
         * statefull won't write updates to the Local Storage.
         * So, don't update trackable observables in simple way like this:
         * this.sortBy = null;
         * Use this instead:
         * this.set('sortBy', null);
         */
        resetParams() {
            this.set('sortBy', null);
            this.set('sortDirection', 'ASC');
            this.set('skip', 0);
            this.set('limit', parseInt(this.initialLimit));
        },

        onParamsUpdate() {
            this.fetchData();
        },

        async fetchData(
            url = this.search
                ? this.components.search.fetchSource.url
                : this.fetchSource.url,
            isExternal = this.search
                ? this.components.search.fetchSource.external
                : this.fetchSource.external
        ) {
            this.beforeFetching();

            try {
                this.onFetchingSuccess(
                    await fetchTableData(
                        url,
                        this.prepareAjaxParamsRequest(),
                        this.debug,
                        isExternal
                    )
                );
            } catch (error) {
                this.onFetchingError(error);
            } finally {
                this.afterFetching();
            }
        },

        beforeFetching() {
            this.isLoading = true;

            this.renderSkeletons();
        },

        renderSkeletons() {
            this.resetChildrenComponents();
            this.addTableSkeletonToRenderQueue();
            this.renderChildrenComponents();
        },

        resetChildrenComponents() {
            this.componentsToRender = [];
            this.destroyChildren();
        },

        addTableSkeletonToRenderQueue() {
            this.componentsToRender.push({
                ...this.components.table.skeleton,
                parent: this.name,
                columns: this.columns,
                renderedColumns: Object.keys(this.columns),
                resolution: this.resolution,
                rootHtmlClass: this.htmlClass,
                htmlClass: `${this.htmlClass}__skeleton-table`,
                limit: this.limit,
                rows: parseInt(this.limit)
            });
        },

        renderChildrenComponents() {
            uiLayout(this.componentsToRender);
        },

        afterFetching() {
            this.isLoading = false;
        },

        onFetchingError(error) {
            if (error?.text && error?.type) {
                this.showMessage(error.text, error.type);

                return this;
            }

            throw error;
        },

        showMessage(text = $t('Oops, something went wrong'), type = 'error') {
            this.resetChildrenComponents();
            this.componentsToRender.push({
                ...this.components.message,
                parent: this.name,
                provider: this.name,
                search: this.search,
                htmlClass: `${this.htmlClass}__message`,
                message: {
                    text,
                    type
                }
            });
            this.renderChildrenComponents();
        },

        onFetchingSuccess(response) {
            if (response?.message) {
                this.showMessage(response.message.text, response.message.type);
            }

            this.updateLocalObservables(response);
            this.buildApp();
        },

        updateLocalObservables(response) {
            this.response = response;
            this.total = response.total;
            this.limit = response.limit;
            this.skip = response.skip;
        },

        buildApp() {
            if (!this.response?.products?.length) {
                this.showMessage($t(`Have no products to show!`), 'warning');

                return this;
            }

            this.resetChildrenComponents();
            this.addComponentsToRenderQueue();
            this.renderChildrenComponents();
        },

        addComponentsToRenderQueue() {
            this.addSearchComponentToRenderQueue();
            this.addTableComponentToRenderQueue();
            this.addAmountComponentToRenderQueue();
            this.addPaginationComponentToRenderQueue();
        },

        addSearchComponentToRenderQueue() {
            this.componentsToRender.push({
                ...this.components.search,
                parent: this.name,
                provider: this.name,
                prevValue: this.search,
                value: this.search,
                htmlClass: `${this.htmlClass}__search`
            });
        },

        addTableComponentToRenderQueue() {
            this.componentsToRender.push({
                ...this.components.table.general,
                parent: this.name,
                provider: this.name,
                components: this.components.table,
                items: this.response.products,
                columns: this.columns,
                renderedColumns: Object.keys(this.columns),
                htmlClass: `${this.htmlClass}__table`,
                rootHtmlClass: this.htmlClass,
                resolution: this.resolution,
                debug: this.debug
            });
        },

        addAmountComponentToRenderQueue() {
            this.componentsToRender.push({
                ...this.components.amount,
                parent: this.name,
                provider: this.name,
                limit: this.limit,
                skip: this.skip,
                total: this.total,
                htmlClass: `${this.htmlClass}__amount`
            });
        },

        addPaginationComponentToRenderQueue() {
            this.componentsToRender.push({
                ...this.components.pagination,
                parent: this.name,
                provider: this.name,
                initialLimit: this.initialLimit,
                limit: this.initialLimit,
                skip: this.skip,
                total: this.total,
                htmlClass: `${this.htmlClass}__pagination`,
                resolution: this.resolution
            });
        }
    });
});
