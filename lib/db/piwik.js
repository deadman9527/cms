//  piwik 数据表
var S = require('kissy').KISSY,
	Util = require('util'),
	UtilTool = require('../tools/utils'),
	PiwikTool = require('../tools/piwik'),
	BaseDB = require('./base');
/*
字段：
pageId 页面id
day 每天数据，数组
	date 日期
	data 数据
*/	
function PiwikDB(config){
	var _self = this;
	_self.config = S.merge(PiwikDB.config, config);
	PiwikDB.super_.call(_self, _self.config);
}

Util.inherits(PiwikDB, BaseDB);
PiwikDB.config = {
	db: 'VeTmsDB',
	col: 'piwik'
};

S.mix(PiwikDB.prototype, {	
	_init: function(){},
	
	add: function(id, callback){
		var _self = this;
		data = S.merge({
			pageId: id,
			day: [],
		}, _self.getBaseData());
		_self._add(data, callback);
	},
	
	saveDay: function(id, date, obj, callback, errback){
		var _self = this;
		_self.findBy({'pageId': id}, null, function(data){
			if(!data || data.length === 0){
				_self.add(id, function(_data){
					_self._saveDay(_data, date, obj, callback, errback);
				}, errback);
			}else{
				_self._saveDay(data[0], date, obj, callback, errback);
			}
		});
	},
	_saveDay: function(data, date, obj, callback, errback){
		var _self = this,
			hasDay = false;
		S.each(data.day, function(d){
			if(d.date === date){
				hasDay = true;
				return false;
			}
		});
		if(hasDay){
			_self.updateBy({'pageId': data.pageId, 'day.date': date}, {
				'$set': {'day.$.data': obj}
			}, callback, errback);
		}else{
			_self.updateBy({'pageId': data.pageId}, {
				'$push': {'day': {
					'date': date,
					'data': obj
				}}
			}, callback, errback);
		}
	},
	
	getDay: function(id, date, callback){
		var _self = this;
		_self.findBy({'pageId': id, 'day.date': date}, null, function(list){
			if(list && list.length > 0){
				var result = null;
				S.each(list[0].day, function(d){
					if(d.date === date){
						result = d.data;
						return false;
					}
				});
				callback && callback(result);
			}else{
				PiwikTool.getDay(id, date, function(obj){
					_self.saveDay(id, date, obj, function(){
						callback && callback(obj);
					});
				}, function(){
					callback && callback(null);
				});
			}
		});
	}

});

module.exports = new PiwikDB();
