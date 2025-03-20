const groupData = {
    id: 'main-group',
    label: "Main",
    icon: "building",
    order: 100
};

function getGroup() {
    return groupData;
}

if (typeof exports !== 'undefined') {
    exports.getgroup = getGroup;
}

export { getGroup }