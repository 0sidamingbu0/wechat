var express = require('express');
var router = express.Router();
var UserEntity = require('../models/user').UserEntity;
var GateEntity = require('../models/gateway').GateEntity;
var DeviceEntity = require('../models/device').DeviceEntity;
//router.use(express.query());

exports.gupline = function(mac){
	console.log('gupline:' + mac);
	GateEntity.update({mac:mac},{online:true,mac:mac,lastTime:Date.now(),createTime:Date.now()},{upsert:true},function(err,gateway){
                 if(err){//查询异常
                        console.log("gws db error")
                 return;
                }

                if (gateway){
                        console.log("getid user:" + mac + ' name:'+ gateway.name)
                }else{
                        console.log("not find");
		}
	});


};

exports.gdropline = function(mac){
        console.log('gupline:' + mac);
        GateEntity.update({mac:mac},{online:false},{upsert:true},function(err,gateway){
                 if(err){//查询异常
                        console.log("gws db error")
                 return;
                }

                if (gateway){
                        console.log("getid user:" + mac + ' name:'+ gateway.name)
                }else{
                        console.log("not find");
                }
        });


};


exports.upline = function(status,addr,gmac,mac,type){
	console.log('upline:' + mac);
        GateEntity.update({mac:gmac}, {online:true,mac:gmac},{upsert:true},  function(err, result){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("upline db error")
                 	return;
                }
        });
	GateEntity.findOne({'device.mac':mac},function(err,res){
		if(err)
			console.log(err);
		console.log('find device');
		if(!res){
			console.log('new device');
			GateEntity.update({mac:gmac},{$push:{device:{'status':status,'lastTime':Date.now(),'addr':addr,'mac':mac,'online':true,'type':type,'creatTime':Date.now()}}},{upsert:true},function(err,res){
				if(err)
					console.log('add device err'+err);
			});
		}else{
			GateEntity.update({"device.mac":mac},{$set:{'device.$.status':status,'device.$.addr':addr,'device.$.mac':mac,'device.$.online':true,'device.$.type':type,'device.$.lastTime':Date.now()}},{upsert:true},function(err,res){
		                if(err){
                		        console.log(err);
		                        return;
               		 }
		                console.log(res);
        		});
		}
	});



};



