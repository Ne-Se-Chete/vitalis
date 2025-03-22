const widgetData = {
    id: 'avg-bpm-widget',
    label: 'Average Hart Rate BPM Widget',
    link: '/services/web/vitalis/widgets/avg-bpm/index.html',
    // redirectViewId: 'purchase-invoice-navigation',
    size: "small"
};

export function getWidget() {
    return widgetData;
}

if (typeof exports !== 'undefined') {
    exports.getWidget = function () {
        return widgetData;
    }
}