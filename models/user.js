var base = require('./base');  
var ObjectId = base.ObjectId;  
var UserScheme =new base.Schema({  
    	name:String,
	uid:String,
	password:String,//密码  
    	mobile:String,//手机  
    	email:String,
	lastLoginTime:{type:Date,default:Date.now},//最后登陆时间  
    	createTime:{type:Date,default:Date.now},//创建时间  
  	gateway:[String],
	otheruid:[String]
  
  
});  
UserScheme.index({uid:1},{"background" : true});//设置索引  
var UserEntity = base.mongoose.model('UserEntity',UserScheme,'user');//指定在数据库中的collection名称为user  
exports.UserEntity  = UserEntity;//导出实体
