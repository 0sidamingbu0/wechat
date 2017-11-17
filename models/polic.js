var base = require('./base');  
var ObjectId = base.ObjectId;  
var PolicScheme =new base.Schema({  
    	mac:String,
	event:String,
	lastTime:{type:Date,default:Date.now},//最后登陆时间  
    	createTime:{type:Date,default:Date.now},//创建时间  
	name:String,
 	do:[{
		mac:{type:String},
                type:{type:String},
		action:{type:String}
	}]
  
  
});  
PolicScheme.index({mac:1},{"background" : true});//设置索引  
var PolicEntity = base.mongoose.model('PolicEntity',PolicScheme,'polic');//指定在数据库中的collection名称为user  
exports.PolicEntity  = PolicEntity;//导出实体
