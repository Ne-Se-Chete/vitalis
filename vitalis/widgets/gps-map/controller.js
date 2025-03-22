const leaflet = angular.module('leaflet', ['ideUI', 'ideView']);

const URL_GET_DATA = "/services/ts/vitalis/gen/vitalis/api/Measurements/MeasurementsService.ts";


leaflet.controller('LeafletViewController', ['$scope', "$http", '$document', 'messageHub', 'ViewParameters', function ($scope, $http, $document, messageHub, ViewParameters) {
    $scope.state = {
        isBusy: true,
        error: false,
        busyText: "Loading...",
    };

    $scope.loadMap = function () {
        var map = L.map('map');

        var customMarker = L.Marker.extend({
            // options: {
            // }
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                map.setView([latitude, longitude], 15);
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            });
        } else {
            map.setView([0, 0], 15);
            console.log("Geolocation is not supported by this browser.");
        }


        function createMarker(object) {
            let markers = [];
            object.forEach(markerData => {
                //creates a new marker
                let marker = new customMarker([markerData.Latitude, markerData.Longitude], {});
                markers.push(marker);
                marker.addTo(map);
            });
        }

        $http.get(URL_GET_DATA)
            .then((response) => {
                try {
                    createMarker(response.data);
                } catch (e) {
                    alert(e);
                }
                $scope.state.isBusy = false;
            })

    };

    // Get the view parameters. If you don't need this, you can remove ViewParameters altogether.
    // If you do, then you can check if the parameter you need is provided using `if (!$scope.dataParameters.hasOwnProperty(<param-name>))`
    // If there is an error, you need to set the state:
    // $scope.state.error = true;
    // $scope.errorMessage = "The 'file' data parameter is missing.";
    $scope.dataParameters = ViewParameters.get();
    angular.element($document[0]).ready(function () {
        $scope.$apply(function () {
            $scope.loadMap();
        });
    });
}]);