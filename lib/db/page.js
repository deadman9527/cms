//  页面表
var S = require('kissy').KISSY,
	Util = require('util'),
	UtilTool = require('../tools/utils'),
	DBTool = require('../tools/db'),
	BaseDB = require('./base');
/*
字段：
title 标题
name 页面名称，运营标识用
path 路径，唯一
pageType 页面类型 pc mobile
buildType 构建类型 visual code
modList 模块列表、模块数据
code 代码
owner 创建人
whiteList 访问白名单
curStatus 当前状态 
status 状态
	editing 编辑中
	published 已发布
	removed 已删除
*/	
function PageDB(config){
	var _self = this;
	_self.config = S.merge(PageDB.config, config);
	PageDB.super_.call(_self, _self.config);
}

Util.inherits(PageDB, BaseDB);
PageDB.config = {
	db: 'VeTmsDB',
	col: 'page'
};

S.mix(PageDB.prototype, {
	statusMap: {
		'new': '新页面',
		'published': '已发布',
		'editing': '修改中',
		'removed': '已删除'
	},
	typeMap: {
		'm': '移动端页面',
		'pc': 'PC端页面',
		'rgn': '代码区块',
		'data': '数据区块'
	},
	buildMap: {
		'code': '代码构建',
		'visual': '可视化构建'
	},
	
	_init: function(){},
	
	add: function(data, callback){
		var _self = this;
		data = S.merge({
			title: data.title,
			name: data.name,
			path: data.path,
			pageType: data.pageType,
			buildType: data.buildType,
			owner: data.owner,
			modList: [],
			whiteList: [],
			code: {
				fields: [],
				assets: {},
				code: {},
				data: {}
			}
		}, _self.getBaseData());
		_self._getStatusObj('new', data.owner, data);		
		_self._add(data, callback);
	},
	
	// 复制页面
	copy: function(id, data, callback){
		var _self = this;
		_self.findById(id, function(oData){
			if(oData && oData.curStatus.id !== 'removed'){
				data = S.merge(oData, {
					title: data.title,
					name: data.name,
					path: data.path,
					owner: data.owner
				}, _self.getBaseData());
				_self._getStatusObj('new', data.owner, data);	
				delete data._id;
				_self._add(data, callback);
			}else{
				callback({
					success: false,
					error: '页面不存在！'
				});
			}
		});
	},
	
	// 更新页面模块列表
	updateModuleList: function(id, data, callback){
		var _self = this;
		_self.updateById(id, {
			'$set': {'modList': data}
		}, callback);
	},
	// 更新页面模块数据
	updateModuleData: function(id, modId, data, callback){
		console.log(data);
		var _self = this;
		_self.updateBy({
			'_id': DBTool.getId(id),
			'modList.id': modId
		}, {
			'$set': {
				'modList.$.data': data.data,
				'modList.$.render': data.render
			}
		}, callback);
	},
	// 更新页面代码
	updateCode: function(id, data, callback){
		var _self = this,
			updateData = {
				'code.fields': data.fields,
				'code.code.html': data.html
			};
		if(data.js || data.css || data.jsUrl || data.cssUrl){
			updateData = S.merge(updateData, {
				'code.assets.js': data.jsUrl,
				'code.assets.css': data.cssUrl,
				'code.code.js': data.js,
				'code.code.css': data.css
			});
		}
		
		// 数据合并
		_self.findById(id, function(pdata){
			var orgData = pdata.code.data;
			S.each(data.data, function(f, k){
				if(orgData[k]){
					data.data[k] = orgData[k];
				}
			});

			updateData['code.data'] = data.data;
			
			_self.updateById(id, {
				'$set': updateData
			}, callback);
		});
		
	},
	// 更新页面数据
	updateData: function(id, data, callback){
		var _self = this;
		_self.updateById(id, {
			'$set': {
				'code.data': data.data//,
				//'code.render': data.render
			}
		}, callback);
	},
	// 更新页面信息
	updateInfo: function(id, data, callback){
		var _self = this,
			updateInfo = {
				'title': data.title,
				'name': data.name,
				'whiteList': data.whiteList || []
			};
		if(data.owner){
			updateInfo.owner = data.owner;
		}
		_self.updateById(id, {
			'$set': updateInfo
		}, callback);
	},
	// 重写
	// 更新记录状态
	updateStatus: function(id, status, operator, callback, errback){
		if(S.isString(status)){
			status = {id: status};
		}
		var _self = this,
			updateInfo = _self._getUpdateStatusInfo(status, operator);	
		_self.updateById(id, updateInfo, function(){
			_self.emit('statusUpdated', {status: status, id: id, operator: operator});
			callback && callback();
		}, errback);
	},
	updateStatusBy: function(by, status, operator, callback, errback){
		if(S.isString(status)){
			status = {id: status};
		}
		var _self = this,
			updateInfo = _self._getUpdateStatusInfo(status, operator);
		_self.updateBy(by, updateInfo, function(){
			_self.emit('statusUpdated', {status: status, by: by, operator: operator});
			callback && callback();
		}, errback);
	},
	_getUpdateStatusInfo: function(status, operator){
		var _self = this,
			statusObj = _self._getStatusObj(status, operator),
			updateInfo = {
				'$set': {'curStatus': statusObj},
				'$push': {'status': statusObj}
			};
		return updateInfo;
	},
	// {id:'', failed: '', msg: '', date: '', operator: {name, id, email}}
	_getStatusObj: function(status, operator, data){
		if(S.isString(status)){
			status = {id: status};
		}
		var _self = this,
			statusObj = {
				id: status.id,
				operator: operator,
				date: new Date().getTime()
			};
		if(status.id === 'failed'){
			statusObj['failed'] = status.failed;
			statusObj['msg'] = status.msg || '';
		}
		if(data){
			data.curStatus = statusObj;
			data.status.push(statusObj);
		}
		return statusObj;
	},
	// 删除记录 - 软删除
	removeSoft: function(id, operator, callback, errback){
		var _self = this;
		_self.updateStatus(id, 'removed', operator, function(){
			_self.emit('removed', {id: id, removeType: 'soft', operator: operator});
			callback && callback();
		}, errback);
	}

});

module.exports = new PageDB();
