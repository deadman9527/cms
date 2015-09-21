var S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	piwikDB = require('../db/piwik'),
	modBase = require('../mod/base'),
	userDB = require('../db/user'),
	modRender = require('../mod/render'),
	Promise = require('promise');

var config = UtilTools.getJSONSync("config.json");

// 页面构建
var buildPage = function(req, res){
	var pageId = req.params['id'],
		header = req.systemHeaderInfo,
		uId = header.uid,
		userId = req.session.user_id;
	
	// 查询
	pageDB.findById(pageId, function(data){
		if(data && data.curStatus.id !== 'removed'){
			getDetail(data, userId, uId, function(){
				var renderData = {
					header: req.systemHeaderInfo,
					pageData: data,
					statusMap: pageDB.statusMap
				};
				if(data.buildType === 'code'){
					// 代码构建
					_render(req, res, data.pageType, renderData);
				}else{
					// 可视化构建
					// 获取全部模块列表
					modBase.getList(function(moduleData){
						renderData = S.merge(renderData, {
							moduleData: moduleData,
							modTagList: config.moduleTagMap
						});
						_render(req, res, data.pageType, renderData);
					});
				}
			});
		}else{
			res.send('找不到页面！');
		}
	});

};

var _render = function(req, res, pageType, renderData){
	if(pageType === 'm'){
		res.render('page/buildm', renderData);
	}else if(pageType === 'pc'){
		res.render('page/buildpc', renderData);
	}else if(pageType === 'rgn'){
		res.render('page/buildrgn', renderData);
	}else{
		res.render('page/builddata', renderData);
	}
};

// 获取页面详情
var getDetail = function(data, callback){
	// 日期
	data.createDate = UtilTools.formatDate(data.createDate);
	// data.curStatus.date = UtilTools.formatDate(data.curStatus.date);
	callback && callback(data);
};



module.exports.render = buildPage;
module.exports.getDetail = getDetail;
// module.exports.updateMod = updateMod;
// module.exports.updateProduct = updateProduct;
