// @flow

import config from 'lib/config';
import { getLocalCurrencySymbol } from 'lib/geolocation';
import { constructQuery as constructURLQuery } from 'lib/url';

import { displayIframeEpic } from 'common/modules/commercial/epic/iframe-epic-utils';

import type { EpicComponent } from 'common/modules/commercial/epic/epic-utils';

const getOptimizeEpicUrl = (): string => {
    const url =
        config.get('page.optimizeEpicUrl') ||
        // FIXME
        'http://reader-revenue-components.s3-website-eu-west-1.amazonaws.com/epic/v1/index.html';
    // data passed in query string used to augment iframe
    const params = constructURLQuery({
        // used in acquisition tracking link
        pvid: config.get('ophan.pageViewId'),
        url: window.location.href.split('?')[0],
        // use to display local currency in pricing
        lcs: getLocalCurrencySymbol(),
    });
    return `${url}?${params}`;
};

const displayOptimizeEpic = (): Promise<EpicComponent> => {
    const url = getOptimizeEpicUrl();
    return displayIframeEpic(url);
};

export { displayOptimizeEpic };