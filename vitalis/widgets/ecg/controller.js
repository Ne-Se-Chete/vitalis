var app = angular.module('ecg', ['ideUI', 'ideView']);

app.controller('ECGController', ['$scope', '$http', function ($scope, $http) {
    $scope.state = {
        isBusy: false,
        error: false,
        busyText: "Loading...",
    };

    let lineGraphs = {};
    $scope.today = new Date().toDateString();

    const measurementServiceUrl = "/services/ts/vitalis/gen/vitalis/api/Measurements/MeasurementsService.ts";

    $http.get(measurementServiceUrl)
        .then(function (response) {
            if (!response.data || response.data.length <= 0) return;

            let ecg = response.data[response.data.length - 1].ECG;
            let ecgArray = [];

            try {
                if (typeof ecg === 'string' && ecg.includes(',')) {
                    ecgArray = ecg
                        .split(',')
                        .map(x => parseFloat(x.trim()))
                        .filter(x => !isNaN(x));
                }

                // Fallback to flat line if data is invalid
                if (ecgArray.length === 0) {
                    console.warn("Invalid or empty ECG data received. Rendering fallback flat line.");
                    ecgArray = Array(2).fill(0); // default 2-point flatline
                }
            } catch (e) {
                console.error("Error processing ECG data:", e);
                ecgArray = Array(100).fill(0);
            }

            let labels = ecgArray.map((_, index) => index.toString());

            const data = {
                labels: labels,
                datasets: [
                    {
                        label: 'ECG Signal',
                        data: ecgArray,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    }
                ]
            };

            setupLineGraph("lineChart", data);
        })

        .catch(function (error) {
            $scope.state.error = true;
            $scope.state.isBusy = false;
            console.error('Error fetching leads:', error);
        })
        .finally(function () {
            $scope.state.isBusy = false;
        });

    function setupLineGraph(graphElementId, data) {
        if (lineGraphs[graphElementId]) {
            lineGraphs[graphElementId].destroy();
        }

        const lineGraphOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Heart ECG'
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Electrical Activity'
                    },
                    beginAtZero: true
                }
            }
        };

        const lineChartCtx = document.getElementById(graphElementId).getContext('2d');
        lineGraphs[graphElementId] = new Chart(lineChartCtx, {
            type: 'line',
            data: data,
            options: lineGraphOptions
        });
    }
}]);
