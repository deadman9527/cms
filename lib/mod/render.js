/* 模块渲染 */
var pathModule = require("path"),
	urlModule = require("url"),
	S = require("kissy").KISSY,
	juicer = require("juicer"),
	UtilTools = require('../tools/utils'),
	pageDB = require('../db/page'),
	modDB = require('../db/mod'),
	CleanCss = require("clean-css"),
	UglifyJS = require("uglify-js"),
	pageBase = require('../page/base');
	
var config = UtilTools.getJSONSync("config.json"),
	productDataUrl = 'http://www.api.quxiu.me/?c=deal&a=detail_list&pass_check_sign=81cca3013245942034dbcd41b6205c36&productIds=',
	comboBase = 'http://m.quxiu.me/min/?f=',
	actHost = 'http://act.quxiu.me/';
	
var FONTJUICER_REPLACE = '<!--juicer-->';

// 区块引入
var includeRgn = function(path) {
	var filePath = pathModule.join(config.buildPath, path),
		file = UtilTools.getFileSync(filePath);
	return file || '目标区块不存在！';
};
juicer.register('include', includeRgn);

// 更新模块数据（模块搭建）
// 更新页面数据（代码搭建)
// 同步数据（模块删除、模块位移）
var render = function(req, res){
	var pageId = req.body.pageId,
		// 当前编辑的模块的id（模块搭建）
		modId = req.body.modId,
		modIdAtList = req.body.modIdAtList,
		// 当前编辑的模块据（模块搭建），或页面数据（代码搭建）
		data = req.body.data,
		// 模块列表数据（同步数据）
		modList = req.body.modList,
		operator = pageBase.getUser(req);
	if(modList){
		// 同步数据
		pageDB.updateModuleList(pageId, modList, function(){
			pageBase.editingStatus(pageId, operator);
			res.json({success: true});
		});
	}else{
		// 获取模块结构
		getModData(pageId, modIdAtList, function(modData){
			// 获取商品数据
			getProductData(modData, data, function(){
				// 渲染模板
				modData.data = data;

				var html = renderWithoutTemplate(dataAdap(modData));
				// 保存数据
				savePageData(pageId, modData.id, {
					data: data,
					render: html
				}, function(){
					pageBase.editingStatus(pageId, operator);
					res.json({
						html: html,
						data: data
					});
				});
			});
		});
	} 

};

var getModData = function(pageId, modId, callback){
	var modData = null;
	pageDB.findById(pageId, function(data){
		if(modId){
			// 模块数据更新
			S.each(data.modList, function(mod){
				if(mod.id === modId){
					modData = mod;
				}
			});
		}else{
			// 整页数据更新
			modData = data.code;
		}
		callback && callback(modData);
	});
};

// 获取商品数据
var getProductData = function(modData, data, callback){
	var	productFields = [];
	// 获取商品数据
	if(modData && modData.fields){
		S.each(modData.fields, function(f){
			if(f.type === 'product' || f.type === 'productList'){
				productFields.push(f.key);
			}
		});
	}
	if(productFields.length === 0){
		callback(data);
	}else{
		UtilTools.deepDo(productFields, function(f, cback){
			_getProductData(data[f], cback);
		}, function(){}, function(){
			callback(data)
		});
	}
		
};

var _getProductData = function(data, callback){
	var _data = S.isArray(data) ? data : [data],
		ids = [];
	S.each(_data, function(d){
		ids.push(d.id);
	});
	UtilTools.getJSON(productDataUrl + ids.join(','), function(pData){
		if(pData.code === '00000' && pData.products && pData.products.length > 0){
			var pObj = {};
			S.each(pData.products, function(p, i){
				if(p){
					pObj[p.id] = p;
				}
			});
			S.each(_data, function(d){
				if(pObj[d.id]){
					S.mix(d, pObj[d.id]);
					// 加入快捷字段
					var image = "";
					if(d.images!=null){
						image = d.images[0].url;
					}
					d.quick = {
						"price": d.current_price,
						"oprice": d.origin_price,
						"discount": ((d.current_price/d.origin_price)*10).toFixed(1),
						"link": 'http://m.quxiu.me/detail.html?productId=' + d.id,
						"image": image
					}
				}
			});
		}
		callback && callback();
	});
		
};

// 保存数据
var savePageData = function(pageId, modId, data, callback){
	if(modId){
		pageDB.updateModuleData(pageId, modId, data, callback);
	}else{
		pageDB.updateData(pageId, data, callback);
	}
};

var preview = function(req, res){
	var modId = req.params['id'];
	
	modDB.findById(modId, function(data){
		if(data && data.curStatus.id !== 'removed'){
			var _data = dataAdap(data),
				html;
			if(S.inArray('mobile', data.tag)){
				html = renderWithTemplate(_data, data.name, pageBase.getTempPath({pageType:'m'}));
			}else if(S.inArray('pc', data.tag)){
				html = renderWithTemplate(_data, data.name, pageBase.getTempPath({pageType:'pc'}));
			}else{
				html = renderWithoutTemplate(_data, true);
			}
			res.send(html);
		}else{
			res.send('找不到模块！')
		}
	});
	
};

var dataAdap = function(data){
	var _data = {
		html: data.code.html,
		data: data.data
	};
	if(data.code.js){
		_data.js = data.code.js;
	}
	if(data.code.css){
		_data.css = data.code.css;
	}
	if(data.assets.js){
		_data.jsCombo = data.assets.js;
	}
	if(data.assets.css){
		_data.cssCombo = data.assets.css;
	}
	return _data;
};

// 渲染带模板的模块
var renderWithTemplate = function(data, title, tempPath){
	var template = UtilTools.getFileSync(tempPath),
		renderData = {
			title: title,
			html: data.data ? renderHtml(data.html, data.data) : data.html
		};
	if(data.js){
		try{
			renderData.js = UglifyJS.minify(data.js, {fromString: true}).code;
		}catch(e){
			renderData.js = data.js;
		}
	}
	if(data.css){
		try{
			renderData.css = new CleanCss().minify(data.css).styles;
		}catch(e){
			renderData.css = data.css;
		}
	}
	if(data.jsCombo){
		renderData.jsCombo = data.jsCombo;
	}
	if(data.cssCombo){
		renderData.cssCombo = data.cssCombo;
	}
	return renderHtml(template, renderData);
};

var renderHtml = function(html, data){
	var frontJuicer = [];
	if(html){
		// 保护需要前端渲染的模板代码
		html = _saveFrontJuicer(html, frontJuicer);
		//console.log(html);
		// 渲染
		html = juicer(html, S.merge(data, {
			replaceLeft:'<%',
			replaceRight:'%>'
		}));
		// 会写被保护的模板代码
		html = _backFrontJuicer(html, frontJuicer);
		//console.log(html);
		return html;	
	}else{
		return '';
	}
};
// 保护需要前端渲染的模板代码
var _saveFrontJuicer = function(html, fontJuicerList){
	var startStr = '<script type="text/template"',
		endStr = '</script>',
		fontJuicerList = fontJuicerList || [];
	
	var _find = function(html){
		var startIndex = html.indexOf(startStr),
			endIndex = html.indexOf(endStr, startIndex),
			fontJuicer = null;
		if(endIndex > -1){
			endIndex = endIndex + endStr.length;
		}else{
			endIndex = undefined;
		}
		fontJuicer = html.slice(startIndex, endIndex);
		fontJuicerList.push(fontJuicer);
		html = html.replace(fontJuicer, FONTJUICER_REPLACE);
		return html;
	}
	
	while(html.indexOf(startStr) > -1){
		html = _find(html);
	}

	return html;
};
// 会写需要前端渲染的模板代码
var _backFrontJuicer = function(html, fontJuicerList){
	if(fontJuicerList.length > 0){
		S.each(fontJuicerList, function(fontJuicer){
			html = html.replace(FONTJUICER_REPLACE, fontJuicer);
		});
	}
	return html;
};


// 渲染模块
var renderWithoutTemplate = function(data, useJs){
	var	renderList = [];
	// cssUrl	
	if(data.cssCombo){
		renderList.push('<link rel="stylesheet" href="http://m.quxiu.me/min/?f=' + data.cssCombo + '" media="all">');
	}
	// css
	if(data.css){
		try{
			var css = new CleanCss().minify(data.css).styles;
		}catch(e){
			var css = data.css;
		}
		renderList.push('<style>' + css + '</style>');
	}
	// html
	renderList.push(data.data ? renderHtml(data.html, data.data) : data.html);
	// js
	if(useJs){
		// jsUrl
		if(data.jsCombo){
			renderList.push('<script type="text/javascript" src="http://m.quxiu.me/min/?f=' + data.jsCombo + '"></script>');
		}
		// js
		if(data.js){
			try{
				var js = UglifyJS.minify(data.js, {fromString: true}).code;
			}catch(e){
				var js = data.js;
			}
			renderList.push('<script>' + js + '</script>');
		}
	}
	return renderList.join('');
};

module.exports.render = render;
module.exports.dataAdap = dataAdap;
module.exports.preview = preview;
module.exports.renderHtml = renderHtml;
module.exports.renderWithoutTemp = renderWithoutTemplate;
module.exports.renderWithTemp = renderWithTemplate;
module.exports.getProductData = getProductData;
