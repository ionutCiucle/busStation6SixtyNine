var Sequelize = require("sequelize");
var Promise = require("bluebird");
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var Bus = require("../../Bus");
var passengerDataAccess = require("./PassengerDataAccess").getInstance();

function BusDataAccess(){
    util.inherits(BusDataAccess, EventEmitter);
    var self = this;
    var sequelize = new Sequelize("db_transporter_manele", "root", "manele2015");
    var Buses = sequelize.define("tbl_buses", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        owner_first_name: Sequelize.STRING,
        owner_last_name: Sequelize.STRING,
        color: Sequelize.STRING,
        capacity: Sequelize.INTEGER,
        hp: Sequelize.INTEGER,
        hasAc: Sequelize.BOOLEAN,
        passengers: Sequelize.INTEGER //TODO: add foreign key references
    });
    //create DB table
    Buses.sync({force: true}).then(function(){
            self.initialize().then(function(){
            }, function(error){
                console.log("Error occured while inserting");
                console.log(error.message);
            });
        }
    );
    self.initialize = function() {
        return new Promise(function(resolve){
            try{
                Buses.build({
                    owner_first_name: "Gica",
                    owner_last_name: "Craioveanu",
                    color: "red",
                    capacity: 28,
                    hp: 3,
                    hasAc: true,
                    passengers: null
                }).save();
                Buses.build({
                    owner_first_name: "Laction",
                    owner_last_name: "Galagatescu",
                    color: "yellow",
                    capacity: 3,
                    hp: 5,
                    hasAc: false,
                    passengers: null
                }).save();
                resolve();
            }catch(e){
                reject(e);
            }
        });
    };
    this.getBuses = function() {
        return new Promise(function(resolve, reject){
            Buses.findAll().then(function(buses, rejectData){
                if(rejectData){
                    reject(rejectData);
                }else{
                    passengerDataAccess.getAllPassengers().then(function(passengers, rejectData){
                        if(rejectData){
                            reject(rejectData);
                        }else{
                            for(var i=0; i<buses.length; i++){
                                for(var j=0; j<passengers.length; j++){
                                    if(passengers[j].dataValues.busId === buses[i].dataValues.id){
                                        buses[i].dataValues.passengers = buses[i].dataValues.passengers || [];
                                        buses[i].dataValues.passengers.push(passengers[j].dataValues);
                                    }
                                }
                            }
                            resolve(buses);
                        }
                    })
                }
            })
        });
    };
    this.addBus = function(bus){
        return new Promise(function(resolve, reject){
            var b = Buses.build({
                owner_first_name: bus.owner.firstName,
                owner_last_name: bus.owner.lastName,
                color: bus.color,
                capacity: bus.capacity,
                hp: bus.hp,
                hasAc: bus.hasAc
                //TODO: add passengers DB implementation (with FK)
            }).save().then(function(data){
                data.dataValues.id ? resolve(data.dataValues.id) : reject("Error occured while saving bus in DB.")
            });
        });
    }
}
BusDataAccess.getInstance = function (){
    var _instance;
    if(!_instance){
        _instance = new BusDataAccess();
    }
    return _instance;
}
module.exports = BusDataAccess;
