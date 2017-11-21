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

//router.use(express.query());
router.use('/joinbymac/',  function(req, res, next) {
        console.log('joinbynac'+req.body.mac);
	res.send('{}');
});

router.use('/sendbymac/',function(req,res){
        GateEntity.update({'device.mac':req.body.mac},{'$set':{'device.$.status':req.body.do}},{upsert:true},function(err2,res2){
                console.log('err2:'+err2);
                if(err2){//查询异常
                        console.log("addgatewayname server error")
                        res.send("server err2");
                        return;
                }
        });
	
                        console.log("sendbymac:" + req.body.mac +  req.body.do)
                        res.send('ok');


});


router.get('/getuserbyuid/:uid',function(req,res){
	console.log('getid uid:'+req.params.uid);
	UserEntity.findOne({uid:req.params.uid},function(err,user){
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
        UserEntity.update({uid:req.body.uid[0]}, {email:req.body.email,mobile:req.body.mobile,password:req.body.password,name:req.body.name},{upsert:true},  function(err, result){ //findOne({uid:req.params.uid},function(err,user){
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
        UserEntity.update({uid:req.body.uid[0]}, {'$push':{'gateway':req.body.mac}},{upsert:true},  function(err, result){ //findOne({uid:req.params.uid},function(err,user){
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
        console.log("update result:" + req.body.uid[0])
        res.send("ok");


});

router.use('/removegatewaybyuid/',function(req,res){
        UserEntity.update({uid:req.body.uid[0]}, {'$pull':{'gateway':req.body.mac}},  function(err, result){ //findOne({uid:req.params.uid},function(err,user){
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
        console.log("update result:" + req.body.uid[0])
        res.send("ok");


});

router.use('/removedevicebymac/',function(req,res){
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
			var num = 0;
			for(var i=0 ;i<device.length ;i++){
				for(var j =0;j<device[i].device.length;j++){
					var tempdev = JSON.parse(JSON.stringify(device[i].device[j]));
					switch(tempdev.type){
						case 'MiButton':
							console.log('is mibutton');
							tempdev.event=[
								{name:'按下',value:'PressDown'},
								{name:'释放',value:'PressUp'},
								{name:'双击',value:'DoubleClick'}
							];
							tempdev.do = {
      							};
							tempdev.chinesstype='小米按钮';
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
							tempdev.chinesstype='1路开关';
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
                                                        tempdev.chinesstype='2路开关';
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
                                                        tempdev.chinesstype='3路开关';
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
                                                        tempdev.chinesstype='插座';
                                                break;
                                                case 'PowerPanel_Mi':
                                                        console.log('is powerpanelMi');
                                                        tempdev.event={};
                                                        tempdev.do=[
                                                                {name:'打开',value:'On'},
                                                                {name:'关闭',value:'Off'},
                                                                {name:'反转',value:'Reverse'}
                                                        ];
                                                        tempdev.chinesstype='小米插座';
                                                break;
                                                case 'BodySensor':
                                                        console.log('is bodysensor');
                                                        tempdev.event=[
                                                                {name:'人体移动',value:'BodyMove'},
                                                        ];
                                                        tempdev.do=[
                                                        ];
                                                        tempdev.chinesstype='人体感应';
                                                break;
                                                case 'MagnetSensor':
                                                        console.log('is magnetsensor');
                                                        tempdev.event=[
                            								{name:'关门',value:'PressDown'},
                            								{name:'开门',value:'PressUp'}
                                                        ];
                                                        tempdev.do=[
                                                        ];
                                                        tempdev.chinesstype='门窗传感器';
                                                break;
                                                case 'TemperatureSensor':
                                                        console.log('is TemperatureSensor');
                                                        tempdev.event=[
                                                                {name:'温度',value:'Temperature'},
                                                                {name:'湿度',value:'Humidity'}
                                                        ];
                                                        tempdev.do=[
                                                        ];
                                                        tempdev.chinesstype='温湿度传感器';
                                                break;

					}
					temp.push(tempdev);
										
				}
					
			}
			for(var i=0;i<temp.length;i++)
			{
				//console.log(temp[i]);
				switch(temp[i].status){
					case 'on':temp[i].status = '开';break;
					case 'off':temp[i].status = '关';break;
					default :temp[i].status =	'未知';break;
				} 	
				if(temp[i].online == false){
					temp[i].status = '离线';
				}
				if(temp[i].registered == false){
					temp[i].status = '未注册';
				}
				
				
			}
			console.log(temp);
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

                        }

			console.log("devicebygateway:"+temp);
                        res.send(temp);

                
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
			console.log(device[0].device[0]);
			res.send(device[0].device[0]);

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

}));

module.exports = router;


