// Page base
var pathModule = require("path"),
	S = require("kissy").KISSY,
	UtilTools = require('../tools/utils');
	pageDB = require('../db/page');

var config = UtilTools.getJSONSync("config.json");

var getPagePath = function(data){
	var ext = getPageExt(data),
		path = pathModule.join(config.buildPath, data.pageType, data.path + ext);
	return path;
};

var getPageExt = function(data){
	return data.pageType === 'data' ? '.json' : '.html';
};

var getTemplatePath = function(data){
	if(data.pageType === 'm' || data.pageType === 'pc'){
		var fileName = data.pageType === 'm' ? 'mobile.html' : 'pc.html',
			path = pathModule.join(config.pagePath, 'template', fileName);
		return path;
	}else{
		return false;
	}
};
var getUrl = function(data){
	var ext = getPageExt(data),
		url = [
			'http://act.quxiu.me/',
			data.pageType + '/',
			data.path,
			ext
		];
	return url.join('');
};

var getUserInfo = function(req){
	var headerInfo = req.systemHeaderInfo;
	return {
		id: headerInfo.id,
		uid: headerInfo.uid,
		name: headerInfo.name,
		email: headerInfo.email
	};
};

var updateEditingStatus = function(pageId, operator){
	// 检测页面状态，若为已发布，则需改为修改中
	pageDB.findById(pageId, function(data){
		if(data && data.curStatus.id === 'published'){
			pageDB.updateStatus(pageId, 'editing', operator);
		}
	});
};

module.exports.getPagePath = getPagePath;
module.exports.getTempPath = getTemplatePath;
module.exports.getUrl = getUrl;
module.exports.getUser = getUserInfo;
module.exports.getExt = getPageExt;
module.exports.editingStatus = updateEditingStatus;
