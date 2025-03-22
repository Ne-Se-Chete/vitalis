const navigationData = {
    id: 'patient-navigation',
    label: "Patients",
    group: "main",
    order: 100,
    link: "/services/web/vitalis/gen/vitalis/ui/Patient/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }