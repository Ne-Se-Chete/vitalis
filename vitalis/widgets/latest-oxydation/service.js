const widgetData = {
    id: 'avg-bpm-widget',
    label: 'Average Hart Rate BPM Widget',
    link: '/services/web/vitalis/widgets/latest-oxydation/index.html',
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