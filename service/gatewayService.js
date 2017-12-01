var express = require('express');
var router = express.Router();
var UserEntity = require('../models/user').UserEntity;
var GateEntity = require('../models/gateway').GateEntity;
var DeviceEntity = require('../models/device').DeviceEntity;
var mqtt = require('../mqtt/mq');
var request = require("request");
var policService = require('./policService');
//var token = require('./token');
//router.use(express.query());
var sendPost = function(url,body){
    var options = {
        url:  url,
        method: "POST",
        json: true,
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        body: body
    };     
    console.log('send post: '+url+'|'+body);
    request(options, function (error, response, body) {
        if (error) {
            //logger.error("send message to zbClient failed: " + error);
        }
        else {
            console.log('send post response:'+JSON.stringify(response));
            if (body.message === "success") {
            }
            else {
                //logger.error("send message to zbClient failed. ");
            }
        }
    });
}

exports.gatewayUpline = function(gmac){
	console.log('gatewayUpline:' + gmac);
	GateEntity.update({mac:gmac},{online:true,mac:gmac,lastTime:Date.now(),createTime:Date.now()},{upsert:true},function(err,gateway){
         if(err){//查询异常
                console.log("gatewayUpline db error"+err)
         return;
        }		
	});
    sendgatewayuplinemsg(gmac);
};

exports.gatewayDropline = function(gmac){
    console.log('gatewayDropline:' + gmac);
    GateEntity.update({mac:gmac},{online:false},{upsert:true},function(err,gateway){
         if(err){//查询异常
                console.log("gatewayDropline db error"+err)
         return;
        }        
    });
    sendgatewaydroplinemsg(gmac);
};


exports.deviceReg = function(gmac,msg){
	console.log('deviceReg:' + msg.mac);
    var type = msg.deviceType;    

    if(msg.deviceType == 'CurtainPanel'){
        switch(msg.resourceSum){
            case '1':
                type = '1_CurtainPanel';
                break;
            case '2':
                type = '2_CurtainPanel';
                break;
            default:
                console.log('deviceReg resourceSum err: '+msg.resourceSum);
                break;
        }
    }
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
            console.log('not found device');
            
        }else{
            console.log('change device');
            GateEntity.update({"device.mac":msg.mac},
                {$set:{
                    'device.$.addr':msg.address,
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

var sendPost = function(url,body){
    var options = {
        url:  url,
        method: "POST",
        json: true,
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        body: body
    };     
    console.log('send post: '+url+'|'+body);
    request(options, function (error, response, body) {
        if (error) {
            //logger.error("send message to zbClient failed: " + error);
        }
        else {
            console.log('send post response:'+JSON.stringify(response));
            if (body.message === "success") {
            }
            else {
                //logger.error("send message to zbClient failed. ");
            }
        }
    });
}
Date.prototype.format = function(format) {  
       var date = {  
              "M+": this.getMonth() + 1,  
              "d+": this.getDate(),  
              "h+": this.getHours(),  
              "m+": this.getMinutes(),  
              "s+": this.getSeconds(),  
              "q+": Math.floor((this.getMonth() + 3) / 3),  
              "S+": this.getMilliseconds()  
       };  
       if (/(y+)/i.test(format)) {  
              format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));  
       }  
       for (var k in date) {  
              if (new RegExp("(" + k + ")").test(format)) {  
                     format = format.replace(RegExp.$1, RegExp.$1.length == 1  
                            ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));  
              }  
       }  
       return format;  
}  
exports.sendmsgbydevice = function(mac,action){    

    GateEntity.findOne({'device.mac':mac},{'_id':0},function(err,gateway){
    try{
            console.log('gateway: '+gateway);
        //temp.gateway = gateway.mac;
       // console.log('temp:'+temp);
        UserEntity.find({'gateway':gateway.mac},function(err,user){
                 if(err){//查询异常
                        console.log("getid server error")
                 return 0;
                }

                if (user){
                    for(var i=0;i<user.length;i++){
                        console.log('user: '+user[i].uid);


                        console.log('sendmsgbydevice: '+user[i].uid+'|'+JSON.stringify(action));
                        var newDate = new Date();
                        newDate.setTime(Date.now());
                        var body={
                                            
                            "touser":user[i].uid,
                            "template_id":"pJfLVjELC_8cbKi7GdVY7JoILt8BchOyIOPN0bFfAB4",
                            "url":"http://yulurobot.cn/weixin/",
                            "topcolor":"#FF0000",
                            "data":{
                                "first": {
                                "value":"场景通知消息",
                                "color":"#173177"
                                },
                                "keyword1":{
                                "value":"家",
                                "color":"#173177"
                                },
                                "keyword2":{
                                "value":newDate.format('yyyy-MM-dd h:m:s'),
                                "color":"#173177"
                                },
                                "keyword3":{
                                "value":action,
                                "color":"#173177"
                                },            
                                "remark":{
                                "value":action,
                                "color":"#173177"
                                }
                            }
                        }

                        sendPost('https://api.weixin.qq.com/cgi-bin/message/template/send?access_token='+global.wechattoken,body);
                    }
                        //gatewayService.sendmsg(user.uid,action);
                        //return user.uid;        
                }else{
                        console.log('nouser: ');
                        return false;
                }
            });
    }catch(err){
        console.log(err);
    }   
    }); 

   
}

exports.sendmsgbygateway = function(mac,action){    
    
        UserEntity.find({'gateway':mac},function(err,user){
                 if(err){//查询异常
                        console.log("getid server error")
                 return 0;
                }

                if (user){
                        console.log('user: '+user);
                        for(var i=0;i<user.length;i++){
                            console.log('sendmsgbygateway: '+user[i].uid+'|'+JSON.stringify(action));
                            var newDate = new Date();
                            newDate.setTime(Date.now());
                            var body={
                                                
                                "touser":user[i].uid,
                                "template_id":"pJfLVjELC_8cbKi7GdVY7JoILt8BchOyIOPN0bFfAB4",
                                "url":"http://yulurobot.cn/weixin/",
                                "topcolor":"#FF0000",
                                "data":{
                                    "first": {
                                    "value":"场景通知消息",
                                    "color":"#173177"
                                    },
                                    "keyword1":{
                                    "value":"家",
                                    "color":"#173177"
                                    },
                                    "keyword2":{
                                    "value":newDate.format('yyyy-MM-dd h:m:s'),
                                    "color":"#173177"
                                    },
                                    "keyword3":{
                                    "value":action,
                                    "color":"#173177"
                                    },            
                                    "remark":{
                                    "value":action,
                                    "color":"#173177"
                                    }
                                }
                            }

                            sendPost('https://api.weixin.qq.com/cgi-bin/message/template/send?access_token='+global.wechattoken,body);
                        }
                        //gatewayService.sendmsg(user.uid,action);
                        //return user.uid;        
                }else{
                        console.log('nouser: ');
                        return false;
                }
            });

    
}

var sendgatewaydroplinemsg = function(mac){  
    GateEntity.find({mac:mac},{'_id':0},function(err, gateway){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("getdevice server error")
                        res.send("server err");
                 return 0;
                }
            
                console.log("gateway: "+JSON.stringify(gateway));
    UserEntity.find({'gateway':mac},function(err,user){
         if(err){//查询异常
                console.log("getid server error")
         return 0;
        }

        if (user){
                console.log('user: '+user.uid);
                //gatewayService.sendmsg(user.uid,action);
                //return user.uid;        
        }else{
                console.log('nouser: ');
                //return false;
        }
            
    //console.log('sendgatewaydroplinemsg: '+user.uid);
        for(var i=0;i<user.length;i++){
            var newDate = new Date();
            newDate.setTime(Date.now());
            var body={
                                
                "touser":user[i].uid,
                "template_id":"ajU0K5qNQcuoSNYQBJxvlaULf1QRUTywzREAAXlxDzE",
                "url":"http://yulurobot.cn/weixin/",
                "topcolor":"#FF0000",
                "data":{
                    "first": {
                    "value":"网关离线消息",
                    "color":"#173177"
                    },
                    "keyword1":{
                    "value":gateway[0].name,
                    "color":"#173177"
                    },
                    "keyword2":{
                    "value":"智能网关",
                    "color":"#173177"
                    },   
                    "keyword3":{
                    "value":mac,
                    "color":"#173177"
                    },                   
                    "remark":{
                    "value":"尊敬的用户"+user[i].name+"，您的网关: "+mac+"于"+newDate.format('yyyy-MM-dd h:m:s')+"掉线了，请检查网络和供电",
                    "color":"#173177"
                    }
                }
            }
            sendPost('https://api.weixin.qq.com/cgi-bin/message/template/send?access_token='+global.wechattoken,body);
        }

    });
});
    
}
var sendgatewayuplinemsg = function(mac){    
    GateEntity.find({mac:mac},{'_id':0},function(err, gateway){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("getdevice server error")
                        res.send("server err");
                 return;
                }
    
                console.log("gateway: "+JSON.stringify(gateway));

    UserEntity.find({'gateway':mac},function(err,user){
                 if(err){//查询异常
                        console.log("getid server error")
                 return 0;
                }

                if (user){
                        console.log('user: '+user.uid);
                        //gatewayService.sendmsg(user.uid,action);
                        //return user.uid;        
                }else{
                        console.log('nouser: ');
                        return false;
                }
            
    //console.log('sendgatewayuplinemsg: '+user.uid);
        for(var i=0;i<user.length;i++){
            var newDate = new Date();
            newDate.setTime(Date.now());
            var body={
                                
                "touser":user[i].uid,
                "template_id":"FxPIJpCJVHtCy9BXN5ZRgEOuYl172wQ-qSaqAuLE2P4",
                "url":"http://yulurobot.cn/weixin/",
                "topcolor":"#FF0000",
                "data":{
                    "first": {
                    "value":"网关上线消息",
                    "color":"#173177"
                    },
                    "keyword1":{
                    "value":mac,
                    "color":"#173177"
                    },
                    "keyword2":{
                    "value":newDate.format('yyyy-MM-dd h:m:s'),
                    "color":"#173177"
                    },                    
                    "remark":{
                    "value":"尊敬的用户"+user[i].name+"，您的网关 mac:"+mac+" 名称："+gateway[0].name+"上线啦~",
                    "color":"#173177"
                    }
                }
            }
            sendPost('https://api.weixin.qq.com/cgi-bin/message/template/send?access_token='+global.wechattoken,body);
        }
    });
});
    
}

exports.sendmsgbyuid = function(uid,action){    
    console.log('sendmsgbyuid: '+uid+'|'+JSON.stringify(action));
    var newDate = new Date();
    newDate.setTime(Date.now());
    var body={
                        
        "touser":uid,
        "template_id":"pJfLVjELC_8cbKi7GdVY7JoILt8BchOyIOPN0bFfAB4",
        "url":"http://yulurobot.cn/weixin/",
        "topcolor":"#FF0000",
        "data":{
            "first": {
            "value":"场景通知消息",
            "color":"#173177"
            },
            "keyword1":{
            "value":"家",
            "color":"#173177"
            },
            "keyword2":{
            "value":newDate.format('yyyy-MM-dd h:m:s'),
            "color":"#173177"
            },
            "keyword3":{
            "value":action,
            "color":"#173177"
            },            
            "remark":{
            "value":action,
            "color":"#173177"
            }
        }
    }

    sendPost('https://api.weixin.qq.com/cgi-bin/message/template/send?access_token='+global.wechattoken,body);
}
//var myInterval=setTimeout(start("服务启动"),5000);
//start('启动');
// console.log('启动: '+global.wechattoken);

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
            if(dev.type=='2_CurtainPanel')
                dev.resourceSum = 2;
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
                    payload: "{\"packetType\":\"permitJoin\"}",
                    qos: 0,
                    retain: false
                };
    mqtt.sendCommond(msg);
}


