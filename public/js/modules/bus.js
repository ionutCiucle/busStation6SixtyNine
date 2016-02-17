angular.module("bus", ["passenger"])
    .factory("busFactory", ["passengerFactory", function(passengerFactory) {
        var id = 1;
        function Bus(id, owner, color, capacity, hp, hasAc, passengers) {
            var self = this;
            self.id = id;
            self.owner = owner;
            self.color = color;
            self.capacity = capacity;
            self.hp = hp;
            self.hasAc = hasAc;
            self.passengers = passengers || [];
        }
        Bus.prototype.addPassenger = function(passenger) {
            this.passengers.push(passenger);
        };
        Bus.prototype.removePassenger = function(firstName, lastName, age) {
            for(var i = 0; i < this.passengers.length; i++){
                if(this.passengers[i].firstName === firstName && this.passengers[i].lastName === lastName &&
                        this.passengers[i].age === age){
                    this.passengers.splice(i, 1);
                    console.log("Kicked out " + firstName + " " + lastName);
                } else {
                    console.log("Passenger not found...");
                }
            }
        };
        return {
            createBus: function(id, owner, color, capacity, hp, hasAc, passengers) {
                return new Bus(id, owner, color, capacity, hp, hasAc, passengers);
            },
            isBus: function(obj) {
                return obj instanceof Bus;
            }
        }
    }])
    .service("busService", ["$http", "$q", "busFactory", function($http, $q, busFactory) {
        function BusServiceException(message, instance){
            this.message = message;
            this.instance = instance;
        }
        var self = this;

        self.availableBuses = [];
        self.getAvailableBuses = function() {
            var self = this;
            return $q(function(resolve, reject){
                $http.get("/getBuses").then(function(response, error){
                    if(error){
                        reject(error);
                    }else{
                        var receivedBuses = [];
                        for(var i = 0; i < response.data.length; i++){
                            receivedBuses.push(busFactory.createBus(response.data[i].id, response.data[i].owner,
                                response.data[i].color, response.data[i].capacity, response.data[i].hp, response.data[i].hasAc, response.data[i].passengers))
                        }
                        self.availableBuses = receivedBuses;
                        resolve();
                    }
                });
            });

        };
        self.getAvailableBuses();
        self.addBus = function(bus) {
            if (busFactory.isBus(bus)) {
                $http.post("/addBus", bus).then(function (response) {
                    bus.id = Number(response.data);
                    self.availableBuses.push(bus);
                })
            }
        };
        self.addPassenger = function(passenger, busId){
            return $q(function(resolve, reject){
                $http.post("/addPassenger", JSON.stringify({
                    passenger: passenger,
                    busId: busId
                    }))
                    .then(function(response){
                    resolve(response.data);
                });
            });
        };
        self.getPassengers = function(busId){
            return $q(function(resolve, reject){
                $http.get("/getPassengers/"+busId)
                    .then(function(response, error){
                        error ? reject(error) : resolve(response);
                    });
            });
        };
        self.removePassenger = function(passengerId, busId){
            return $q(function(resolve, reject){
                $http.delete("/removePassenger/"+passengerId+"/"+busId).then(function(responseData, errorData){
                    errorData ? reject(errorData) : resolve(responseData);
                });
            })
        };
        self.editBus = function(newBus){
            var notFound = 0;
            for(var i = 0; i < self.availableBuses.length; i++){
                if(self.availableBuses[i].id === newBus.id){
                    self.availableBuses[i] = newBus;
                }else {
                    notFound++;
                }
            }
            if(notFound === availableBuses.length){
                throw new BusServiceException("Input bus doesn't match with any of the existing ones", {
                   inputBus: newBus,
                   availableBuses: self.availableBuses
                });
            }
        };
    }]);