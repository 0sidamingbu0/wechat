var mosca = require('mosca');

var mq = function(){ 
 	MqttServer = new mosca.Server({
    		port: 1883
	});

	MqttServer.on('clientConnected', function(client){
    		console.log('client connected', client.id);
		var msg = {
                	topic: 'repeat',
	                payload: 'hello!',
        	        qos: 0,
                	retain: false
            	};
            //	MqttServer.publish(msg, function () {
//	                console.log('repeat!  ');
//           	 });
	});

/**
 * 监听MQTT主题消息
 **/
	MqttServer.on('published', function(packet, client) {
	    	var topic = packet.topic;
	   	 console.log('message-arrived--->','topic ='+topic+',message = '+ packet.payload.toString());

		var msg = {
                        topic: 'repeat',
                        payload: packet.payload,
                        qos: 0,
                        retain: false
                };
//                MqttServer.publish(msg, function () {
//                        console.log('repeat!  ');
//                 });

	});

	MqttServer.on('ready', function(){
	    console.log('mqtt is running...');
	});
}
module.exports = mq;
