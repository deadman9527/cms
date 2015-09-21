//  图片表
var S = require('kissy').KISSY,
	Util = require('util'),
	UtilTool = require('../tools/utils'),
	BaseDB = require('./base');
/*
字段：
url 线上地址
name 源文件名
owner 上传人
createDate 上传时间
*/	
function ImgDB(config){
	var _self = this;
	_self.config = S.merge(ImgDB.config, config);
	ImgDB.super_.call(_self, _self.config);
}

Util.inherits(ImgDB, BaseDB);
ImgDB.config = {
	db: 'VeTmsDB',
	col: 'img'
};

S.mix(ImgDB.prototype, {
	typeMap: {
		'img': '图片',
		'qrcode': '二维码'
	},
	_init: function(){},
	
	add: function(data, callback){
		var _self = this;
		data = S.merge({
			url: data.url,
			type: data.type || 'img',
			name: data.name,
			owner: data.owner
		}, _self.getBaseData());
		_self._add(data, callback);
	}

});

module.exports = new ImgDB();
