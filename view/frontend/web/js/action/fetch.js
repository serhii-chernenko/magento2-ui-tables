define(['mage/translate', 'mage/url'], ($t, urlBuilder) => {
    'use strict';

    /**
     * Request table data.
     * Don't throw any errors here, work with a response in components.
     * @callback resolve
     * @callback reject
     * @param {string}  url    - Argument "ajaxUrl" of component.
     * @param {Object}  params - Empty object to extend the predefined config.
     * @param {boolean} debug  - Show console logs of response.
     * @param {boolean} isExternal  - Is URL external.
     * @returns {Promise} Fetched data.
     * @async
     */
    return (url, params, debug, isExternal, type = 'application/json') => {
        // eslint-disable-next-line no-undef,no-unreachable
        return new Promise(async (resolve, reject) => {
            if (!url) {
                reject(`URL address doesn't set`);
            }

            try {
                const requestUrl = new URL(
                    isExternal ? url : urlBuilder.build(url)
                );

                requestUrl.search = new URLSearchParams({
                    ...params,
                    timestamp: Date.now()
                }).toString();

                const response = await fetch(requestUrl.toString(), {
                    cache: 'no-cache',
                    headers: {
                        Accept: type
                    }
                });

                if (debug) {
                    // eslint-disable-next-line no-console
                    console.log('response', response);
                }

                if (!response.ok && response.status === 404) {
                    reject({
                        text: $t('Fetch error status: %1').replace(
                            '%1',
                            response.status
                        ),
                        type: 'error'
                    });
                }

                const data = await response.json();

                if (debug) {
                    // eslint-disable-next-line no-console
                    console.log('JSON data', data);
                }

                if (!response.ok) {
                    reject({
                        text:
                            data?.message?.text ??
                            $t('Fetch error status: %1').replace(
                                '%1',
                                response.status
                            ),
                        type: data?.message?.type ?? 'error'
                    });
                }

                resolve(data);
            } catch (exception) {
                if (debug) {
                    // eslint-disable-next-line no-console
                    console.error(exception);
                }

                reject({
                    text: exception?.message?.text ?? exception,
                    type: exception?.message?.type ?? 'error'
                });
            }
        });
    };
});
