var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var allData = {'D0':0,'D1':0,'D2':0,'D3':0,'D4':0,'D5':0,'D6':0,'D7':0,'D8':0,'D9':0,'D10':0,'D11':0};
var inputData = {'I0':0,'I1':0,'I2':0,'I3':0,'I4':0,'I5':0};

app.use(express.static(__dirname + '/'));

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
  socket.emit('alldata', allData);
  socket.emit('inputdata', inputData);
  client.on('connect', function () {
       console.log('connected:' + clientId);
      
  });
  client.on('error', function (err) {
       console.log(err);
       client.end();
  });
  client.subscribe('/device1/status', { qos: 0 })
  client.on('message', function (topic, message) {
    socket.emit('sending_json_data', message.toString());
    var raw = message.toString().split(':');
    if(raw[0].charAt(0) == 'I'){
      if(inputData.hasOwnProperty(raw[0])){
        inputData[raw[0]] = raw[1].charAt(0);
      }
    }else if (raw[0].charAt(0) == 'D'){
      if(allData.hasOwnProperty(raw[0])){
        allData[raw[0]] = raw[1].charAt(0);
      }
    }
  });
  client.on('update', function(topic, message){

  })
  socket.on('close', function () {
       console.log(clientId + ' disconnected')
  });
  socket.on('disconnect', function () {
    console.log(clientId + ' disconnected')
  });
  socket.on('respond_command', function(data) {
    var raw = data.toString().split(':');
    if(allData.hasOwnProperty(raw[0])){
      allData[raw[0]] = raw[1];
      client.publish('/device1/command', raw[0]+":"+allData[raw[0]]);
    }
    socket.emit('alldata', allData);
  })
})
http.listen(8448, function () {
  console.log("Server running");
});
