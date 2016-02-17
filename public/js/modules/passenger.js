angular.module("passenger", [])
    .factory("passengerFactory", [function() {
        function Passenger(id, firstName, lastName, gender, age) {
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.gender = gender || "N/A";
            this.age = age;
            this.acquaintances = [];
        }
        Passenger.prototype.chat = function(passenger) {
            if(passenger instanceof Passenger){
                console.log("I'm currently chatting with " + passenger.name);
                this.acquaintances.push(passenger);
            } else {
                console.log("Cannot chat with something non-human, bub...");
            }
        };
        return {
            createPassenger: function(id, fn, ln, g, a) {
                return new Passenger(id, fn, ln, g, a);
            },
            jsonToPassenger: function(jsonObj){
                return new Passenger(jsonObj.id, jsonObj.firstName, jsonObj.lastName, jsonObj.gender ? "Male" : "Female", jsonObj.age);
            }
        }
    }])
    .service("passengerService", ["passengerFactory", function(passengerFactory){
        var self = this;
        var rawData = [
            {
                fn: "Oscar",
                ln: "Wilde",
                g: "m",
                a: "161"
            },
            {
                fn: "Gica",
                ln: "Craioveanu",
                g: "m",
                a: "40"
            }
        ];
        self.registeredPassengers = [];
        self.registerPassengers = function() {
            for(var i = 0; i < rawData.length; i++){
                self.registeredPassengers.push(passengerFactory.createPassenger(rawData[i].fn,
                    rawData[i].ln, rawData[i].g, rawData[i].a));
            }
        };
    }]);