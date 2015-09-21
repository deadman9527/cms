var pathModule = require("path"),
	S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	pageBase = require('./base'),
	modRender = require('../mod/render'),
	pageDB = require('../db/page');

// 页面渲染
var render = function(req, res){
	var pageId = req.params['id'];
	
	// 查询
	pageDB.findById(pageId, function(data){
		if(data && data.curStatus.id !== 'removed'){
			var html = renderPage(data),
				fileName = data.path,
				pagePath = pageBase.getPagePath(data);
			if(data.pageType === 'data'){
				var json = {};
				// 过滤掉所有注释代码
				html = filterHtml(html);
				try{
					json = JSON.parse(html);
				}catch(e){
					res.send('json格式不正确! ' + html);
					return;
				}
				UtilTools.writeJsonFile(fileName, pagePath, json, false, function(){
					res.send('<pre>' + JSON.stringify(json, null, 4) + '</pre>');
				});
			}else{
				UtilTools.writeFile(pagePath, html, function(){
					res.send(html);
				});
			}
		}else{
			res.send('页面不存在！');
		}
	});
	
};

var renderPage = function(data){
	var pageTempPath = pageBase.getTempPath(data),
		renderData;
	if(data.buildType === 'code'){
		// 代码构建
		renderData = modRender.dataAdap(data.code);
	}else{
		// 模块构建
		renderData = getRenderData(data);			
	}
	if(data.pageType === 'rgn' || data.pageType === 'data'){
		// 构建区块
		return modRender.renderWithoutTemp(renderData);
	}else{
		// 构建带模板
		return modRender.renderWithTemp(renderData, data.title, pageTempPath);
	}
};
var getRenderData = function(data){
	var renderData = {
			html: [],
			css: [],
			js: [],
			jsCombo: [],
			cssCombo: []
		},
		result = {},
		modIdList = [];
	// 模块构建
	S.each(data.modList, function(mod){
		renderData.html.push(modRender.renderHtml(mod.code.html, mod.data));
		// 防止重复加载模块资源
		if(!S.inArray(mod._id, modIdList)){
			if(mod.code.js){
				renderData.js.push(mod.code.js);
			}
			if(mod.code.css){
				renderData.css.push(mod.code.css);
			}
			if(mod.assets.js){
				renderData.jsCombo.push(mod.assets.js);
			}
			if(mod.assets.css){
				renderData.cssCombo.push(mod.assets.css);
			}
		}
		modIdList.push(mod._id);
	});
	
	result.html = renderData.html.join('');
	// 代码
	if(renderData.css.length > 0){
		result.css = renderData.css.join('');
	}
	if(renderData.js.length > 0){
		result.js = renderData.js.join('');
	}
	// combo资源
	if(renderData.jsCombo.length > 0){
		result.jsCombo = renderData.jsCombo.join(',');
	}
	if(renderData.cssCombo.length > 0){
		result.cssCombo = renderData.cssCombo.join(',');
	}
	
	return result;
};

// 过滤掉注释代码
var filterHtml = function(html){
	var startStr = '<!--',
		endStr = '-->';
	var _filterHtml = function(_html){
		var	startIndex = _html.indexOf(startStr),
			endIndex = _html.indexOf(endStr),
			list = [];
		list.push(_html.slice(0, startIndex));
		list.push(_html.slice(endIndex + endStr.length));
		return list.join('');
	};
	while(html.indexOf(startStr) > -1){
		html = _filterHtml(html);
	}
	return html;
};

module.exports.render = render;
module.exports.renderPage = renderPage;
