var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var allData = {'D0':0,'D1':0,'D2':0,'D3':0,'D4':0,'D5':0,'D6':0,'D7':0,'D8':0,'D9':0,'D10':0,'D11':0,
'D12':0,'D13':0,'D14':0,'D15':0,'D16':0,'D17':0,'D18':0,'D19':0,'D20':0,'D21':0,'D22':0,'D23':0,
'D24':0,'D25':0,'D26':0,'D27':0,'D28':0,'D29':0,'D30':0,'D31':0,'D32':0,'D33':0,'D34':0,'D35':0,
'D36':0,'D37':0,'D38':0,'D39':0,'D40':0,'D41':0,'D42':0,'D43':0,'D44':0,'D45':0,'D46':0,'D47':0,
'D48':0,'D49':0};

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
  client.on('connect', function () {
       console.log('connected:' + clientId);
      
  });
  client.on('error', function (err) {
       console.log(err)
       client.end()
  });
  client.subscribe('/device1/status', { qos: 0 })
  client.on('message', function (topic, message) {
    socket.emit('sending_json_data', message.toString());
    var raw = message.toString().split(':');
    if(allData.hasOwnProperty(raw[0])){
      allData[raw[0]] = raw[1];
    }
  });
  client.on('close', function () {
       console.log(clientId + ' disconnected')
  });
  client.on('disconnect', function () {
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
