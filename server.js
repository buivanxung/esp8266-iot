var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/'));

var statusD1,statusD2;
var d_data;
statusD1 = false; statusD2=false;
var clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)
var client =  require('mqtt').connect('mqtt://34.74.202.175:1883', {
  keepalive: 10,
  clientId: clientId,
  protocolId: 'MQTT',
  protocolVersion: 4,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  username: '',
  password: '',
  rejectUnauthorized: false
});

app.get('/', function(req, res){
  res.render('index');
});

io.on('connection', function (socket) {
  console.log("New connection");
  client.on('connect', function () {
       console.log('connected:' + clientId)
  });

  client.on('error', function (err) {
       console.log(err)
       client.end()
  });
  setInterval(function () {
    var data = "D0:"+statusD1+";"+"D1:"+statusD2+"!";
    socket.emit('sending_json_data', d_data)
  }, 100);
  client.subscribe('/device1/status', { qos: 0 })
  client.on('message', function (topic, message) {
    d_data = message;
    var dStatus = message.toString().split(";");
    var d1status = dStatus[0];
    var d2status = dStatus[1];
    if (d1status[3] =='1') {
      statusD1 = true;
    }else if (d1status[3] ='0') {
      statusD1 = false;
    }
    if (d2status[3] =='1') {
      statusD2 = true;
    }else if (d2status[3] ='0'){
      statusD2 = false;
    }
  });
  client.on('close', function () {
       console.log(clientId + ' disconnected')
  });
  socket.on('respond_command', function(data) {
    if (data == "D1ON") {
        client.publish('device1/command', 'D0:1 ');
        statusD1 = true;
        console.log("T");
      }
    if (data == "D1OFF"){
        client.publish('device1/command', 'D0:0 ');
        statusD1 = false;
    }
    if (data == "D2ON") {
        client.publish('device1/command', 'D1:1 ');
        statusD2 = true;
      }
    if (data == "D2OFF"){
        client.publish('device1/command', 'D1:0 ');
        statusD2 = false;
      }
  })
})
http.listen(8448, function () {
  console.log("Server running");
});
