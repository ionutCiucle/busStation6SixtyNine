angular.module("busStation", ["bus", "passenger", "ui.router", "socketIO"])
    .config(function($stateProvider, $urlRouterProvider){
        var absoluteDirPath = "C:/Users/ionutciucle/WebstormProjects/TransporterWS";

        $stateProvider.state("home",{
            name: "home",
            url: "/home",
            controller: "HomeController",
            templateUrl: "/html/partials/home.html"
        }).state("buses",{
            name: "buses",
            url:"/buses",
            controller: "BusStationController",
            templateUrl: "/html/partials/buses.html"
        }).state("addBus",{
            name: "addBus",
            url: "/addBus",
            controller: "AddBusController",
            templateUrl: "/html/partials/addBus.html"
        }).state("addPassengers", {
            name: "addPassengers",
            url: "/addPassengers",
            controller: "AddPassengersController",
            templateUrl: "/html/partials/addPassengers.html"
        });
        $urlRouterProvider.otherwise("/home");
    })
    .service("naviService", ["$state", "busFactory", function($state, busFactory) {
        function NaviServiceException(message, serviceInstance){
            this.message = message;
            this.serviceInstance = serviceInstance;
        }
        var self = this;
        self.caches = {
            busCache: null,
            other: null
        };
        self.goTo = function(destinationName, param){
            if(arguments.length === 1){
                $state.go(destinationName);
            }else{
                if(busFactory.isBus(param)){
                    //recreate Bus object in order to reclaim its constructor
                    self.caches.busCache = busFactory.createBus(null,{ firstName: param.owner.firstName, lastName: param.owner.lastName },
                        param.color, param.capacity, param.hp, param.hasAc);
                    self.caches.busCache.id = param.id;
                    self.caches.busCache.passengers = param.passengers;
                }else {
                    self.caches.other = param;
                }
                $state.go(destinationName);
            }
        };
    }])
    .controller("MainController", ["$scope", "$state", "$rootScope", "socketFactory", function($scope, $state, $rootScope, socketFactory){
        $scope.unsubscribeToStateChange = $rootScope.$on("$stateChangeStart", function(event, toState){
            $scope.previousState = toState.name;
            $scope.currentState = toState.name;
        });
        $scope.busCounter = 0;
        $scope.loadView = function(name){
            $state.go(name);
            if($scope.previousState !== name){
                $scope.previousState = $state.current.name;
            }
            $scope.currentState = name;
            if($scope.currentState === "buses" || $scope.previousState === "buses"){
                $scope.busCounter = 0;
            }
        };
        $scope.unsubscribeToBusAddition = socketFactory.on("added-bus", function(){
            if($scope.currentState !== "buses"){
                $scope.busCounter++;
            }
        });
    }])
    .controller("HomeController", [function(){
        //Empty, for now
    }])
    .controller("BusStationController", ["$scope", "busService", "naviService", "socketFactory",
        function($scope, busService, naviService, socketFactory) {
            $scope.buses;
            $scope.getBuses = function(){
                busService.getAvailableBuses().then(function(){
                    $scope.buses = busService.availableBuses;
                });
            };
            $scope.getBuses();
            $scope.goTo = function(destination, param) {
                naviService.goTo(destination, param);
            };
            socketFactory.on("added-bus", $scope.getBuses);
    }])
    .controller("AddBusController", ["$scope", "busFactory", "busService", function($scope, busFactory, busService){
        $scope.availableColors = [
            {
                id: 1,
                label: "Red"
            },
            {
                id: 2,
                label: "Orange"
            },
            {
                id: 3,
                label: "Blue"
            }
        ];
        $scope.addBus = function(){
            var newBus = busFactory.createBus(
                null,
                {
                    firstName: $scope.firstName,
                    lastName: $scope.lastName
                },
                $scope.color.label,
                $scope.capacity,
                $scope.hp,
                $scope.hasAc);
            busService.addBus(newBus);
        }
    }])
    .controller("AddPassengersController", ["$scope", "passengerFactory", "busService", "naviService", "$q", "socketFactory",
        function($scope, passengerFactory, busService, naviService, $q, socketFactory){
            $scope.currentBus = naviService.caches.busCache;
            $scope.getPassengers = function(){
                busService.getPassengers($scope.currentBus.id)
                    .then(function(resolveData, rejectData){
                        var passengers = [];
                        if(!rejectData){
                            for(var i = 0; i < resolveData.data.length; i++){
                                passengers.push(
                                    passengerFactory.createPassenger(resolveData.data[i].id,resolveData.data[i].firstName,
                                        resolveData.data[i].lastName, resolveData.data[i].gender ? "Male": "Female",
                                        resolveData.data[i].age)
                                )
                            }
                            $scope.currentBus.passengers = passengers;
                        }
                    });
            };
            $scope.getPassengers();
            $scope.addPassenger = function(){
                var passenger = passengerFactory.createPassenger(null, $scope.firstName, $scope.lastName,
                    $scope.gender, $scope.age);
                busService.addPassenger(passenger, $scope.currentBus.id);//VEZI DACA II OK
//                    .then(function(resolveData, rejectData){
//                    if(!rejectData){
//                        passenger.id = resolveData.id;
//                        $scope.currentBus.passengers.push(passengerFactory.jsonToPassenger(passenger));
//                    }
//                });
            };
            $scope.removePassenger = function(passengerId, busId){
                busService.removePassenger(passengerId, busId);//VEZI DACA MERGE
//                    .then(function(resolveData, rejectData){
//                        if(rejectData){
//                            console.log("Couldn't remove selected passenger");
//                        }else{
//                            for(var i = 0; i < $scope.currentBus.passengers.length; i++){
//                                if($scope.currentBus.passengers[i].id === passengerId){
//                                    $scope.currentBus.passengers.splice(i, 1);
//                                }
//                            }
//                        }
//                    })
            };
            $scope.unsubscribeToPassengerAlteration = socketFactory.on("altered-passengers", function(eventData){
                eventData = JSON.parse(eventData);
                if(eventData.busId === $scope.currentBus.id){
                    if(eventData.added){//not the way to go; receive data instead of performing another request
                        $scope.currentBus.passengers.push(eventData.passenger);
                    }else{
                        for(var i=0; i<$scope.currentBus.passengers.length; i++){
                            if($scope.currentBus.passengers[i].id == eventData.passengerId){
                                $scope.currentBus.passengers.splice(i, 1);
                            }
                        }
                    }
                }
            });
        }])
    .directive("busCard", function() {
        return {
            restrict: "E",
            controller: ["$scope", "socketFactory", "busService", "passengerFactory", function($scope, socketFactory, busService, passengerFactory){
                $scope.currentBus = $scope.busAttribute;
                $scope.unsubscribeToPassengerMod = socketFactory.on("altered-passengers", function(eventData){
                        eventData = JSON.parse(eventData);
                        if(eventData.busId === $scope.currentBus.id){
                            if(eventData.added){//not the way to go; receive data instead of performing another request
                                $scope.currentBus.passengers.push(eventData.passenger);
//                        busService.getPassengers($scope.currentBus.id).then(function(resolveData, rejectData){
//                            if(resolveData){
//                                var passengers = [];
//                                for(var i=0; i<resolveData.data.length; i++){
//                                    passengers.push(passengerFactory.jsonToPassenger(resolveData.data[i]));
//                                }
//                                $scope.currentBus.passengers = passengers;
//                            }else{
//                                console.log("ERORSKI!");
//                                console.log(rejectData);
//                            }
//
//                        })
                            }else{
                                for(var i=0; i<$scope.currentBus.passengers.length; i++){
                                    if($scope.currentBus.passengers[i].id == eventData.passengerId){
                                        $scope.currentBus.passengers.splice(i, 1);
                                    }
                                }
                            }
                        }
                    }
                )
            }],
            scope: {
                busAttribute: "=currentBusAttr"
            },
            replace: true,
            templateUrl: "/html/partials/busTemplate.html"
        }});
    //DIRECTIVE with CONTROLLER and input ATTRIBUTE
//    .directive("passengerCard", ["passengerService", function(passengerService){
//        return {
//            restrict: "E",
//            controller: ['$scope', function($scope){
//                $scope.passenger = $scope.currentPassenger;
//            }],
//            scope: {
//                currentPassenger: "=currentPassAttr"
//            },
//            templateUrl: "/html/partials/passengerTemplate.html"
//        }
//    }]);