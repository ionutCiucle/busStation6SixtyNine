var express = require("express");
var busStation = require("./service/controllers/BusStation").getInstance();
var bodyParser = require("body-parser");
var http  = require("http");
var app = new express();

var port = 6900;

//LOAD MIDDLEWARE
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

//SERVICE ENTRY (serve index.html and let Angular do the rest)
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/public/html/index.html");
});

//SERVICE ENDPOINTS
app.get("/getBuses", function(req, res){
    busStation.getBuses().then(function(data, error){
        error ? res.sendStatus(500).send(JSON.stringify(error)) : res.send(JSON.stringify(data));
    });
});
app.get("/getPassengers/:busId", function(req, res){
    console.log(req.params);
    busStation.getPassengers(req.params.busId).then(function(resolveData, rejectData){
        rejectData ? res.sendStatus(400).send(JSON.stringify(rejectData)) : res.send(JSON.stringify(resolveData));
    });
});
app.post("/addBus", function(req, res) {
    busStation.addBus(req.body).then(function(addedBusId, error){
        if(error){
            res.sendStatus(500).send(JSON.stringify(error));
        }else{
            res.send(JSON.stringify(addedBusId));
            io.emit("added-bus");
            console.log("BROADCAAAAAAAAAAAAAAAAAAST!")
        }
    });
});
app.post("/addPassenger", function(req, res){
    busStation.addPassenger(req.body).then(function(addedPassenger, error){
        console.log(req.body.busId);
        if(error){
            res.sendStatus(500).send(JSON.stringify(error));
        }else{
            io.emit("altered-passengers", JSON.stringify({
                added: true,
                passenger: addedPassenger,
                busId: req.body.busId
            }));
//            io.emit("altered-passengers", {
//                busId: JSON.stringify(req.body.busId)
//            });
            res.send();
        }
    });
});
app.delete("/removePassenger/:passengerId/:busId", function(req, res){
    for(var p in req.params.passengerId){
        console.log(p +": "+ req.params.passengerId[p]);
    }
   busStation.removePassenger(req.params.passengerId).then(function(removedPassengerId, rejectData){
       if(rejectData){
           res.endStatus(500).send(JSON.stringify(rejectData));
       }else{
           io.emit("altered-passengers", JSON.stringify({
               added: false,
               passengerId: removedPassengerId,
               busId: Number(req.params.busId)
           }));
           res.send(JSON.stringify(removedPassengerId));
       }
   })
});

//Create HTTP server
var httpServer = http.Server(app)
    .listen(port, function(){
       console.log("Eavesdropping on port: " + port);
    });

//Create socket.IO instance and attach it to the HTTP server
var io = require("socket.io").listen(httpServer);

//Add event listeners to socket.IO instance
io.on("connection", function(socket){
    console.log("socket.io: Connected");
});

