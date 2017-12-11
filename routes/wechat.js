var path = require('path');
var express = require('express');
var router = express.Router();
var wechat = require('wechat');
var config = {
  token : 'idol',
  appid : 'wx6debf35e8f567884',
  appidsecret :'04976556b89bbffefe738f5ee068e72f',
  encodingAESKey : 'v4LNm7lCk50Lt4mecF0gsea8EhSKIfI94LxtO3fgFZK'
};
var session = require('express-session');
var cookieParser = require('cookie-parser');
var UserEntity = require('../models/user').UserEntity;
var GateEntity = require('../models/gateway').GateEntity;
var PolicEntity = require('../models/polic').PolicEntity;
var gatewayService = require('../service/gatewayService');
var request = require("request");

//router.use(express.query());
router.use('/joinbymac/',  function(req, res, next) {
    console.log('joinbymac'+req.body.mac);
	gatewayService.permitJoin(req.body.mac);
    res.send('ok');
});

router.use('/sendbymac/',function(req,res){
    gatewayService.sendCommond(req.body.mac,req.body.do);
    res.send('ok');
});

var packetDevice = function(device){
    var tempdev = JSON.parse(JSON.stringify(device));
    switch(tempdev.type){
         case '1_CurtainPanel':
            console.log('is 1curtainpanel');
            tempdev.event={
            };            
            tempdev.do = [ 
                {name:'打开',value:'On'},
                {name:'关闭',value:'Off'},
                {name:'反转',value:'Reverse'},
            ];
            tempdev.advanceEvent = [ 
                {name:'打开',value:'On'},
                {name:'关闭',value:'Off'}                                        
            ];
            tempdev.chinesetype='1路窗帘';
            break;
         case '2_CurtainPanel':
            console.log('is 2curtainpanel');
            tempdev.event={
            };
            tempdev.do = [ 
            {name:'1路打开',value:'1On'},
            {name:'1路关闭',value:'1Off'},
            {name:'1路反转',value:'1Reverse'},
            {name:'2路打开',value:'2On'},
            {name:'2路关闭',value:'2Off'},
            {name:'2路反转',value:'2Reverse'}
            ];            
            tempdev.advanceEvent = [ 
                {name:'1路打开',value:'1On'},
                {name:'1路关闭',value:'1Off'},
                {name:'2路打开',value:'2On'},
                {name:'2路关闭',value:'2Off'}                                        
            ];
            tempdev.chinesetype='2路窗帘';
            break;

        case 'MiButton':
            console.log('is mibutton');
            tempdev.event=[
                {name:'按下',value:'PressDown'},
                {name:'释放',value:'PressUp'},
                {name:'双击',value:'DoubleClick'}
            ];
            tempdev.do = {
                };
            tempdev.advanceEvent=[
                {name:'按下',value:'PressDown'},
                {name:'释放',value:'PressUp'},
                {name:'双击',value:'DoubleClick'}
            ];            
            tempdev.chinesetype='小米按钮';
        break;

        case '1_SwitchLightPanel':
            console.log('is 1switch');
            tempdev.event=[
                {name:'按下',value:'PressDown'},
                {name:'释放',value:'PressUp'}
            ];
            tempdev.do=[
                {name:'打开',value:'On'},
                {name:'关闭',value:'Off'},
                {name:'反转',value:'Reverse'}
            ];            
            tempdev.advanceEvent=[
                {name:'打开',value:'On'},
                {name:'关闭',value:'Off'}                                        
            ];
            tempdev.chinesetype='1路开关';
        break;
        case '2_SwitchLightPanel':
                console.log('is 2switch');
                tempdev.event=[
                        {name:'1路按下',value:'1PressDown'},
                        {name:'1路释放',value:'1PressUp'},
                        {name:'2路按下',value:'2PressDown'},
                        {name:'2路释放',value:'2PressUp'}
                ];
                tempdev.do=[
                        {name:'1路打开',value:'1On'},
                        {name:'1路关闭',value:'1Off'},
                        {name:'1路反转',value:'1Reverse'},
                        {name:'2路打开',value:'2On'},
                        {name:'2路关闭',value:'2Off'},
                        {name:'2路反转',value:'2Reverse'}
                ];                
                tempdev.advanceEvent=[
                    {name:'1路打开',value:'1On'},
                    {name:'1路关闭',value:'1Off'},                                        
                    {name:'2路打开',value:'2On'},
                    {name:'2路关闭',value:'2Off'}                                                                
                ];
                tempdev.chinesetype='2路开关';
        break;
        case '3_SwitchLightPanel':
                console.log('is 3switch');
                tempdev.event=[
                        {name:'1路按下',value:'1PressDown'},
                        {name:'1路释放',value:'1PressUp'},
                        {name:'2路按下',value:'2PressDown'},
                        {name:'2路释放',value:'2PressUp'},
                        {name:'3路按下',value:'3PressDown'},
                        {name:'3路释放',value:'3PressUp'}
                ];
                tempdev.do=[
                        {name:'1路打开',value:'1On'},
                        {name:'1路关闭',value:'1Off'},
                        {name:'1路反转',value:'1Reverse'},
                        {name:'2路打开',value:'2On'},
                        {name:'2路关闭',value:'2Off'},
                        {name:'2路反转',value:'2Reverse'},
                        {name:'3路打开',value:'3On'},
                        {name:'3路关闭',value:'3Off'},
                        {name:'3路反转',value:'3Reverse'}
                ];                
                tempdev.advanceEvent=[
                    {name:'1路打开',value:'1On'},
                    {name:'1路关闭',value:'1Off'},                                        
                    {name:'2路打开',value:'2On'},
                    {name:'2路关闭',value:'2Off'},
                    {name:'3路打开',value:'3On'},
                    {name:'3路关闭',value:'3Off'}                                                                
                ];
                tempdev.chinesetype='3路开关';
        break;

        case 'PowerPanel':
                console.log('is powerpanel');
                tempdev.event=[
                        {name:'按下',value:'PressDown'},
                        {name:'释放',value:'PressUp'}
                ];
                tempdev.do=[
                        {name:'打开',value:'On'},
                        {name:'关闭',value:'Off'},
                        {name:'反转',value:'Reverse'}
                ];                
                tempdev.advanceEvent=[
                    {name:'打开',value:'On'},
                    {name:'关闭',value:'Off'}                                                                                                                                           
                ];
                tempdev.chinesetype='插座';
        break;
        case 'PowerPanel_Mi':
                console.log('is powerpanelMi');
                tempdev.event={};
                tempdev.do=[
                        {name:'打开',value:'On'},
                        {name:'关闭',value:'Off'},
                        {name:'反转',value:'Reverse'}
                ];                
                tempdev.advanceEvent=[
                    {name:'打开',value:'On'},
                    {name:'关闭',value:'Off'}                                                                                                                                           
                ];
                tempdev.chinesetype='小米插座';
        break;
        case 'BodySensor':
                console.log('is bodysensor');
                tempdev.event=[
                    {name:'人体移动',value:'BodyMove'} 
                ];
                tempdev.do=[
                ];
                tempdev.advanceEvent=[
                    {name:'人体移动',value:'BodyMove'},
                    {name:'没有人体移动',value:'NoBodyMove'}                                            
                ];                
                tempdev.chinesetype='人体感应';
        break;
        case 'MagnetSensor':
                console.log('is magnetsensor');
                tempdev.event=[
                    {name:'关门',value:'PressDown'},
                    {name:'开门',value:'PressUp'}
                ];
                tempdev.do=[
                ];
                tempdev.advanceEvent=[
                    {name:'关门',value:'PressDown'},
                    {name:'开门',value:'PressUp'}                                           
                ];                
                tempdev.chinesetype='门窗传感器';
        break;
        case 'TemperatureSensor':
                console.log('is TemperatureSensor');
                tempdev.event=[
                        {name:'温度',value:'Temperature'},
                        {name:'湿度',value:'Humidity'}
                ];
                tempdev.do=[
                ];
                tempdev.advanceEvent=[
                    {name:'温度',value:'Temperature'},
                    {name:'湿度',value:'Humidity'}                                         
                ];                
                tempdev.chinesetype='温湿度传感器';
        break;

    }
    return tempdev;
}

router.get('/getuserbycode/:code',function(req,res){
    var options = {            
        url:  "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx6debf35e8f567884&secret=04976556b89bbffefe738f5ee068e72f&code="+req.params.code+"&grant_type=authorization_code",
        //url:  "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx6debf35e8f567884&secret=04976556b89bbffefe738f5ee068e72f",
        method: "GET"        
    };     

    console.log('getuserbycode: '+req.params.code);

    request(options, function (error, response, body) {
        if (error) {
            //logger.error("send message to zbClient failed: " + error);
            console.log('getuserbycode openid failed: '+error);
        }
        else {
            var getres = JSON.parse(response.body);            
            console.log('getuserbycode openid: '+getres.openid);
            //global.wechattoken = res.access_token;
            //return 1;
            if (body.message === "success") {
            }
            else {
                //logger.error("send message to zbClient failed. ");
            }

            //console.log('getuserbycode :'+getres.openid);
            UserEntity.findOne({uid:getres.openid},function(err,user){
                         if(err){//查询异常
                                console.log("getid server error")
                         return;
                        }

                        if (user){//手机号已注册
                                console.log("getcode user:" + getres.openid + ' user:'+ user.name)
                                res.send(user);
                        }else{
                                var temp ={"status":"failed","type":"nouser","uid":getres.openid};
                                res.send(temp);
                }
            });
        }
    });


});

router.get('/getuserbyuid/:uid',function(req,res){
	console.log('getuserbyuid :'+req.params.uid);
	UserEntity.findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("getid server error")
                 return;
                }

                if (user){//手机号已注册
                        console.log("getuserbyuid find:" + req.params.uid + ' user:'+ user.name)
			             res.send(user);
                }else{
			              var temp ={"status":"failed","type":"nouser","uid":req.params.uid};
                          res.send(temp);
		}
	});


});

router.get('/getuserbygateway/:mac',function(req,res){
        console.log('getid mac:'+req.params.mac);
        UserEntity.findOne({gateway:req.params.mac},function(err,user){
                 if(err){//查询异常
                        console.log("getid server error")
                 return;
                }

                if (user){//手机号已注册
                        console.log("getid user:" + req.params.uid + ' user:'+ user.name)
                        res.send(user);
                }else{
                        res.send('未找到');
                }
        });


});

router.get('/getgatewaybydevice/:mac',function(req,res){
	var temp = {
		gateway:null,
		name:null,
		uid:null
	}
        console.log('getgatewaybydevice mac:'+req.params.mac);
        GateEntity.findOne({'device.mac':req.params.mac},{'_id':0},function(err,gateway){
	try{
		console.log(gateway);
		temp.gateway = gateway.mac;
		console.log('temp:'+temp);
		UserEntity.findOne({'gateway':gateway.mac},function(err,user){
                 if(err){//查询异常
                        console.log("getid server error")
                 return;
                }

                if (user){//手机号已注册
                        console.log(temp);
                        temp.name = user.name;
			temp.uid = user.uid;
			res.send(temp);
                }else{
                        res.send('未找到');
                }
        	});
	}catch(err){
		console.log(err);
	}	
	});	
	
	
});

router.use('/setpolicbymac/',function(req,res){
        PolicEntity.update({mac:req.body.mac,event:req.body.event}, {name:req.body.name,mac:req.body.mac,event:req.body.event,'do':req.body.do},{upsert:true},  function(err, result){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("setpolicbymac"+req.body.mac)
                        console.log("setpolicbymac"+req.body.event)
                        console.log("setpolicbymac"+req.body.do[0].action)
                        res.send("server err");
                 return;
                }

                        console.log("update result:" + req.body.uid +  result)
                        res.send(result);
        });


});


router.use('/setuserbyuid/',function(req,res){
        UserEntity.update({uid:req.body.uid}, {email:req.body.email,mobile:req.body.mobile,password:req.body.password,name:req.body.name},{upsert:true},  function(err, result){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("getid server error")
			res.send("server err");
                 return;
                }

                        console.log("update result:" + req.body.uid +  result)
                        res.send(result);
        });


});

router.use('/addgatewaybyuid/',function(req,res){
        UserEntity.update({uid:req.body.uid}, {'$push':{'gateway':req.body.mac}},{upsert:true},  function(err, result){ //findOne({uid:req.params.uid},function(err,user){
                console.log('err1:'+err); 
		if(err){//查询异常
                        console.log("add gateway server error")
                        res.send("server err");
	                 return;
                }
        });
	GateEntity.update({mac:req.body.mac},{name:req.body.name},{upsert:true},function(err2,res2){
                console.log('err2:'+err2); 
		if(err2){//查询异常
                        console.log("addgatewayname server error")
                        res.send("server err2"); 
			return;
                }
	});
        console.log("update result:" + req.body.uid)
        res.send("ok");


});

router.use('/removegatewaybyuid/',function(req,res){
        UserEntity.update({uid:req.body.uid}, {'$pull':{'gateway':req.body.mac}},  function(err, result){ //findOne({uid:req.params.uid},function(err,user){
                console.log('err1:'+err);
                if(err){//查询异常
                        console.log("add gateway server error")
                        res.send("server err");
                         return;
                }
        });
        GateEntity.update({mac:req.body.mac},{name:req.body.name},{upsert:true},function(err2,res2){
                console.log('err2:'+err2);
                if(err2){//查询异常
                        console.log("addgatewayname server error")
                        res.send("server err2");
                        return;
                }
        });
        console.log("update result:" + req.body.uid)
        res.send("ok");


});

router.use('/removedevicebymac/',function(req,res){

    GateEntity.find({'device.mac':req.body.mac},{device:{'$elemMatch':{mac:req.body.mac}} },function(err, device){ //findOne({uid:req.params.uid},function(err,user){
        if(err){//查询异常
            console.log("sendCommond server error")                                        
        }

        if(device[0].device[0]){
            console.log('device0: '+device[0].device[0]) ;
            gatewayService.sendDel(device[0].device[0]);
        }
        
        GateEntity.update({'device.mac':req.body.mac},{'$pull':{'device':{'mac':req.body.mac}}},{upsert:true},function(err2,res2){
                console.log('err2:'+err2);
                if(err2){//查询异常
                        console.log("addgatewayname server error")
                        res.send("server err2");
                        return;
                }
        });

        console.log("update result:" )
        res.send("ok");

    });
        


});

router.use('/removepolicbymacevent/',function(req,res){
        PolicEntity.remove({'mac':req.body.mac,'event':req.body.event},function(err2,res2){
                console.log('err2:'+err2);
                if(err2){//查询异常
                        console.log("addgatewayname server error")
                        res.send("server err2");
                        return;
                }
        });
        console.log("update result:" )
        res.send("ok");


});


router.use('/setgatewaybymac/',function(req,res){
        GateEntity.update({mac:req.body.mac}, {name:req.body.name},{upsert:true},  function(err, result){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("getid server error")
                        res.send("server err");
                 return;
                }

                        console.log("update gateway name:" + req.body.mac +  result)
                        res.send(result);
        });


});

router.use('/getpolicbymacevent/',function(req,res){
        PolicEntity.find({'mac':req.body.mac,'event':req.body.event}, {'_id':0},  function(err, result){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("getpolic server error")
                        res.send("server err");
                 return;
                }

                        console.log("getpolic:" + req.body.mac+req.body.event +  result)
                        res.send(result);
        });


});


router.use('/setdevicebymac/',function(req,res){
        GateEntity.update({'device.mac':req.body.mac}, {'device.$.name':req.body.name,'device.$.registered':true},{upsert:true},  function(err, result){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("getid server error")
                        res.send("server err");
                        return;
                }

                        console.log("update gateway name:" + req.body.mac +  result)
                        
                        GateEntity.find({'device.mac':req.body.mac},{device:{'$elemMatch':{mac:req.body.mac}} },function(err, device){ //findOne({uid:req.params.uid},function(err,user){
                            if(err){//查询异常
                                console.log("sendCommond server error")                                        
                            }

                            if(device[0].device[0]){
                                console.log('device0: '+device[0].device[0]) ;
                                gatewayService.sendRegister(device[0].device[0]);
                            }
                        });

                        res.send(result);
        });

        

});

router.use('/getpolicbyuser/:uid',function(req,res){
        UserEntity.find({uid:req.params.uid},{gateway:1,'_id':0},function(err, result){ //findOne({uid:req.params.uid},function(err,user){
		 if(err){//查询异常
                        console.log("getdevice server error")
                        res.send("server err");
                 return;
                }
		try{
			var gatelist = result[0].gateway;
			var devicelist = []; 
			console.log('gatelist'+ JSON.stringify(gatelist));	
        	        console.log("getdevice result:"  +req.params.uid + result)
	                GateEntity.find({mac:{'$in':gatelist}},{'_id':0,'device':1},function(err, device){ //findOne({uid:req.params.uid},function(err,user){
        	         	if(err){//查询异常
                	        	console.log("getdevice server error")
	        	               	 res.send("server err");
		        	         return;
				}
				for(var i=0 ;i<device.length ;i++){
					for(var j =0;j<device[i].device.length;j++){
						devicelist.push( device[i].device[j].mac);
					}
				
				}
			
				console.log('user device:1'+ JSON.stringify(devicelist));
				PolicEntity.find({mac:{'$in':devicelist}},{'_id':0},function(err, polic){
                        	         if(err){//查询异常
                                	         console.log("getdevice server error")
	                                       	 res.send("server err");
        	                         return;
                	                }
                        	        console.log('polic:'+polic);
	                                res.send(polic);
//                              devicelist = device;
        	                });

			});
		}catch(err){
			console.log(err);	
	        	res.send(err);
		}	
        });
});

router.use('/getdevicebycode/:code',function(req,res){

    var options = {            
        url:  "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx6debf35e8f567884&secret=04976556b89bbffefe738f5ee068e72f&code="+req.params.code+"&grant_type=authorization_code",
        //url:  "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx6debf35e8f567884&secret=04976556b89bbffefe738f5ee068e72f",
        method: "GET"        
    };     

    console.log('getdevicebycode: '+req.params.code);

    request(options, function (error, response, body) {
        if (error) {
            //logger.error("send message to zbClient failed: " + error);
            console.log('getdevicebycode openid failed: '+error);
        }
        else {
            var getres = JSON.parse(response.body);            
            console.log('getdevicebycode openid: '+getres.openid);
            //global.wechattoken = res.access_token;
            //return 1;
            if (body.message === "success") {
            }
            else {
                //logger.error("send message to zbClient failed. ");
            }
       
                //console.log("gettoken: "+ global.wechattoken);


                UserEntity.find({uid:getres.openid},{gateway:1,'_id':0},function(err, result){ //findOne({uid:req.params.uid},function(err,user){
                         if(err){//查询异常
                                console.log("getdevice server error")
                                res.send("server err");
                         return;
                        }
                try{
                var gatelist = result[0].gateway;
                //console.log(gatelist);  
                        //console.log("getdevice result:"  +getres.openid + result)
                        GateEntity.find({mac:{'$in':gatelist}},{'_id':0,'device':1},function(err, device){ //findOne({uid:req.params.uid},function(err,user){
                         if(err){//查询异常
                                console.log("getdevice server error")
                                res.send("server err");
                         return;
                        }
                    var temp=new Array();
                
                    for(var i=0 ;i<device.length ;i++){
                        for(var j =0;j<device[i].device.length;j++){                            
                            temp.push(packetDevice(device[i].device[j]));
                                                
                        }
                            
                    }
                    for(var i=0;i<temp.length;i++)
                    {
                        //console.log(temp[i]);
                        for(var j=0;j<temp[i].status.length;j++)
                        {
                            switch(temp[i].status[j]){
                                case '1':temp[i].status[j] = '开';break;
                                case '0':temp[i].status[j] = '关';break;
                                default :temp[i].status[j] ='未知';break;
                            }   
                        }
                        if(temp[i].online == false){
                            temp[i].status = ['离线'];
                        }
                        if(temp[i].registered == false){
                            temp[i].status = ['未注册'];
                        }
                        
                        
                    }
                    console.log(JSON.stringify(temp));
                        res.send(temp);
        //          devicelist = device;
                });
        //          res.send(devicelist);
                }catch(err){
                    res.send(err);
                }
                });
        }
    });
});

router.use('/getdevicebyuser/:uid',function(req,res){
        UserEntity.find({uid:req.params.uid},{gateway:1,'_id':0},function(err, result){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("getdevice server error")
                        res.send("server err");
                 return;
                }
		try{
		var gatelist = result[0].gateway;
		console.log(gatelist);	
                console.log("getdevice result:"  +req.params.uid + result)
                GateEntity.find({mac:{'$in':gatelist}},{'_id':0,'device':1},function(err, device){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("getdevice server error")
                        res.send("server err");
                 return;
                }
			var temp=new Array();
		
			for(var i=0 ;i<device.length ;i++){
				for(var j =0;j<device[i].device.length;j++){
					temp.push(packetDevice(device[i].device[j]));									
				}
					
			}
			for(var i=0;i<temp.length;i++)
			{
				//console.log(temp[i]);
                for(var j=0;j<temp[i].status.length;j++)
                {
    				switch(temp[i].status[j]){
    					case '1':temp[i].status[j] = '开';break;
    					case '0':temp[i].status[j] = '关';break;
    					default :temp[i].status[j] ='未知';break;
    				} 	
                }
				if(temp[i].online == false){
					temp[i].status = ['离线'];
				}
				if(temp[i].registered == false){
					temp[i].status = ['未注册'];
				}
				
				
			}
			console.log(JSON.stringify(temp));
        		res.send(temp);
//			devicelist = device;
		});
//        	res.send(devicelist);
		}catch(err){
			res.send(err);
		}
        });


});

router.use('/getdevicebygateway/:mac',function(req,res){
        GateEntity.find({mac:req.params.mac},{'_id':0,'device':1},function(err, device){ //findOne({uid:req.params.uid},function(err,user){
         if(err){//查询异常
                console.log("getdevice server error")
                res.send("server err");
         return;
        }
        try{
			var temp = new Array();
			for(var i=0 ;i<device.length ;i++){
                for(var j =0;j<device[i].device.length;j++){
                    temp.push(packetDevice(device[i].device[j]));                                                            
                }
                    
            }
            for(var i=0;i<temp.length;i++)
            {
                //console.log(temp[i]);
                for(var j=0;j<temp[i].status.length;j++)
                {
                    switch(temp[i].status[j]){
                        case '1':temp[i].status[j] = '开';break;
                        case '0':temp[i].status[j] = '关';break;
                        default :temp[i].status[j] ='未知';break;
                    }   
                }
                if(temp[i].online == false){
                    temp[i].status = ['离线'];
                }
                if(temp[i].registered == false){
                    temp[i].status = ['未注册'];
                }
                
                
            }

            UserEntity.findOne({'gateway':req.params.mac},{'_id':0},function(err,user){
                try{
                    console.log('getdeviceinfo user.uid: ' + user.uid);
                    temp[0].uid = user.uid;
                    console.log('temp[0]: '+JSON.stringify(temp[0]));
                    //res.send(tempdev);
                    console.log("devicebygateway:"+JSON.stringify(temp));
                    res.send(temp);
                }catch(err){
                    res.send('');
                    console.log('devicebygateway user err: ' + err)
                }
            });
	   }catch(err){
            res.send('');
            console.log('devicebygateway err: ' + err)
       }
    });
    
});
router.use('/getunregdevicebygateway/',function(req,res){
	//	GateEntity.aggregate({"$unwind":"$deivce"}, {"$match":{"device.registered":"false" }},  {"$group": {"_id": "$_id" }},function(err,device){               
	var unreg = new Array();
	console.log('mac='+req.body.mac);
	GateEntity.find({mac:req.body.mac},{'_id':0},function(err, device){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("getunregdevice server error"+err)
                        res.send("server err");
                 return;
                }
		console.log(device);
		try{
                        var temp=device[0].device;
                        for(var i=0;i<temp.length;i++)
                        {
                                //console.log(temp[i]);
                                switch(temp[i].status){
                                        case 'on':temp[i].status = '开';break;
                                        case 'off':temp[i].status = '关';break;
                                        default :temp[i].status =       '未知';break;
                                }
                                if(temp[i].online == false){
                                        temp[i].status = '离线';
                                }
                                if(temp[i].registered == false){
                                        temp[i].status = '未注册';
                                }
				if(temp[i].registered == false){
					unreg.push(temp[i]);
				}

                        }

                        console.log("unregdevicebygateway:"+unreg);
                        res.send(unreg);
		}catch(err){
			console.log(err);
			res.send('{}');
			return;
		}

                });
});

router.use('/getdeviceinfo/:mac',function(req,res){
    GateEntity.find({'device.mac':req.params.mac},{device:{'$elemMatch':{mac:req.params.mac }  } },function(err, device){ //findOne({uid:req.params.uid},function(err,user){
         if(err){//查询异常
                console.log("getdevice server error")
                res.send("server err");
         return;
        }
        try{
            if(device[0].device[0]){
                    //console.log('getdeviceinfo device: '+devi);
                var tempdev = JSON.parse(JSON.stringify(device[0].device[0]));
                switch(tempdev.type){
                    case '1_CurtainPanel':
                        tempdev.chinesetype='1路窗帘';
                    break;
                    case '2_CurtainPanel':
                        tempdev.chinesetype='2路窗帘';
                    break;
                    case 'MiButton':
                        tempdev.chinesetype='小米按钮';
                    break;
                    case '1_SwitchLightPanel':                        
                        tempdev.chinesetype='1路开关';
                    break;
                    case '2_SwitchLightPanel':                               
                            tempdev.chinesetype='2路开关';
                    break;
                    case '3_SwitchLightPanel':                              
                            tempdev.chinesetype='3路开关';
                    break;

                    case 'PowerPanel':                              
                            tempdev.chinesetype='插座';
                    break;
                    case 'PowerPanel_Mi':                              
                            tempdev.chinesetype='小米插座';
                    break;
                    case 'BodySensor':                               
                            tempdev.chinesetype='人体感应';
                    break;
                    case 'MagnetSensor':                                
                            tempdev.chinesetype='门窗传感器';
                    break;
                    case 'TemperatureSensor':                                
                            tempdev.chinesetype='温湿度传感器';
                    break;
                }
                GateEntity.findOne({'device.mac':req.params.mac},{'_id':0},function(err,gateway){
                    console.log('getdeviceinfo gateway: ' + gateway.mac);
                    if(gateway.mac){
                        tempdev.gateway = gateway.mac;        
                        UserEntity.findOne({'gateway':gateway.mac},{'_id':0},function(err,user){
                            console.log('getdeviceinfo user.uid: ' + user.uid);
                            tempdev.uid = user.uid;
                            console.log('getdeviceinfo tempdev: '+JSON.stringify(tempdev));
                            res.send(tempdev);
                        });
                    }else{
                        console.log('getdeviceinfo tempdev: '+JSON.stringify(tempdev));
                        res.send(tempdev);
                    }

                });			
    		}
        }catch(err){
            console.log('getdeviceinfo err: '+err)
        }
    });
});

router.use('/getgatewaybyuser/:uid',function(req,res){
        UserEntity.find({uid:req.params.uid},{gateway:1,'_id':0},function(err, result){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("getdevice server error")
                        res.send("server err");
                 return;
                }
                try{
                var gatelist = result[0].gateway;
                console.log(gatelist);
                console.log("getdevice result:"  +req.params.uid + result)
                GateEntity.find({mac:{'$in':gatelist}},{'_id':0},function(err, device){ //findOne({uid:req.params.uid},function(err,user){
                 if(err){//查询异常
                        console.log("getdevice server error")
                        res.send("server err");
                 return;
                }
                        console.log(device);
                        res.send(device);
//                      devicelist = device;
                });
//              res.send(devicelist);
                }catch(err){
                        res.send(err);
                }
        });


});

/*
router.get('/device/:uid',function(req,res){

        console.log("req.uid :" + req.params.uid);
                UserEntity.findOne({uid:req.params.uid},'_id',function(err,user){
                 if(err){//查询异常
                        console.log("server error")
                 return;
                }

                if (user){//手机号已注册
                        console.log("find user:" + req.params.uid)
        		res.sendfile(path.join(__dirname , '../public','device.html') );
			return;
                }

                var registerUser = new UserEntity({name:"游客",uid:req.params.uid});

                //调用实体的实例的保存方法
                registerUser.save(function(err,row){
                if(err){//服务器保存异常
                        console.log("save error:" + err);
                        return;
                }
                console.log("creat user ok");
                });
		res.sendfile(path.join(__dirname , '../public','login.html') );
        });

});




router.use('/polic/', function(req,res){
	res.sendfile(path.join(__dirname, '../public', 'polic.html'));
        //res.sendfile('polic.html' );
        console.log(req.params.id);
        console.log("session read:" + req.session.user);

});

router.use('/user/', function(req,res){
        res.sendfile(path.join(__dirname , '../public','user.html') );
        console.log(req.params.id);

});

router.use('/gateway/', function(req,res){
        res.sendfile(path.join(__dirname , '../public','gateway.html') );
        console.log(req.params.id);

});
*/
router.get('/weixin/',  function(req, res, next) {
	res.send('敬请期待哦！');

});
router.get('/',  function(req, res, next) {
	res.send('welcome xx的平方开根号！ 京ICP备17063732号');

});
router.use('/', wechat(config, function(req, res, next) {
        var message = req.weixin;
        console.log("wechat : " + JSON.stringify(message));
        //文本
	if(message.Event === 'CLICK' ){
		UserEntity.findOne({uid:message.FromUserName},function(err,user){
	                 if(err){//查询异常
                	        console.log("wechat menu getid error")
	        	         return;
	                }	

               		 if (user){//手机号已注册
	                       	console.log("wechat menu find user:" + message.FromUserName + ' user:'+ user.name)
   				if (message.Event === 'CLICK' && message.EventKey === 'device') {
			                res.reply('<a href=\"http://yulurobot.cn/device.html#' + message.FromUserName  +'\">管理您的设备请点我</a>');
			                console.log('管理您的设备请<a href=\"http://yulurobot.cn/device.html#' + message.FromUserName  +'\">点我</a>');
			        }
			        else if (message.Event === 'CLICK' && message.EventKey === 'polic') {

			                res.reply('<a href=\"http://yulurobot.cn/polic.html#' + message.FromUserName  +'\">管理您的场景请点我</a>');
			                console.log('<a href=\"http://www.yulurobot.cn/polic.htm#' + message.FromUserName  +'\">点我</a>');
			        }
			        else if (message.Event === 'CLICK' && message.EventKey === 'user') {

		        	        res.reply('<a href=\"http://yulurobot.cn/user.html#' + message.FromUserName  +'\">管理您的账户信息请点我</a>');
        		        	console.log('<a href=\"http://www.yulurobot.cn/user.html#' + message.FromUserName  +'\">点我</a>');
			        }
			        else if (message.Event === 'CLICK' && message.EventKey === 'gateway') {

	        		        res.reply('<a href=\"http://yulurobot.cn/gateway.html#'+ message.FromUserName  + '\">管理您的网关请点我</a>');
			                console.log('<a href=\"http://www.yulurobot.cn/gateway.html#' + message.FromUserName  +'\">点我</a>');
			        }
	
			        else if(message.MsgType === 'text'){
			               	console.log('send to ' + message.FromUserName + '留言已收到~谢谢');
        			        res.reply('留言已收到~谢谢');
			        }	
	             	}else{
        			res.reply('欢迎您~，请点击连接完善您的信息，然后再进行添加网关操作 <a href=\"http://yulurobot.cn/user.html#' + message.FromUserName  +'\">点我</a>');
				return;
	        	}
		});
	}        
    else if(message.MsgType === 'text'){
            console.log('send to ' + message.FromUserName + '留言已收到~谢谢');
            res.reply('留言已收到~谢谢');
    }
    else if(message.Event === 'subscribe'){
            console.log('send to ' + message.FromUserName + '欢迎来到您的未来家居，请点击本条消息完善个人信息');
            res.reply('欢迎来到您的未来家居，请点击 "菜单" -> "用户信息" 完善您的个人信息，然后按照小T操作指南添加小T~ 尽情享受吧!');
    }
    //wechat : {"ToUserName":"gh_2856522bb84c","FromUserName":"oZWQZw8mzd_hyoKltq5Z-YRGwV1g","CreateTime":"1512980085","MsgType":"event","Event":"subscribe","EventKey":""}

}));

module.exports = router;


