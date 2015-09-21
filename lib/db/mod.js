//  模块表
var S = require('kissy').KISSY,
	Util = require('util'),
	UtilTool = require('../tools/utils'),
	BaseDB = require('./base');
/*
字段：
name 模块名
tag 标签
fields 字段
assets 外链
code 代码
	html
	js
	css
data 测试数据
owner 作者
createDate 上传时间
*/
function ModDB(config){
	var _self = this;
	_self.config = S.merge(ModDB.config, config);
	ModDB.super_.call(_self, _self.config);
}

Util.inherits(ModDB, BaseDB);
ModDB.config = {
	db: 'VeTmsDB',
	col: 'mod'
};

S.mix(ModDB.prototype, {
	statusMap: {
		'new': '新模块',
		'removed': '已删除'
	},

	_init: function(){},
	
	add: function(data, callback){
		var _self = this;
		data = S.merge({
			name: data.name,
			tag: data.tag,
			owner: data.owner,
			fields: [],
			assets: {},
			code: {},
			data: {}
		}, _self.getBaseData());
		_self._getStatusObj('new', data);
		_self._add(data, callback);
	},
	updateInfo: function(id, data, callback){
		var _self = this;
		_self.updateById(id, {
			'$set': {
				'name': data.name,
				'tag': data.tag
			}
		}, callback);
	},
	updateData: function(id, data, callback){
		var _self = this;
		_self.updateById(id, {
			'$set': {
				'fields': data.config,
				'assets.js': data.jsUrl,
				'assets.css': data.cssUrl,
				'code.html': data.html,
				'code.js': data.js,
				'code.css': data.css,
				'data': data.data
			}
		}, callback);
	}
	
});

module.exports = new ModDB();
