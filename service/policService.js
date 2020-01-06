var express = require('express');
var router = express.Router();
var UserEntity = require('../models/user').UserEntity;
var GateEntity = require('../models/gateway').GateEntity;
var DeviceEntity = require('../models/device').DeviceEntity;
var PolicEntity = require('../models/polic').PolicEntity;
var mqtt = require('../mqtt/mq');
var gatewayService = require('./gatewayService');
var async = require('async');
var Q = require('q');
//router.use(express.query());
var doing = new Array();
//gatewayService.sendmsg("系统启动");

function myDelay(ms){ // 定义延时操作，返回promise
    var deferred = Q.defer() ;
    setTimeout(deferred.resolve , ms);
    return deferred.promise;
}

exports.execPolic = function(mac,event){
	console.log('execpolic:' + mac + '|' + event);
	PolicEntity.find({mac:mac,event:event},{'_id':0},function(err,polic){
         if(err){//查询异常
                console.log("execpolic db error");
         return;
        }
        
        if (polic[0]){
            if (polic[0].do.length && find(mac,event)<0){
                doing.push({mac:mac,event:event});
                console.log("doing: " + doing);
                //console.log("polic:" + mac + '|' + event + polic[0].do);               
                var j=polic[0].do.length;
                var count = 0;  

                async.forever(function(callback){                        
                    count++;
                    
                    if(polic[0].do[count-1].type=="delay"){
                        console.log("polic command: " +count+'|'+ 'delay '+ polic[0].do[count-1].action);
                        setTimeout(function () {                            
                            if(count<j){
                               callback();
                            } 
                        },polic[0].do[count-1].action*1000);
                    }else if(polic[0].do[count-1].type=="device"){
                        console.log("polic command: " +count+'|'+ polic[0].do[count-1].mac+'|'+polic[0].do[count-1].action);
                        gatewayService.sendCommond(polic[0].do[count-1].mac,polic[0].do[count-1].action);
                        
                        setTimeout(function () {                            
                            if(count<j){
                               callback();
                            } 
                        },100);
                    }else if(polic[0].do[count-1].type=="msg"){
                        //var uid = getuserbydevice(mac);
                        gatewayService.sendmsgbydevice(mac,polic[0].do[count-1].action);
                        //gatewayService.sendmsg(getuserbydevice(mac),polic[0].do[count-1].action);
                    }else if(polic[0].do[count-1].type=="advanceAction"){
                        var doit = true;
                        for(var i=0;i<polic[0].do[count-1].event.length;i++){
                            switch(polic[0].do[count-1].advanceEvent.event[i].type){
                                case 'device':
                                    if(polic[0].do[count-1].advanceEvent.event[i].time.type=='normal'){                                        
                                        var eventTime = gatewayService.getDeviceEventLastTime(polic[0].do[count-1].advanceEvent.event[i].mac,polic[0].do[count-1].advanceEvent.event[i].event);
                                        var now = new Date();
                                        newDate.setTime(Date.now());
                                        if(now - eventTime <= polic[0].do[count-1].advanceEvent.event[i].time.value*1000){
                                            break;
                                        }                                        
                                    }else if(polic[0].do[count-1].advanceEvent.event[i].time.type=='defer'){

                                        break;
                                    }
                                    
                                    doit = false;
                                    break;
                                case 'time':
                                    var now = new Date();
                                    newDate.setTime(Date.now());
                                    var hour = now.getHours();
                                    var min = now.getMinutes();
                                    if(hour >= parseInt(polic[0].do[count-1].advanceEvent.event[i].start) && hour <= parseInt(polic[0].do[count-1].advanceEvent.event[i].stop)){
                                        break;
                                    }
                                    doit = false;
                                    break;
                            }
                        }
                        

                        if(doit == true){
                            for(var i=0;i<polic[0].do[count-1].advanceEvent.do.length;i++){
                                gatewayService.sendCommond(polic[0].do[count-1].advanceEvent.do[i].mac,polic[0].do[count-1].advanceEvent.do[i].action);
                            }
                        }
                    }
                      

                    if(count == j){
                        doing.splice(find(mac,event),1);
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

var find = function(mac,event){
    for(var i =0;i<doing.length;i++){
        if(doing[i].mac == mac && doing[i].event == event)
            return i;
    }
    return -1;
}


