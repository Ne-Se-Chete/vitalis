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
                if (Array.isArray(response.data) && response.data.length > 0) {
                    let total = 0;
                    let count = 0;

                    response.data.forEach(function (obj) {
                        if (obj.HeartRate != null && !isNaN(obj.HeartRate)) {
                            total += Number(obj.HeartRate);
                            count++;
                        }
                    });

                    $scope.HeartRate = count > 0 ? (total / count) : 0;
                } else {
                    $scope.HeartRate = 0;
                }
            });
    }]);