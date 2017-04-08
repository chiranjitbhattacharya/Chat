
//Import all required package
var socket  = require('socket.io');
var express = require('express');
var path    = require('path');

var app     = express();

var people  = {};
var port    = 3000;

// Settting for make the public folder as static
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/clients', function (req, res) {
  res.json(people);
});


var io = socket.listen(app.listen(port));

console.log("Listening on port " + port);

io.on("connection", function (client) {  

    client.on("join", function(clientName, gender) {
        clientDetails = {};

        clientDetails['name']    = clientName;
        clientDetails['gender']  = gender;

        if(gender === 'male') {
            clientDetails['avatarPath']  = 'male-avatar.png';
        } else {
            clientDetails['avatarPath']  = 'female-avatar.png';
        }
        people[client.id]       = clientDetails;
        console.log(people[client.id].name + ' has joined the server');
        io.sockets.emit("update", clientName + " just joined..");
    });

    client.on("send", function(msg) {
        if(typeof people[client.id] !== 'undefined') {
            io.sockets.emit("chat", people[client.id].name, timestamp(), msg, people[client.id].avatarPath);
        }
        
    });

    client.on("typing", function(a) {
        console.log("inside typing");
        console.log("message start ty: "+ (typeof people[client.id] === 'undefined'));
        if(typeof people[client.id] !== 'undefined') {
            client.broadcast.emit("typing", people[client.id].name + " is typing...");
        } else {
            console.log('else part .....');
        }
        
    });

    client.on("stopedTyping", function(a) {
        console.log("message stop ty: "+ (typeof people[client.id] === 'undefined'));
        if(typeof people[client.id] !== 'undefined') {
        client.broadcast.emit("stopedTyping", people[client.id].name + " is not typing...");
        }
    });


    client.on("disconnect", function() {
        if(typeof people[client.id] !== 'undefined') {
            client.broadcast.emit("stopedTyping", people[client.id].name + " is not typing...");
            io.sockets.emit("update",    people[client.id].name + " has left the chat.");
            delete people[client.id];
        }
        
    });
});

var timestamp = function() {
    var date = new Date();
    return formatedTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}
