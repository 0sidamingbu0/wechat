var express = require('express');
var router = express.Router();
var UserEntity = require('../models/user').UserEntity;
var GateEntity = require('../models/gateway').GateEntity;
var DeviceEntity = require('../models/device').DeviceEntity;
var PolicEntity = require('../models/polic').PolicEntity;
var mqtt = require('../mqtt/mq');
var gatewayService = require('./gatewayService');
var async = require('async');
//router.use(express.query());

exports.execPolic = function(mac,event){
	console.log('execpolic:' + mac + '|' + event);
	PolicEntity.find({mac:mac,event:event},{'_id':0},function(err,polic){
         if(err){//查询异常
                console.log("execpolic db error");
         return;
        }
        
        if (polic[0]){
            if (polic[0].do.length){
                console.log("polic:" + mac + '|' + event + polic[0].do);               
                var j=polic[0].do.length;
                var count = 0;  

                async.forever(function(callback){  
                    console.log(count);  
                    count++;

                    if(polic[0].do[count-1].type=="delay"){
                        setTimeout(function () {
                            if(count<j){
                               callback();
                            } 
                        },polic[0].do[count-1].action*1000);
                    }else{
                        sendCommond(polic[0].do[count-1].mac,polic[0].do[count-1].action);
                        if(count<j){
                           callback();
                        }
                    }

                    if (count>j) {  
                        callback("errmessage");  
                        return;  
                    } 
                                                              
                                             
                },  
                function(err){  
                    console.log(err);  
                });

                return true;
            }
        }else{
            console.log("polic:" + mac + '|' + event + "not find");
            return false;
}
	});


};

var sendCommond = function(mac,action){
    GateEntity.find({'device.mac':mac},{device:{'$elemMatch':{mac:mac}} },function(err, device){ //findOne({uid:req.params.uid},function(err,user){
        if(err){//查询异常
            console.log("sendCommond server error")                        
            return false;
        }
        if(device[0]){
            //console.log("device[0] "+ device[0]);
            var dev = JSON.parse(JSON.stringify(device[0].device[0]));
            //dev.gatewayMac = device[0].mac;
            var index = 1;
            //dev.resourceSum = 1;
            switch(action){
                case '2On':
                    index = 2;
                    action = 'On';                
                    break;
                case '3On':
                    index = 2;
                    action = 'On';
                    break;
                case '2Off':
                    index = 3;
                    action = 'Off';
                    break;
                case '3Off':
                    index = 3;
                    action = 'Off';
                    break;  

                case 'Reverse':                
                    action = 1 - dev.status[0];
                    break;                   
                case '2Reverse':
                    index = 2;
                    action = 1 - dev.status[1];
                    break;
                case '3Reverse':
                    index = 3;
                    action = 1 - dev.status[2];
                    break;                                                           

                                   
            }
            //if(dev.type=='2_SwitchLightPanel')
            //    dev.resourceSum = 2;
            //if(dev.type=='3_SwitchLightPanel')
            //    dev.resourceSum = 3;

            //console.log("polic dev:"+JSON.stringify(dev));
            gatewayService.sendCommond(dev,index,action);
            return true;
        }
    });
}



