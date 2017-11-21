var mosca = require('mosca');
var gatewayService = require('../service/gatewayService');
var policService = require('../service/policService');

exports.mqinit = function(){ 
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
	   	 //console.log('message-arrived--->','topic ='+topic+',message = '+ packet.payload);
		//console.log("packet: "+JSON.stringify(packet));		
		//console.log("client: "+JSON.stringify(client));
		try{
			var msg = JSON.parse(packet.payload);
			if(msg.packetType=='deviceReg'||msg.packetType=='reportStatus'||msg.packetType=='reportAddr'||msg.packetType=='reportEvent'||msg.packetType=='reportValue')
				parseMsg(packet);
		}
		catch(err){
			//console.log("published err: "+err);
		}
				
	});

var parseMsg = function(packet){
    console.log('parseMsg:' + packet.topic + '|' + packet.payload);
    var msg;
    try{
            msg = JSON.parse(packet.payload);
            switch(msg.packetType){
            	case 'deviceReg':
            		gatewayService.deviceReg(packet.topic,msg);
            		break;
            	case 'reportStatus':
            		gatewayService.reportStatus(packet.topic,msg);
            		break;
            	case 'reportEvent':
            		gatewayService.reportEvent(packet.topic,msg);
            		break;
            	case 'reportAddr':
            		gatewayService.reportAddr(packet.topic,msg);
            		break;
            	case 'reportValue':
            		gatewayService.reportValue(packet.topic,msg);
            		break;
            	
            	default :
            		console.log('parseMsg: type not found');
            		break;
            }
                //gatewayService.gupline(msg.mac);
                //gatewayService.upline(msg.status,msg.addr,msg.gmac,msg.mac,msg.type);
            

    }catch(err){
        console.log('parseMsg:'+err);
    }
};

	// fired when a client connects
	MqttServer.on('clientConnected', function(client) {
		console.log('Client Connected:', client.id);
                gatewayService.gatewayUpline(client.id);

	});

	// fired when a client disconnects
	MqttServer.on('clientDisconnected', function(client) {
		console.log('Client Disconnected:', client.id);
                gatewayService.gatewayDropline(client.id);

	});

	MqttServer.on('ready', function(){
	    console.log('mqtt is running...');
	});
}



exports.sendCommond = function(msg){	
	console.log("mq sendCommond:"+JSON.stringify(msg));
	var msg2 = {
		topic: 'b8:02',
		payload: 'hello!',
		qos: 0,
		retain: false
	};
	MqttServer.publish(msg, function () {
        console.log('mq sendCommond');
	 	});
}
