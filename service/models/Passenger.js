var Client = require("./Client");

function Passenger(id, firstName, lastName, gender, age) {
    Client.call(this, firstName, lastName);//copy instance properties from Client
    this.id = id || null;
    this.gender = gender || "N/A";
    this.age = age;
    this.acquaintances = [];
}
//set Passenger's prototype to empty Object that has the prototype of Client
Passenger.prototype = Object.create(Client.prototype);
Passenger.prototype.constructor = Passenger;
//augment Passenger's prototype
Passenger.prototype.hopIn = function() {
    console.log("I, " + this.firstName + ", am hopping in...");
};
Passenger.toPassenger = function(jsonObj){
    if(jsonObj.hasOwnProperty("id") && jsonObj.hasOwnProperty("firstName") && jsonObj.hasOwnProperty("lastName")
        && jsonObj.hasOwnProperty("gender") && jsonObj.hasOwnProperty("age")){
        return new Passenger(null, jsonObj.firstName, jsonObj.lastName, jsonObj.gender, jsonObj.age);
    }else{
        throw new Error("Cannot convert json to Passenger");
    }
};
/*
 *The result of the inheritance process is the following:
 *    - Passenger.prototype: { hopIn: function(){...},
 *                           __proto__: Client { chat: function() {...},
 *                                              __proto__: Object {}
 *                                             }
 *                           }
 */
module.exports = Passenger;