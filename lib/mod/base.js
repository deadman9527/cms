/* 模块操作 */
var pathModule = require("path"),
	S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	modDB = require('../db/mod');
	

var getModuleList = function(callback){
	var moduleData = [];
		
	modDB.findBy({'curStatus.id': {'$ne': 'removed'}}, {sort: {'createDate': -1}}, function(list){
		S.each(list, function(m, i){
			moduleData.push(getModuleData(m));
		});
		callback(moduleData);
	});
};

// data or id
var getModuleData = function(modData, callback){	
	if(S.isPlainObject(modData)){
		return _getData(modData);
	}else{
		modDB.findById(modData, function(data){
			callback(_getData(data));
		});
	}
};

var _getData = function(data){
	var initData = {};
	// 补全快捷信息
	S.each(data.fields, function(f){
		// content信息
		if(f.type === 'textLink' || f.type === 'textLinkList'){
			f.content = [{
				"name": "标题",
				"key": "text",
				"type": "text"
			},{
				"name": "链接地址",
				"key": "link",
				"type": "link"
			}];
		}else if(f.type === 'imgLink' || f.type === 'imgLinkList'){
			f.content = [{
				"name": "图片地址",
				"key": "img",
				"type": "img"
			},{
				"name": "标题",
				"key": "text",
				"type": "text"
			},{
				"name": "链接地址",
				"key": "link",
				"type": "link"
			}];
		}else if(f.type === 'textList'){
			f.content = [{
				"name": "文字",
				"key": "text",
				"type": "text"
			}];
		}else if(f.type === 'product' || f.type === 'productList'){
			f.content = [{
				"name": "商品ID",
				"key": "id",
				"type": "text"
			}];
		}
		// initData信息
		if(f.content && f.content.length > 0){
			var innerData = {}
			S.each(f.content, function(c){
				innerData[c.key] = '';
			});
			if(f.type.indexOf('List') > -1){
				initData[f.key] = [innerData];
			}else{
				initData[f.key] = innerData;
			}
		}else{
			initData[f.key] = '';
		}
	});
	
	data.data = initData;
	
	return data;
}

module.exports.getList = getModuleList;
module.exports.getData = getModuleData;
