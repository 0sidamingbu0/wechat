var express = require('express');
var router = express.Router();
var UserEntity = require('../models/user').UserEntity;
var GateEntity = require('../models/gateway').GateEntity;
var DeviceEntity = require('../models/device').DeviceEntity;
var mqtt = require('../mqtt/mq');
var policService = require('./policService');
//router.use(express.query());

exports.gatewayUpline = function(gmac){
	console.log('gatewayUpline:' + gmac);
	GateEntity.update({mac:gmac},{online:true,mac:gmac,lastTime:Date.now(),createTime:Date.now()},{upsert:true},function(err,gateway){
         if(err){//查询异常
                console.log("gatewayUpline db error"+err)
         return;
        }		
	});
};

exports.gatewayDropline = function(gmac){
    console.log('gatewayDropline:' + gmac);
    GateEntity.update({mac:gmac},{online:false},{upsert:true},function(err,gateway){
         if(err){//查询异常
                console.log("gatewayDropline db error"+err)
         return;
        }        
    });
};


exports.deviceReg = function(gmac,msg){
	console.log('deviceReg:' + msg.mac);
    var type = msg.deviceType;    

    if(msg.deviceType == 'N_SwitchLightPanel'){
        switch(msg.resourceSum){
            case '1':
                type = '1_SwitchLightPanel';
                break;
            case '2':
                type = '2_SwitchLightPanel';
                break;
            case '3':
                type = '3_SwitchLightPanel';
                break;
            default:
                console.log('deviceReg resourceSum err: '+msg.resourceSum);
                break;
        }
    }
    console.log('type: '+type);

	GateEntity.findOne({'device.mac':msg.mac},function(err,res){
		if(err)
			console.log('deviceReg find device err'+err);
		
		if(!res){
			console.log('new device');
			GateEntity.update({mac:gmac},
                {$push:{device:{
                    'creatTime':Date.now(),
                    'lastTime':Date.now(),
                    'addr':msg.address,
                    'mac':msg.mac,                    
                    'online':true,
                    'type':type}
                }},{upsert:true},function(err,res){
				
                if(err)
					console.log('add device err'+err);
	           }
            );
		}else{
            console.log('change device');
			GateEntity.update({"device.mac":msg.mac},{$set:{'device.$.addr':msg.address,'device.$.online':true,'device.$.type':type,'device.$.lastTime':Date.now()}},{upsert:true},function(err,res){
                if(err){
    		        console.log(err);
                    return;
       		   }                
        	});
		}
	});
};

exports.reportStatus = function(gmac,msg){
    var status = new Array();
    for(var x of msg.status){
        status.push(x.value);
    }
    console.log('reportStatus: '+msg.mac+'|'+JSON.stringify(status));
    GateEntity.update({"device.mac":msg.mac},
        {$set:
            {
                'device.$.status':status,
                'device.$.addr':msg.address,
                'device.$.online':true,
                'device.$.lastTime':Date.now()
            }
        },{upsert:true},function(err,res){                
            if(err){
                console.log(err);
                return;
           }                
        }
    );
}

exports.reportEvent = function(gmac,msg){
    console.log('reportEvent: '+msg.mac+'|'+msg.event);
    policService.execPolic(msg.mac,msg.event);
}


exports.reportAddr = function(gmac,msg){
    console.log('reportAddr:' + msg.mac);
        
    GateEntity.findOne({'device.mac':msg.mac},function(err,res){
        if(err)
            console.log('deviceReg find device err'+err);
        
        if(!res){
            console.log('new device');
            GateEntity.update({mac:gmac},
                {$push:{device:{
                    'lastTime':Date.now(),
                    'addr':msg.address,
                    'online':true
                }
                }},{upsert:true},function(err,res){
                
                if(err)
                    console.log('add device err'+err);
               }
            );
        }else{
            console.log('change device');
            GateEntity.update({"device.mac":mac},
                {$set:{
                    'device.$.addr':address,
                    'device.$.online':true,
                    'device.$.lastTime':Date.now()
                }},{upsert:true},function(err,res){
                
                    if(err){
                        console.log(err);
                        return;
                   }                
                }
            );
        }
    });
};

exports.reportValue = function(gmac,msg){
    console.log('reportValue: '+msg.mac+'|'+msg.type);
    
}
//============================================================
exports.sendCommond = function(mac,action){    
    console.log('sendCommond: '+mac+'|'+action);
    var dev;
    var index = 1;
    GateEntity.find({'device.mac':mac},{device:{'$elemMatch':{mac:mac}} },function(err, device){ //findOne({uid:req.params.uid},function(err,user){
        if(err){//查询异常
            console.log("sendCommond server error")                        
            return false;
        }
        if(device[0]){
            //console.log("device[0] "+ device[0]);
             dev = JSON.parse(JSON.stringify(device[0].device[0]));
            //dev.gatewayMac = device[0].mac;
            
            dev.resourceSum = 1;
            switch(action){
                case 'On':
                    index = 1;                    
                    dev.status[0] = '1';              
                    break;
                case 'Off':
                    index = 1;                
                    dev.status[0] = '0';              
                    break;
                case '1On':
                    index = 1;
                    action = 'On';  
                    dev.status[0] = '1';              
                    break;
                case '1Off':
                    index = 1;
                    action = 'Off';     
                    dev.status[0] = '0';           
                    break;                    
                case '2On':
                    index = 2;
                    action = 'On'; 
                    dev.status[1] = '1';               
                    break;
                case '3On':
                    index = 3;
                    action = 'On';
                    dev.status[2] = '1';
                    break;
                case '2Off':
                    index = 2;
                    action = 'Off';
                    dev.status[1] = '0';
                    break;
                case '3Off':
                    index = 3;
                    action = 'Off';
                    dev.status[2] = '0';
                    break;  

                case 'Reverse':                
                    if(dev.status[0]=='0'){
                        action = 'On';
                        dev.status[0] = '1';
                    }else{
                        action = 'Off';
                        dev.status[0] = '0';
                    }
                    break;                   
                case '2Reverse':
                    index = 2;
                    if(dev.status[1]=='0'){
                        action = 'On';
                        dev.status[1] = '1';
                    }else{
                        action = 'Off';
                        dev.status[1] = '0';
                    }
                    break;
                case '3Reverse':
                    index = 3;
                    if(dev.status[2]=='0'){
                        action = 'On';
                        dev.status[2] = '1';
                    }else{
                        action = 'Off';
                        dev.status[2] = '0';
                    }
                    break;                                                           

                                   
            }
            if(dev.type=='2_SwitchLightPanel')
                dev.resourceSum = 2;
            if(dev.type=='3_SwitchLightPanel')
                dev.resourceSum = 3;
        } 
        
        GateEntity.find({'device.mac':mac},{"_id":0,mac:1 },function(err, gateway){ //findOne({uid:req.params.uid},function(err,user){
            if(err){//查询异常
                console.log("sendCommond server error")                        
                return false;
            }        
            //console.log("gateway: "+JSON.stringify(gateway));
            var msg =   {
                            "topic": gateway[0].mac,
                            "payload":"{\"address\":\""+dev.addr+"\",\"mac\":\""+dev.mac+"\",\"deviceType\":\""+dev.type+"\",\"index\":\""+index+"\",\"command\":\""+action+"\",\"resourceSum\":\""+dev.resourceSum+"\",\"packetType\":\"sendCommond\"}",
                            "qos": 0,
                            "retain": false
                        };
            //console.log("msg: "+msg);
            mqtt.sendCommond(msg); 

            GateEntity.update({'device.mac':mac},{'$set':{'device.$.status':dev.status}},{upsert:true},function(err2,res2){
                console.log('err2:'+err2);
                if(err2){//查询异常
                        console.log("addgatewayname server error")                                            
                }
            });
                  
        });
    });
    return true; 

    
}

exports.sendRegister = function(dev){    
    console.log('sendRegister: '+dev.mac);
    GateEntity.find({'device.mac':dev.mac},{"_id":0,mac:1 },function(err, gateway){ //findOne({uid:req.params.uid},function(err,user){
        if(err){//查询异常
            console.log("sendCommond server error")                        
            return false;
        }      
        var msg =   {
                        topic: gateway[0].mac,
                        payload: "{\"address\":\""+dev.addr+"\",\"packetType\":\"sendRegister\"}",
                        qos: 0,
                        retain: false
                    };
        mqtt.sendCommond(msg);
    });
}

exports.sendDel = function(dev){    
    console.log('sendDel: '+dev.mac);
    GateEntity.find({'device.mac':dev.mac},{"_id":0,mac:1 },function(err, gateway){ //findOne({uid:req.params.uid},function(err,user){
        if(err){//查询异常
            console.log("sendCommond server error")                        
            return false;
        }   
        var msg =   {
                    topic: gateway[0].mac,                    
                    payload: "{\"address\":\""+dev.addr+"\",\"packetType\":\"sendDel\"}",
                    qos: 0,
                    retain: false
                };
        mqtt.sendCommond(msg);
    });
}

exports.permitJoin = function(gmac){    
    console.log('permitJoin: '+gmac);
    var msg =   {
                    topic: gmac,
                    payload: {                        
                        "packetType":"permitJoin"                        
                    },
                    qos: 0,
                    retain: false
                };
    mqtt.sendCommond(msg);
}