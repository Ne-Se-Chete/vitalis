angular.module('bpm', ['ideUI', 'ideView'])
    .controller('BPMController', ['$scope', '$http', function ($scope, $http) {
        $scope.state = {
            isBusy: true,
            error: false,
            busyText: "Loading...",
        };

        const serviceUrl = "/services/ts/codbex-invoices/widgets/api/InvoiceService.ts/invoiceData";
        $http.get(serviceUrl)
            .then(function (response) {
                $scope.BPM = response.data;
            });
    }]);