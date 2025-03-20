const navigationData = {
    id: 'measurement-navigation',
    label: "Measurements",
    group: "main",
    order: 100,
    link: "/services/web/vitalis/gen/vitalis/ui/Measurements/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }