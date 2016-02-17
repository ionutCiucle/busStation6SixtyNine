var Client = require("./Client");//TODO: add client functionality (on owner prop) to Bus
var Passenger = require("./Passenger");

function Bus(id, owner, color, capacity, hp, hasAc, passengers) {
    this.id = id;
    this.owner = owner;
    this.color = color || "yellow";
    this.capacity = capacity || 25;
    this.hp = hp || 50;
    this.hasAc = hasAc || false;
    this.passengers = passengers || [];
};
module.exports = Bus;