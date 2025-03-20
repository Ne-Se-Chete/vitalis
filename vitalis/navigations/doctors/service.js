const navigationData = {
    id: 'doctors-navigation',
    label: "Doctors",
    group: "main",
    order: 100,
    link: "/services/web/vitalis/gen/vitalis/ui/purchaseinvoice/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }