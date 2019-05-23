var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var allData = {'D0':0,'D1':0,'D2':0,'D3':0,'D4':0,'D5':0,'D6':0,'D7':0,'D8':0,'D9':0,'D10':0,'D11':0};

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
  client.on('connect', function () {
       console.log('connected:' + clientId)
  });
  client.on('error', function (err) {
       console.log(err)
       client.end()
  });
  client.subscribe('/device1/status', { qos: 0 })
  client.on('message', function (topic, message) {
    d_data = message.toString();
    socket.emit('sending_json_data', d_data);
    var dStatus = message.toString();
    var dPin = dStatus[0];
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
    var raw = data.toString().split(':');
    if(allData.hasOwnProperty(raw[0])){
      allData[raw[0]] = 1;
    }
  })
})
http.listen(8448, function () {
  console.log("Server running");
});
