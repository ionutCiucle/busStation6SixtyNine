var Promise = require("bluebird");
var Bus = require("../models/Bus");
var Passenger = require("../models/Passenger");
var Client = require("../models/Client");
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var busDataAccess = require("../models/dataAccess/relational/BusDataAccess").getInstance();
var passengerDataAccess = require("../models/dataAccess/relational/PassengerDataAccess").getInstance();

function BusStation() {
    var self = this;
    var owners = [
        new Client("Gigi", "Fecali"),
        new Client("Laction", "Gorgonzolescu"),
        new Client("Masinel", "Gropescu")
    ];
    this.buses = [
        new Bus(owners[0], "red", 25, 9, true),
        new Bus(owners[1], "blue", 7, 1, false)
    ];
}
util.inherits(BusStation, EventEmitter);
//add functionality to Prototype
BusStation.prototype.getBuses = function() {
    var self = this;
    var processedBuses = [];
    return new Promise(function(resolve, reject) {
        busDataAccess.getBuses().then(function(data) {
            for(var i = 0; i < data.length; i++) {
                processedBuses.push(
                    new Bus(
                        data[i].dataValues.id,
                        {
                            firstName: data[i].dataValues.owner_first_name,
                            lastName: data[i].dataValues.owner_last_name
                        },
                        data[i].dataValues.color,
                        data[i].dataValues.capacity,
                        data[i].dataValues.hp,
                        data[i].dataValues.hasAc,
                        data[i].dataValues.passengers
                    )
                );
            }
            resolve(processedBuses);
        }, function(error){
            reject(error);
        });
    });
};
//TODO: muta toBus in clasa Bus, ca functie statica
BusStation.prototype.toBus = function(jsonObj) {
    var bus;
    if(jsonObj.owner !== null && jsonObj.color !== null
        && jsonObj.capacity !== null && jsonObj.hp !== null && jsonObj.hasAc !== null
        && jsonObj.passengers !== null){
        bus = new Bus(null, jsonObj.owner, jsonObj.color, jsonObj.capacity, jsonObj.hp, jsonObj.hasAc);
        bus.id = jsonObj.id;
        return bus;
    }else{
        throw "JSON object is either a corrupted Bus, or isn't a Bus instance!";
    }
};
BusStation.prototype.addBus = function(jsonBus) {
    var self = this;
    return new Promise(function(resolve, reject){
        busDataAccess.addBus(self.toBus(jsonBus)).then(function(resolvedData, rejectedData){
            rejectedData ? reject(rejectedData) : resolve(resolvedData);
        });
    });
};
BusStation.prototype.addPassenger = function(jsonPass){
    return new Promise(function(resolve, reject){
        passengerDataAccess.addPassenger(Passenger.toPassenger(jsonPass.passenger), jsonPass.busId).then(function(resolveData, rejectData){
            rejectData ? reject(rejectData) : resolve(resolveData);
        });
    });
};
BusStation.prototype.getPassengers = function(busId){
    return new Promise(function(resolve, reject){
        passengerDataAccess.getPassengers(busId).then(function(resolveData, rejectData){
            if(rejectData){
                reject(rejectData);
            }else{
                resolve(resolveData);
            }
        });
    });
};
BusStation.prototype.removePassenger = function(passengerId){
    return new Promise(function(resolve, reject){
        passengerDataAccess.removePassenger(passengerId)
            .then(function(resolveData, rejectData){
                rejectData ? reject(rejectData) : resolve(resolveData);
            });
    });
};
BusStation.getInstance = function() {
    var _instance;
    if(!_instance) {
        _instance = new BusStation();
    }
    return _instance;
};
module.exports = BusStation;