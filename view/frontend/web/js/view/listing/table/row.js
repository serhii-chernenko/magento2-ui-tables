define(['uiCollection', 'uiLayout'], (uiCollection, uiLayout) => {
    'use strict';

    return uiCollection.extend({
        /**
         * Default initialize method.
         * @callback buildCells
         * @returns {Object} This.
         */
        initialize() {
            this._super();
            this.buildCells();

            return this;
        },

        /**
         * Get columns that have to be rendered and find the same key in the object "row".
         * If key didn't find, set the value "-".
         * @callback getAdditionalConfig
         * @returns {Object} This.
         */
        buildCells() {
            const { component, template } = this.components.default;

            for (const cell of this.columns) {
                uiLayout([
                    {
                        component,
                        template,
                        parent: this.name,
                        name: `cell-${cell}`,
                        cell,
                        value: cell in this.row ? this.row[cell] : '-',
                        ...this.getAdditionalConfig(cell, this.row[cell]),
                        htmlClass: `${this.tableHtmlClass}__cell`,
                        tableHtmlClass: this.tableHtmlClass,
                        resolution: this.resolution
                    }
                ]);
            }
        },

        /**
         * Set additional config that could replace predefined values in the method "buildCells".
         * "Status" column has to have "value" (status code) and "label" (status label).
         * "Details" column has to have "label" for a text of the link.
         * @callback getComponentCellTemplate
         * @param {string} cell   - Current column that has to be rendered.
         * @param {string} value  - Value that got from the object "row" with the column key.
         * @param {Object} config - Empty object to collect properties.
         * @returns {Function} Method getComponentCellTemplate.
         */
        getAdditionalConfig(cell, value, config = {}) {
            if (cell === 'details') {
                config.label = this.detailsColumnLabel;
            }

            return this.getComponentCellComponentAndTemplate(config, cell);
        },

        /**
         * Set a custom template for some columns.
         * "Details" column has to have the template with the same name details.html on the desktop resolution.
         * "Actions" column has to have the template with the same name actions.html on the desktop resolution.
         * "Actions" column has to have the template actions-mobile.html on the mobile resolution.
         * @param {Object} config - Object to collect properties.
         * @param {string} cell   - Current column that has to be rendered.
         * @returns {Object} Config object with collected properties.
         */
        getComponentCellComponentAndTemplate(config, cell) {
            if (this.resolution === 'desktop' && cell === 'details') {
                const { component, template } = this.components[cell];

                config = {
                    ...config,
                    component,
                    template
                };
            } else if (cell === 'actions') {
                const { component, templates } = this.components[cell];

                config = {
                    ...config,
                    component,
                    template: templates[this.resolution]
                };
            }

            return config;
        }
    });
});
