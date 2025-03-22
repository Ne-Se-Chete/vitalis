angular.module('bpm', ['ideUI', 'ideView'])
    .controller('BPMController', ['$scope', '$http', function ($scope, $http) {
        $scope.state = {
            isBusy: true,
            error: false,
            busyText: "Loading...",
        };

        const URL_GET_DATA = "/services/ts/vitalis/gen/vitalis/api/Measurements/MeasurementsService.ts"
        $http.get(URL_GET_DATA)
            .then(function (response) {
                $scope.BloodOxidation = 0;
                if (Array.isArray(response.data) && response.data.length > 0 && response.data[response.data.length - 1].BloodOxidation) {
                    $scope.BloodOxidation = response.data[response.data.length - 1].BloodOxidation;
                }
            });
    }]);