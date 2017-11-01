var mongodb = require('../config/mgconfig');//引入config中的mongodb对象  
var mongoose = mongodb.mongoose;//获取mongoose  
var Schema = mongoose.Schema;//获取Schema,以便快捷使用  
var ObjectId = Schema.Types.ObjectId;//获取ObjectId类型,以便快捷使用  
  
exports.mongodb = mongodb;//导出mongodb  
exports.mongoose = mongoose; //导出mongoose  
exports.Schema = Schema;//导出Schema  
exports.ObjectId = ObjectId;//导出ObjectId  
exports.Mixed = Schema.Types.Mixed;//导出Mixed
