var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/'));

var statusD1,statusD2;
statusD1 = false; statusD2=false;
var clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)
var client =  require('mqtt').connect('mqtt://wirelesstech.online:1883', {
  keepalive: 10,
  clientId: clientId,
  protocolId: 'MQTT',
  protocolVersion: 4,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  username: 'xungbv',
  password: '1234567',
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
    socket.emit('sending_json_data', data)
  }, 100);
  client.subscribe('xungbv/device-status', { qos: 0 })
  client.on('message', function (topic, message) {
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
        client.publish('xungbv/device-command', 'D0:1 ');
        statusD1 = true;
      }
    if (data == "D1OFF"){
        client.publish('xungbv/device-command', 'D0:0 ');
        statusD1 = false;
    }
    if (data == "D2ON") {
        client.publish('xungbv/device-command', 'D1:1 ');
        statusD2 = true;
      }
    if (data == "D2OFF"){
        client.publish('xungbv/device-command', 'D1:0 ');
        statusD2 = false;
      }
  })
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
})
http.listen(8448, function () {
  console.log("Server running");
});
