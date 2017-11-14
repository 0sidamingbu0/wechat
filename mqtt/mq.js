var mosca = require('mosca');
var gatewayService = require('../service/gatewayService');

var mq = function(){ 
 	MqttServer = new mosca.Server({
    		port: 1883
	});

//	MqttServer.on('clientConnected', function(client){
  //  		console.log('client connected', client.id);
//		var msg = {
  //              	topic: 'repeat',
//	                payload: 'hello!',
  //      	        qos: 0,
    //            	retain: false
      //      	};
            //	MqttServer.publish(msg, function () {
//	                console.log('repeat!  ');
//           	 });
//	});
/**
 * 监听MQTT主题消息
 **/
	MqttServer.on('published', function(packet, client) {
	    	var topic = packet.topic;
	   	 console.log('message-arrived--->','topic ='+topic+',message = '+ packet.payload);
//		console.log(client);
		var msg;
		try{
			msg = JSON.parse(packet.payload);
		
			if(topic === 'gateway/upline'){
				gatewayService.gupline(msg.mac);
			}
		
			if(topic === 'device/upline'){
                	        gatewayService.upline(msg.status,msg.addr,msg.gmac,msg.mac,msg.type);
               		}

		}catch(err){
			console.log(err);
		}
	});

	// fired when a client connects
	MqttServer.on('clientConnected', function(client) {
		console.log('Client Connected:', client.id);
                gatewayService.gupline(client.id);

	});

	// fired when a client disconnects
	MqttServer.on('clientDisconnected', function(client) {
		console.log('Client Disconnected:', client.id);
                gatewayService.gdropline(client.id);

	});

	MqttServer.on('ready', function(){
	    console.log('mqtt is running...');
	});
}
module.exports = mq;
