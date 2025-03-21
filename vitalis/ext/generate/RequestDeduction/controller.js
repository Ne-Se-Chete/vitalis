const app = angular.module('templateApp', ['ideUI', 'ideView']);

app.controller('templateController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, messageHub) {
    let measurementsId = new URLSearchParams(window.location.search).get('measurementsId'); //URL param

    if (!measurementsId) {
        console.error("Measurements ID is missing!");
    }

    const processId = new URLSearchParams(window.location.search).get('processId');

    $scope.showDialog = true;

    const measurementsUrl = "/services/ts/vitalis/ext/generate/RequestDeduction/api/GenerateRquestDeductionService.ts/measurementsData/" + measurementsId;
    const requestUrl = "/services/ts/vitalis/ext/generate/RequestDeduction/api/GenerateRquestDeductionService.ts/request/"
    const approvedUrl = `${requestUrl}${processId}/approve`;
    const deniedUrl = `${requestUrl}${processId}/deny`;


    // $http.get(measurementsUrl)
    //     .then(function (response) {
    //         $scope.measurementsData = response.body
    //     });

    // $http.get(requestStatusesUrl)
    //     .then(function (response) {
    //         $scope.requestStatusData = response.body
    //     });

    $scope.furtherReview = function () {

        $http.put(approvedUrl).then(function (response) {
            if (response.status !== 200) {
                alert(`Unable to approve request: '${response.message}'`);
                return;
            }
        });

    }

    $scope.clearReport = function () {

        $http.put(deniedUrl).then(function (response) {
            if (response.status !== 200) {
                alert(`Unable to deny request: '${response.message}'`);
                return;
            }
        });
    }

    $scope.closeDialog = function () {

        const redirectUrl = "http://" + $scope.Domain + "/services/web/portal/dashboard.html?continue";

        window.location.href = redirectUrl;

        $scope.showDialog = false;
        messageHub.closeDialogWindow("leave-deduction-generate");
    };
}]);