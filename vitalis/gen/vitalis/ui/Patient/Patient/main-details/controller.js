angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'vitalis.Patient.Patient';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/vitalis/gen/vitalis/api/Patient/PatientService.ts";
	}])
	.controller('PageController', ['$scope',  '$http', 'Extensions', 'messageHub', 'entityApi', function ($scope,  $http, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "Patient Details",
			create: "Create Patient",
			update: "Update Patient"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'vitalis-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "Patient" && e.view === "Patient" && e.type === "entity");
		});

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Id
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsGender = [];
				$scope.optionsDoctor = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.Birthdate) {
					msg.data.entity.Birthdate = new Date(msg.data.entity.Birthdate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsGender = msg.data.optionsGender;
				$scope.optionsDoctor = msg.data.optionsDoctor;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsGender = msg.data.optionsGender;
				$scope.optionsDoctor = msg.data.optionsDoctor;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.Birthdate) {
					msg.data.entity.Birthdate = new Date(msg.data.entity.Birthdate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsGender = msg.data.optionsGender;
				$scope.optionsDoctor = msg.data.optionsDoctor;
				$scope.action = 'update';
			});
		});

		$scope.serviceGender = "/services/ts/vitalis/gen/vitalis/api/Settings/GenderService.ts";
		$scope.serviceDoctor = "/services/ts/vitalis/gen/vitalis/api/Doctor/DoctorService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Patient", `Unable to create Patient: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Patient", "Patient successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Patient", `Unable to update Patient: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Patient", "Patient successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};
		
		//-----------------Dialogs-------------------//
		
		$scope.createGender = function () {
			messageHub.showDialogWindow("Gender-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createDoctor = function () {
			messageHub.showDialogWindow("Doctor-details", {
				action: "create",
				entity: {},
			}, null, false);
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshGender = function () {
			$scope.optionsGender = [];
			$http.get("/services/ts/vitalis/gen/vitalis/api/Settings/GenderService.ts").then(function (response) {
				$scope.optionsGender = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshDoctor = function () {
			$scope.optionsDoctor = [];
			$http.get("/services/ts/vitalis/gen/vitalis/api/Doctor/DoctorService.ts").then(function (response) {
				$scope.optionsDoctor = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};

		//----------------Dropdowns-----------------//	
		

	}]);