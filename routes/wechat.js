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

//router.use(express.query());

router.get('/getid/:uid',function(req,res){
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

router.use('/setid/',function(req,res){
	console.log(req.query);
	console.log(req.body);
	console.log(req.body.uid[0]);
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
			                res.reply('管理您的设备请<a href=\"http://123.207.144.78/device.html#' + message.FromUserName  +'\">点我</a>');
			                console.log('管理您的设备请<a href=\"http://123.207.144.78/device.html#' + message.FromUserName  +'\">点我</a>');
			        }
			        else if (message.Event === 'CLICK' && message.EventKey === 'polic') {

			                res.reply('管理您的设备请<a href=\"http://123.207.144.78/polic.html#' + message.FromUserName  +'\">点我</a>');
			                console.log('<a href=\"http://www.yulurobot.cn/polic.htm#' + message.FromUserName  +'\">点我</a>');
			        }
			        else if (message.Event === 'CLICK' && message.EventKey === 'user') {

		        	        res.reply('管理您的账户信息请<a href=\"http://123.207.144.78/user.html#' + message.FromUserName  +'\">点我</a>');
        		        	console.log('<a href=\"http://www.yulurobot.cn/user.html#' + message.FromUserName  +'\">点我</a>');
			        }
			        else if (message.Event === 'CLICK' && message.EventKey === 'gateway') {

	        		        res.reply('管理您的网关请<a href=\"http://123.207.144.78/gateway.html#' + '\">点我</a>');
			                console.log('<a href=\"http://www.yulurobot.cn/gateway.html#' + message.FromUserName  +'\">点我</a>');
			        }
	
			        else if(message.MsgType === 'text'){
			               	console.log('send to ' + message.FromUserName + '留言已收到~谢谢');
        			        res.reply('留言已收到~谢谢');
			        }	
	             	}else{
        			res.reply('欢迎您~，请点击连接完善您的信息，然后再进行添加网关操作 <a href=\"http://123.207.144.78/user.html#' + message.FromUserName  +'\">点我</a>');
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


