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
					temp.push(device[i].device[j]);
					
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
			                res.reply('管理您的设备请<a href=\"http://yulurobot.cn/device.html#' + message.FromUserName  +'\">点我</a>');
			                console.log('管理您的设备请<a href=\"http://yulurobot.cn/device.html#' + message.FromUserName  +'\">点我</a>');
			        }
			        else if (message.Event === 'CLICK' && message.EventKey === 'polic') {

			                res.reply('管理您的场景请<a href=\"http://yulurobot.cn/polic.html#' + message.FromUserName  +'\">点我</a>');
			                console.log('<a href=\"http://www.yulurobot.cn/polic.htm#' + message.FromUserName  +'\">点我</a>');
			        }
			        else if (message.Event === 'CLICK' && message.EventKey === 'user') {

		        	        res.reply('管理您的账户信息请<a href=\"http://yulurobot.cn/user.html#' + message.FromUserName  +'\">点我</a>');
        		        	console.log('<a href=\"http://www.yulurobot.cn/user.html#' + message.FromUserName  +'\">点我</a>');
			        }
			        else if (message.Event === 'CLICK' && message.EventKey === 'gateway') {

	        		        res.reply('管理您的网关请<a href=\"http://yulurobot.cn/gateway.html#'+ message.FromUserName  + '\">点我</a>');
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


