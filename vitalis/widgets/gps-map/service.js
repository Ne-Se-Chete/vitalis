const widgetData = {
    id: 'gps-map-widget',
    label: 'GPS Widget',
    link: '/services/web/vitalis/widgets/gps-map/index.html',
    size: "large"
};

export function getWidget() {
    return widgetData;
}

if (typeof exports !== 'undefined') {
    exports.getWidget = function () {
        return widgetData;
    }
}