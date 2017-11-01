var base = require('./base');  
var ObjectId = base.ObjectId;  
var GateScheme =new base.Schema({  
    	name:{type:String,default:'未命名'}，
	mac:String,
    	createTime:{type:Date,default:Date.now},//创建时间  
  	device:[String],
 	online:Boolean,
	ip:String,
	mqtt:String 
  
});  
GateScheme.index({mac:1},{"background" : true});//设置索引  
var GateEntity = base.mongoose.model('GateEntity',GateScheme,'gateway');//指定在数据库中的collection名称为user  
exports.GateEntity  = GateEntity;//导出实体