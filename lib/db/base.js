//  数据表基类
var DBTool = require('../tools/db'),
	UtilTool = require('../tools/utils'),
	Util = require('util'),
	Events = require("events"),
	S = require('kissy').KISSY;
	
function BaseDB(config){
	var _self = this;
	_self.config = S.merge(BaseDB.config, config);
	BaseDB.super_.call(_self);
}
Util.inherits(BaseDB, Events.EventEmitter);
BaseDB.config = {
	db: '',
	col: ''
};

S.mix(BaseDB.prototype, {
	// 增加记录
	getBaseData: function(){
		return {
			curStatus: null,
			status: [],
			createDate: new Date().getTime()
		};
	},
	add: function(){},
	_add: function(data, callback, errback){
		var _self = this;
		DBTool.add(_self.config.db, _self.config.col, data, function(err, r){
			if (!err){
				_self.emit('added', {data: r[0]});
				callback && callback(r[0]);
			}else{
				errback && errback(err);
			}
		});
	},
	// 查询记录
	findBy: function(by, opt, callback){
		var _self = this;
		_self._findBy(by, opt, callback);
	},
	_findBy: function(by, opt, callback){
		var _self = this;
		DBTool.findBy(_self.config.db, _self.config.col, by, opt, function(data, c){
			callback(data, c);
		});
	},
	// 按ID查询
	findById: function(id, callback){
		var _self = this;
		_self._findById(id, callback);
	},
	_findById: function(id, callback){
		var _self = this;
		DBTool.findById(_self.config.db, _self.config.col, id, function(data){
			callback(data);
		});
	},
	// 更新记录
	updateById: function(id, data, callback, errback){
		var _self = this;
		_self._updateById(id, data, callback, errback);
	},
	_updateById: function(id, data, callback, errback){
		var _self = this;
		DBTool.updateById(_self.config.db, _self.config.col, id, data, function(err){
			if(!err){
				_self.emit('updated', {id: id});
				callback && callback();
			}else{
				errback && errback(err);
			}
		});
	},
	updateBy: function(by, data, callback, errback){
		var _self = this;
		_self._updateBy(by, data, callback, errback);
	},
	_updateBy: function(by, data, callback, errback){
		var _self = this;
		DBTool.updateBy(_self.config.db, _self.config.col, by, data, function(err){
			if(!err){
				_self.emit('updated', {by: by});
				callback && callback();
			}else{
				errback && errback(err);
			}
		});
	},
	// 更新记录状态
	updateStatus: function(id, status, callback, errback){
		if(S.isString(status)){
			status = {id: status};
		}
		var _self = this,
			updateInfo = _self._getUpdateStatusInfo(status);	
		_self.updateById(id, updateInfo, function(){
			_self.emit('statusUpdated', {status: status, id: id});
			callback && callback();
		}, errback);
	},
	updateStatusBy: function(by, status, callback, errback){
		if(S.isString(status)){
			status = {id: status};
		}
		var _self = this,
			updateInfo = _self._getUpdateStatusInfo(status);
		_self.updateBy(by, updateInfo, function(){
			_self.emit('statusUpdated', {status: status, by: by});
			callback && callback();
		}, errback);
	},
	_getUpdateStatusInfo: function(status){
		var _self = this,
			statusObj = _self._getStatusObj(status),
			updateInfo = {
				'$set': {'curStatus': statusObj},
				'$push': {'status': statusObj}
			};
		return updateInfo;
	},
	// {id:'', failed: '', msg: ''}
	_getStatusObj: function(status, data){
		if(S.isString(status)){
			status = {id: status};
		}
		var _self = this,
			statusObj = {
				id: status.id,
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
	removeSoft: function(id, callback, errback){
		var _self = this;
		_self.updateStatus(id, 'removed', function(){
			_self.emit('removed', {id: id, removeType: 'soft'});
			callback && callback();
		}, errback);
	},
	// 删除记录 - 硬删除
	removeHard: function(id, callback, errback){
		var _self = this;
		_self._removeHard(id, callback, errback);
	},
	_removeHard: function(id, callback, errback){
		var _self = this;
		_self.findById(id, function(data){
			DBTool.removeById(_self.config.db, _self.config.col, id, function(err, num){
				if(!err){
					_self.emit('removed', {id: id, num: num, data: data, removeType: 'hard'});
					callback && callback();
				}else{
					errback && errback(err);
				}
			});
		});
	},
	// 批量删除记录 - 硬删除
	removeBy: function(by, callback, errback){
		var _self = this;
		_self.findBy(by, null, function(data){
			DBTool.removeBy(_self.config.db, _self.config.col, by, function(err, num){
				if(!err){
					_self.emit('removed', {by: by, num: num, data: data, removeType: 'hard'});
					callback && callback();
				}else{
					errback && errback(err);
				}
			});
		});
	}	
	
});


module.exports = BaseDB;
