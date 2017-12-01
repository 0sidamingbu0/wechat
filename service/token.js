var UserEntity = require('../models/user').UserEntity;
var GateEntity = require('../models/gateway').GateEntity;
var request = require("request");



//var token='M0RhFWXEyrgS6ywrmaPHoE9ehEAVOO8Q2fXppoxN4hqxmQkajPTAdrK75LSGiqRHw0WYfPB618EDKk7dQ7KenkIK2u3zr_zySy6t2KmZaVKpTSKudBc4YsqSHoew903-VJVdAFACQC';

var gettoken2 = function() {
	sendGet('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx6debf35e8f567884&secret=04976556b89bbffefe738f5ee068e72f');
    //console.log("gettoken: "+ token);
}

var myInterval=setInterval(gettoken2,2*60*60*1000-20,"Interval");
//var myInterval=setTimeout(gettoken,1000);
//clearTimeout(mytimeout);



var sendGet = function(url){
    var options = {
        url:  url,
        method: "GET",        
    };     

    //console.log('send get: '+url);

    request(options, function (error, response, body) {
        if (error) {
            //logger.error("send message to zbClient failed: " + error);
            console.log('get token failed: '+error);
        }
        else {
        	var res = JSON.parse(response.body);        	
            console.log('get token: '+res.access_token);
            global.wechattoken = res.access_token;
            return 1;
            if (body.message === "success") {
            }
            else {
                //logger.error("send message to zbClient failed. ");
            }
        }
    });
}

 exports.gettoken = function() {

    var options = {
        url:  "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx6debf35e8f567884&secret=04976556b89bbffefe738f5ee068e72f",
        method: "GET",        
    };     

    //console.log('send get: '+url);

    request(options, function (error, response, body) {
        if (error) {
            //logger.error("send message to zbClient failed: " + error);
            console.log('get token failed: '+error);
        }
        else {
        	var res = JSON.parse(response.body);        	
            console.log('get token: '+res.access_token);
            global.wechattoken = res.access_token;
            return 1;
            if (body.message === "success") {
            }
            else {
                //logger.error("send message to zbClient failed. ");
            }
        }
    });
    console.log("gettoken: "+ global.wechattoken);
    
}

//gettoken();

