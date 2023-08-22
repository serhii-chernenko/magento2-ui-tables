define(['uiCollection', 'uiLayout', 'mage/translate'], (
    uiCollection,
    uiLayout,
    $t
) => {
    'use strict';

    return uiCollection.extend({
        defaults: {
            template: 'Chernenko_Tables/listing/table',
            detailsColumnLabel: $t('View'), // Label of link in "Details" column. Can be overridden in XML.
            hideActionsColumnLabel: false,
            links: {
                sortBy: '${ $.provider }:sortBy',
                sortDirection: '${ $.provider }:sortDirection'
            },
            tracks: {
                renderedColumns: true,
                hideActionsColumnLabel: true,
                sortBy: true,
                sortDirection: true
            },
            modules: {
                parentComponent: '${ $.provider }'
            }
        },

        /**
         * Default initialize method.
         * @callback _super
         * @callback createVariables
         * @returns {Object} This.
         */
        initialize() {
            this._super();
            this.createVariables();
            this.render();

            return this;
        },

        /**
         * Create local variables for the component.
         * @returns {Object} This.
         */
        createVariables() {
            this.needToMergeMobileColumns =
                'details' in this.columns && 'actions' in this.columns;
        },

        /**
         * Do something to render child components.
         * @callback prepareColumns
         * @callback filterRows
         * @returns {Object} This.
         */
        render() {
            this.prepareColumns();
            this.filterRows();
        },

        /**
         * Update the array of columns that have to be rendered:
         * - hide columns that have the property "hideOnMobile" on the mobile resolution.
         * @returns {Object} This.
         */
        prepareColumns() {
            const columns = Object.keys(this.columns);

            this.renderedColumns =
                this.resolution === 'desktop' || !this.needToMergeMobileColumns
                    ? columns
                    : columns.filter(
                          (column) => !this.columns[column]?.hideOnMobile
                      );
        },

        /**
         * Filter rows:
         * - hide columns that don't exist in the array of rendered columns;
         * - hide row if it doesn't have any columns;
         * - show warning if any rows haven't to be rendered.
         * @callback showConsoleError
         * @returns {Object} This.
         */
        filterRows() {
            this.rowsToRender = [];

            for (const item of this.items) {
                const renderedItem = this.prepareItemColumns(item);
                let filter = true;

                for (const cell of Object.keys(renderedItem)) {
                    if (
                        !this.renderedColumns.includes(cell) ||
                        (cell === 'details' && this.needToMergeMobileColumns)
                    ) {
                        continue;
                    }

                    filter = false;
                    break;
                }

                !filter && this.addRowToRenderQueue(renderedItem);
            }

            this.buildRows();
            this.showDebugData();
        },

        /**
         * Update the object of column that have to be rendered:
         * - hide label of thead > th > span from the column "Actions";
         * - hide the column "Detail" if it has the property "hideOnMobile" and move its link to the column "Actions".
         * @param {Object} item - Column that has to be rendered.
         * @returns {Object} Column that has to be rendered.
         */
        prepareItemColumns(item) {
            const renderedItem = {
                ...item,
                details: 'javascript:void(0);', // has to be Details Page URL
                actions: [
                    {
                        label: $t('Remove'),
                        url: 'javascript:void(0);' // has to be Remove URL
                    }
                ]
            };

            if (
                this.resolution === 'mobile' &&
                this.needToMergeMobileColumns &&
                'details' in renderedItem &&
                'actions' in renderedItem
            ) {
                renderedItem.actions = [
                    {
                        label: this.detailsColumnLabel,
                        url: renderedItem.details
                    },
                    ...renderedItem.actions
                ];
                this.hideActionsColumnLabel = true;
            } else {
                this.hideActionsColumnLabel = false;
            }

            return renderedItem;
        },

        /**
         * Show console errors of table data if the "debug" argument set as "true" {boolean}.
         * @returns {Object} This.
         */
        showDebugData() {
            if (!this.debug) {
                return this;
            }

            /* eslint-disable no-console */
            console.group('Table data');
            console.log('Expected keys in each item:', this.renderedColumns);

            for (const [index, cells] of this.items.entries()) {
                console.log(`Row ${index} keys:`, Object.keys(cells));
            }

            console.log('Response', this.items);
            console.groupEnd();
            /* eslint-enable no-console */
        },

        /**
         * Render child components (rows).
         * Component has to have unique name on each render not to be cached.
         * Use Data.now() or uuid() to generate a unique name.
         * @param {Object} item - Item that has to be rendered.
         * @returns {Object} This.
         */
        addRowToRenderQueue(item) {
            this.rowsToRender.push({
                component: this.components.row.component,
                template: this.components.row.template,
                parent: this.name,
                name: `row-${item.id}-${Date.now()}`,
                row: item,
                components: this.components.cell,
                columns: this.renderedColumns,
                resolution: this.resolution,
                detailsColumnLabel: this.detailsColumnLabel,
                htmlClass: `${this.htmlClass}__row`,
                tableHtmlClass: this.htmlClass
            });
        },

        /**
         * Render child components (rows).
         * @returns {Object} This.
         */
        buildRows() {
            if (!this.rowsToRender.length) {
                return this;
            }

            uiLayout(this.rowsToRender);
        },

        /**
         * Enable sorting by column and set a direction.
         * @callback sendAjax
         * @param {string} column - Column that has to be sorted.
         * @returns {Object} This.
         */
        sortByClick(column) {
            if (this.sortBy === column) {
                this.sortDirection =
                    this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
            } else {
                this.sortDirection = 'ASC';
                this.sortBy = column;
            }
        }
    });
});
