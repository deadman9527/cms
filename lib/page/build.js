var S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	piwikDB = require('../db/piwik'),
	modBase = require('../mod/base'),
	pageDB = require('../db/page'),
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
var getDetail = function(data, userId, uId, callback){
	// 日期
	data.createDate = UtilTools.formatDate(data.createDate);
	data.curStatus.date = UtilTools.formatDate(data.curStatus.date);
	// 权限
	if(uId && ((data.owner && data.owner.uid) === uId || (data.whiteList && S.inArray(uId, data.whiteList)))){
		data.hasKey = true;
	}else{
		data.hasKey = false;
	}
	// 统计数据
	//_getPiwikInfo(data, function(){
		// 收藏
		_getFavInfo(data, userId, function(){
			callback && callback(data);
		})
	//});
};

// 获取昨日数据
var _getPiwikInfo = function(data, callback){
	var day = UtilTools.formatDate(new Date().getTime() - 1000*3600*24, 'yyyy-MM-dd');
	//var day = '2015-01-22';
	if((data.curStatus.id === 'published' || data.curStatus.id === 'editing') && (data.pageType === 'm' || data.pageType === 'pc')){
		piwikDB.getDay(data._id.toString(), day, function(d){
			data.piwik = {
				date: day,
				data: d,
				transUrl: _getTransUrl(data, day),
				evUrl: _getEvUrl(data, day)
			};
			callback && callback(data);
		});
	}else{
		callback && callback(data);
	}
};

var _getPiwikBaseUrl = function(date, search){
	var base = 'http://163.177.19.175/piwik/index.php?module=Widgetize&action=iframe&widget=1&moduleToWidgetize=Actions&actionToWidgetize=getPageUrls&idSite=1&filter_limit=5&period=day&date=';
	base = base + date;
	if(search){
		base = base + '&filter_pattern_recursive=' + search;
	}
	return base;
};

var _getPiwikPageUrl = function(data, noHost){
	var pageUrl = '',
		//path = data.path.replace('-test', '');
		path = data.path;
	if(data.pageType === 'm'){
		/*if(noHost){
			pageUrl = '/tms.php?f=' + path;
		}else{
			pageUrl = 'http://m.quxiu.me/tms.php?f=' + path;
		}*/
		if(noHost){
			pageUrl = '/m/' + path + '.html';
		}else{
			pageUrl = 'http://act.quxiu.me/m/' + path + '.html';
		}
	}else{
		if(noHost){
			pageUrl = '/pc/' + path + '.html';
		}else{
			pageUrl = 'http://act.quxiu.me/pc/' + path + '.html';
		}
	}
	return encodeURIComponent(pageUrl).replace(/%/g, '$');
};
var _getTransUrl = function(data, day){
	return _getPiwikBaseUrl(day, data.path) + '#popover=RowAction$3ATransitions$3Aurl$3A' + _getPiwikPageUrl(data);
};

var _getEvUrl = function(data, day){
	return _getPiwikBaseUrl(day, data.path) + '#popover=RowAction$3ARowEvolution$3AActions.getPageUrls$3A$7B$7D$3A$40' + _getPiwikPageUrl(data, true);
};

var _getFavInfo = function(data, userId, callback){
	if(userId){
		userDB.isFavPage(userId, data._id, function(isFav){
			data.isFav = isFav;
			callback && callback(data);
		});
	}else{
		callback && callback(data);
	}
}

// 更新页面上的所有模块的模板数据
var updateMod = function(req, res){
	var pageId = req.params['id'],
		promiseList = [];
	pageDB.findById(pageId, function(data){
		if(data && data.curStatus.id !== 'removed'){
			S.each(data.modList, function(mod){
				promiseList.push(new Promise(function(resolve, reject){
					_updateMod(mod, function(_mod){
						resolve(_mod);
					});
				}));
			});
			Promise.all(promiseList).then(function(r){
				pageDB.updateModuleList(pageId, data.modList, function(){
					res.json({
						success: true
					});
				});
			});
		}else{
			res.json({
				success: false,
				errorMsg: '页面不存在！'
			});
		}
	});
	
};

var _updateMod = function(mod, callback){
	modBase.getData(mod._id, function(data){		
		mod.name = data.name;
		mod.fields = data.fields;
		mod.assets = data.assets;
		mod.code = data.code;
		mod.render = modRender.renderWithoutTemp(modRender.dataAdap(mod));
		callback(mod);
	});
};

// 更新商品数据
var updateProduct = function(req, res){
	var pageId = req.params['id'],
		promiseList = [];
	pageDB.findById(pageId, function(data){
		if(data && data.curStatus.id !== 'removed'){
			S.each(data.modList, function(mod){
				promiseList.push(new Promise(function(resolve, reject){
					_updateProduct(mod, function(_mod){
						resolve(_mod);
					});
				}));
			});
			Promise.all(promiseList).then(function(r){
				pageDB.updateModuleList(pageId, data.modList, function(){
					res.json({
						success: true
					});
				});
			});
		}else{
			res.json({
				success: false,
				errorMsg: '页面不存在！'
			});
		}
	});
};
var _updateProduct = function(mod, callback){
	modRender.getProductData(mod, mod.data, function(){
		callback(mod);
	});
};


module.exports.render = buildPage;
module.exports.getDetail = getDetail;
module.exports.updateMod = updateMod;
module.exports.updateProduct = updateProduct;
