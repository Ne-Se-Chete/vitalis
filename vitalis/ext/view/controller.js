const app = angular.module('templateApp', ['ideUI', 'ideView']);

// sets up the request data for chatgpt
function getRequestData(information, tokens) {
    return {
        model: "gpt-4",
        messages: [
            // {
            //     role: "system",
            //     content: "You are an assistant."
            // },
            {
                role: "user",
                content: information
            }
        ],
        max_tokens: tokens
    };
}

const URL_GET_DATA = "/services/ts/vitalis/gen/vitalis/api/Measurements/MeasurementsService.ts"
app.controller('templateController', ['$scope', '$http', 'ViewParameters', function ($scope, $http, ViewParameters) {
    $scope.aiResponse = "Loading...";

    const params = ViewParameters.get();

    $http.get(`${URL_GET_DATA}/${params.id}`)
        .then(function (response_measurments) {
            const ai_prompt = `
                Your task is to write ONLY one-two sentences on the available metrics. Your task is to be a helping hand to a medical doctor. 2 sentences, nothing more. Dont say that you agree with me. This is your data, analyze it, say any possible illnesses. 
                ${JSON.stringify(response_measurments.data)}
            `

            $http.get("/services/ts/vitalis/ext/view/api/APIService.ts")
                .then(function (response_api_key) {


                    $http.post('https://api.openai.com/v1/chat/completions', getRequestData(ai_prompt, 200), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + response_api_key.data.replace("\n", "")
                        }
                    }).then(function (response_ai) {
                        $scope.aiResponse = response_ai.data.choices[0].message.content;
                    },
                        function (_) { // error handling
                            $scope.aiResponse = "Currently no AI integration is available.";
                        }
                    );
                })
        });
}]);
