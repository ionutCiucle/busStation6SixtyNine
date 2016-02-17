var Sequelize = require("sequelize");
var Passenger = require("../../Passenger");

function PassengerDataAccess(){
    var self = this;
    var syncedPassengers = [];//for cognitive reasons, don't use in-memory data stores, nigger!
    var sequelize = new Sequelize("db_transporter_manele", "root", "manele2015");
    var Passengers = sequelize.define("tbl_passengers", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        gender: Sequelize.BOOLEAN,
        age: Sequelize.INTEGER,
        busId: Sequelize.INTEGER
        //TODO: add acquaintances with foreign key references
    });
    Passengers.sync({force:true});
    self.addPassenger = function(passenger, busId){
        return new Promise(function(resolve, reject){
                Passengers.build({ //build returns a non-DB-persisted instance
                firstName: passenger.firstName,
                lastName: passenger.lastName,
                gender: passenger.gender === "Male" ? 1 : 0,
                age: passenger.age,
                busId: busId
            }).save().then(function(resolveData, rejectData){
                if(rejectData){
                    reject(rejectData)
                }else{
                    resolve(resolveData);
                }
            });
        });
    };
    self.addPassengerWithPersistence = function(passenger, busId){//.create() returns a DB-persisted instance
        return new Promise(function(resolve, reject){
                Passengers.create({
                firstName: passenger.firstName,
                lastName: passenger.lastName,
                gender: passenger.gender === "Male" ? 1 : 0,
                age: passenger.age,
                busId: busId
            }).then(function(createdPassenger, errorData){
                    if(errorData){
                        reject(errorData);
                    } else{
                        syncedPassengers.push(createdPassenger);
                        resolve(createdPassenger.get().id);//use get in order to access the persisted object's properties more easily,
                                                           //but pass the PLAIN object to data stores (object collections, etc),
                                                           //in order not to lose PERSISTENCE
                    }
                });
        })
    };
    self.getPassengers = function (busId){
        return new Promise(function(resolve, reject){
            Passengers.findAll({
                where: {
                    busId: Number(busId)
                }
            }).then(function(resolveData, rejectData){
                if(rejectData){
                    reject(rejectData);
                }else{
                    resolve(resolveData);
                }
            });
        });
    };
    self.getAllPassengers = function(){
        return new Promise(function(resolve, reject){
            Passengers.findAll().then(function(passengers, rejectData){
                rejectData ? reject(rejectData) : resolve(passengers);
            })
        })
    }
    //for cognitive reasons, don't use in-memory data store, bub!
    self.getPersistedPassengers = function(busId){
        var returnedPassengers = [];
        for(var i = 0; i < syncedPassengers.length; i++){
            if(syncedPassengers[i].get().busId === busId){
                returnedPassengers.push(syncedPassengers[i].get());
            }
        }
    };
    //for cognitive reasons, don't use in-memory data store, bub!
    self.removePassenger = function(passengerId){
        return new Promise(function(resolve, reject){
            Passengers.destroy({
                where: {
                    id: passengerId
                }
            }).then(function(resolveData, rejectData){//resolveData e 1 cand se sterge cu succes
                rejectData ? reject(rejectData) : resolve(passengerId);
            });
        })
    };
    //for cognitive reasons, don't use in-memory data store, bub!
    self.removePassengerWithPersistence = function(passengerId){
        for(var i = 0; i < syncedPassengers.length; i++){
            if(syncedPassengers[i]._boundTo.dataValues.id === passengerId){
                syncedPassengers[i].destroy().then(function(resolveData, rejectData){
                    rejectData ? reject(rejectData) : resolve(resolveData);
                });
            }
        }
    };
}
PassengerDataAccess.getInstance = function() {
    var _instance;
    if(!_instance){
        _instance = new PassengerDataAccess();
    }
    return _instance;
};
module.exports = PassengerDataAccess;