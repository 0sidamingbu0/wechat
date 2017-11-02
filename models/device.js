var base = require('./base');  
var ObjectId = base.ObjectId;  
var DeviceScheme =new base.Schema({  
    	name:{type:String,default:'未命名'},
	mac:String,
	type:String,
    	createTime:{type:Date,default:Date.now},//创建时间  
 	addr:Number,
	online:Boolean, 
	gmac:String  
});  
DeviceScheme.index({mac:1},{"background" : true});//设置索引  
var DeviceEntity = base.mongoose.model('DeviceEntity',DeviceScheme,'device');//指定在数据库中的collection名称为user  
exports.DeviceEntity  = DeviceEntity;//导出实体
