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
        
	GateEntity.findOne({'device.mac':msg.mac},function(err,res){
		if(err)
			console.log('deviceReg find device err'+err);
		
		if(!res){
			console.log('new device');
			GateEntity.update({mac:gmac},
                {$push:{device:{
                    'creatTime':Date.now(),
                    'lastTime':Date.now(),
                    'addr':msg.addr,
                    'mac':msg.mac,
                    'resourceSum':msg.resourceSum,
                    'online':true,
                    'type':msg.type}
                }},{upsert:true},function(err,res){
				
                if(err)
					console.log('add device err'+err);
	           }
            );
		}else{
            console.log('change device');
			GateEntity.update({"device.mac":mac},{$set:{'device.$.addr':addr,'device.$.online':true,'device.$.type':type,'device.$.lastTime':Date.now()}},{upsert:true},function(err,res){
                if(err){
    		        console.log(err);
                    return;
       		   }                
        	});
		}
	});
};

exports.reportStatus = function(gmac,msg){
    console.log('reportStatus: '+msg.mac+'|'+msg.status);
    GateEntity.update({"device.mac":mac},
        {$set:
            {
                'device.$.status':msg.status,
                'device.$.addr':msg.addr,
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
                    'addr':msg.addr,
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
                    'device.$.addr':addr,
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
exports.sendCommond = function(dev,index,action){    
    console.log('sendCommond: '+dev.mac+'|'+index+'|'+action);
    GateEntity.find({'device.mac':dev.mac},{"_id":0,mac:1 },function(err, gateway){ //findOne({uid:req.params.uid},function(err,user){
        if(err){//查询异常
            console.log("sendCommond server error")                        
            return false;
        }        
        //console.log("gateway: "+JSON.stringify(gateway));
        var msg =   {
                        "topic": gateway[0].mac,
                        "payload":"{\"address\":"+dev.addr+",\"index\":"+index+",\"command\":\""+action+"\",\"resourceSum\":"+dev.resourceSum+",\"type\":\"sendCommond\"}",
                        "qos": 0,
                        "retain": false
                    };
        //console.log("msg: "+msg);
        mqtt.sendCommond(msg);
        return true;
    });
}

exports.sendRegister = function(dev){    
    console.log('sendRegister: '+dev.mac);
    var msg =   {
                    topic: dev.gatewayMac,
                    payload: {
                        "address":dev.addr,
                        "type":"sendRegister"                       
                    },
                    qos: 0,
                    retain: false
                };
    mqtt.sendCommond(msg);
}

exports.sendDel = function(dev){    
    console.log('sendDel: '+dev.mac);
    var msg =   {
                    topic: dev.gatewayMac,
                    payload: {
                        "address":dev.addr,
                        "type":"sendDel"                      
                    },
                    qos: 0,
                    retain: false
                };
    mqtt.sendCommond(msg);
}

exports.permitJoin = function(gmac){    
    console.log('permitJoin: '+gmac);
    var msg =   {
                    topic: gmac,
                    payload: {                        
                        "type":"permitJoin"                        
                    },
                    qos: 0,
                    retain: false
                };
    mqtt.sendCommond(msg);
}