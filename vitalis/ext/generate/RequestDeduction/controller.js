const app = angular.module('templateApp', ['ideUI', 'ideView']);

app.controller('templateController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, messageHub) {
    let measurementsId = new URLSearchParams(window.location.search).get('measurementsId');
    let processId = new URLSearchParams(window.location.search).get('processId');

    if (!measurementsId) {
        console.error("Measurements ID is missing!");
    }

    $scope.showDialog = true;
    $scope.description = "";

    const measurementsUrl = "/services/ts/vitalis/gen/vitalis/api/Measurements/MeasurementsService.ts/" + measurementsId;
    const patientNameUrl = "/services/ts/vitalis/gen/vitalis/api/Patient/PatientService.ts/";
    const approvedUrl = `/services/ts/vitalis/ext/generate/RequestDeduction/api/GenerateRequestDeductionService.ts/requests/${processId}/approve`;
    const deniedUrl = `/services/ts/vitalis/ext/generate/RequestDeduction/api/GenerateRequestDeductionService.ts/requests/${processId}/deny`;
    const requestCreateUrl = "/services/ts/vitalis/gen/vitalis/api/Requests/RequestsService.ts";

    $http.get(measurementsUrl)
        .then(response => {
            $scope.measurementsData = response.data;

            $http.get(patientNameUrl + $scope.measurementsData.Patient)
                .then(response => {
                    $scope.patientName = response.data.Name;
                })
                .catch(function (error) {
                    console.error("Error fetching measurements:", error);
                });
        })
        .catch(function (error) {
            console.error("Error fetching measurements:", error);
        });


    $scope.submitRequest = function (status) {
        let actionUrl = status === 1 ? approvedUrl : deniedUrl;
        let statusText = status === 1 ? "approve" : "deny";

        $http.put(actionUrl)
            .then(function (response) {
                if (response.status !== 200) {
                    alert(`Unable to ${statusText} request: '${response.data.message}'`);
                    return Promise.reject("API Error");
                }
                return $http.post(requestCreateUrl, {
                    "Description": $scope.description,
                    "Status": status,
                    "Measurements": measurementsId
                });
            })
            .then(function (response) {
                if (response.status !== 200) {
                    alert(`Unable to create request: '${response.data.message}'`);
                    return;
                }
                $scope.closeDialog();
            })
            .catch(function (error) {
                console.error("Error processing request:", error);
            });
    };

    $scope.closeDialog = function () {
        window.location.href = `http://${$scope.Domain}/services/web/portal/dashboard.html?continue`;
        $scope.showDialog = false;
        messageHub.closeDialogWindow("leave-deduction-generate");
    };
}]);
