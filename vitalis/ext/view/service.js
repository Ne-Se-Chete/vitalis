const viewData = {
    id: 'ai-suggestion',
    label: 'View AI Suggestion',
    link: '/services/web/vitalis/ext/view/index.html',
    perspective: 'Measurements',
    view: 'Measurements',
    type: 'entity',
    order: 13
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}