/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2017 - Licensed MIT
*/
'use strict';

var sleep = require('sleep');
sleep.sleep(60);
var mqtt = require('mqtt');
var TwitterPackage = require('twitter');
var mqttClient = mqtt.connect('mqtt:212.98.137.194');
const fs = require('fs');
const path = require('path');
const Client = require('azure-iot-device').Client;
const ConnectionString = require('azure-iot-device').ConnectionString;
const Message = require('azure-iot-device').Message;
const Protocol = require('azure-iot-device-mqtt').Mqtt;

const bi = require('az-iot-bi');

const MessageProcessor = require('./messageProcessor.js');

var messageId = 0;
var interval = 10000;
var client, config, messageProcessor;
var connectionString = 'HostName=aquatek.azure-devices.net;DeviceId=MyRaspberryPi;SharedAccessKey=oFPbI2xnapfkUeL1rRdLGttiNdYpil+THrBSXTdKG3Q=';
const SimulatedSensor = require('./simulatedSensor.js');

function sendMessage() {

  messageId++;
  messageProcessor.getMessage(messageId, (content) => {
    var message = new Message(content);
    //console.log('Sending message: ' + content);
    client.sendEvent(message, (err) => {
      if (err) {
        console.error('Sending message : ' + content + ' ; Failed to send message to Azure IoT Hub');
      } else {
        console.log('Sending message : ' + content + ' ;Message sent to Azure IoT Hub');
      }
      setTimeout(sendMessage, interval);
    });
  });
}
var id=0;
var lastTemperatures = new Array();
var statuss;
var sumTemperatures=0;
var number=0;
var avg=0;
var roundedAvg=0;
  client = Client.fromConnectionString(connectionString, Protocol);
  mqttClient.on('connect', function () {
  	console.log('connected');
	mqttClient.subscribe('application/5/node/a4f3f8c72acb41be/rx');
	})

  mqttClient.on('message', function (topic, message) {
	id = id+1;
  	var json = JSON.parse(message);
  	var obj = json.data;
  	var buf = new Buffer(obj, 'base64').toString('ascii');
  	var msg = new Message(buf);
  	var jsondata = JSON.parse(buf);
	lastTemperatures.push(jsondata.T);
	if(id==5){
		for(var i=0 ; i<lastTemperatures.length ; ++i){
			sumTemperatures = sumTemperatures + lastTemperatures[i];
			number++;
		}
		avg = sumTemperatures/number;
		roundedAvg = Number(avg.toFixed(2));
		statuss = 'Average Water Temperature: '+roundedAvg + ' Degrees Celsius';
		Twitter.post('statuses/update', {status: statuss},  function(error, tweet, response){
  		if(error){
   			 console.log(error);
  		}
  		console.log(tweet);  // Tweet body.
		});
		id=0;
		sumTemperatures=0;
		number=0;
		roundedAvg=0;
		lastTemperatures = new Array();
	}
  	if(jsondata.T>=40){
		mailOptions = {
  		from: 'mdpaquatech@gmail.com',
  		to: 'elia.hage1@gmail.com',
  		subject: 'Temperature Too High!',
  		text: 'Current Temperature Over 40 Degrees Celsius!\nCurrently At: '+jsondata.T +'!\n\n\n This is an automated message. Please do not respond.'
		};
		transporter.sendMail(mailOptions, function(error, info){
  			if (error) {
   			 	console.log(error);
  			} else {
    				console.log('Email sent: ' + info.response);
 			 }
		});
	
  	}
 	 client.sendEvent(msg, (err) => {
  	    if (err) {
   	     console.error('Sending message : ' + buf + ' ; Failed to send message to Azure IoT Hub');
    	  } else {
    	    console.log('Sending message : ' + buf + ' ;Message sent to Azure IoT Hub');
    	  }

    	});
	})
  


 