var S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	modBase = require('../mod/base'),
	pageBase = require('../page/base'),
	pageDB = require('../db/page');

// 代码构建
var codePage = function(req, res){
	var pageId = req.params['id'];
	_codePage(req, res, pageId);
};

var _codePage = function(req, res, id){
	// 查询
	pageDB.findById(id, function(data){
		if(data && data.curStatus.id !== 'removed'){
			var renderData = {
				header: req.systemHeaderInfo,
				pageData: data
			};
			_render(res, renderData);
		}else{
			res.send('找不到模块！');
		}
	});
};

var _render = function(res, renderData){
	res.render('page/code', renderData);
};

var saveCode = function(req, res){
	var pageId = req.params['id'],
		operator = pageBase.getUser(req);
		data = {
			fields: JSON.parse(req.body['config']),
			html: req.body['html']
		};
	// 补全数据
	modBase.getData(data);
	if(req.body['js']){
		data = S.merge(data, {
			js: req.body['js'],
			css: req.body['css'],
			jsUrl: req.body['jsUrl'],
			cssUrl: req.body['cssUrl']
		});
	}
	pageDB.updateCode(pageId, data, function(){
		/*pageDB.findById(pageId, function(d){
			console.log(d);
		});*/
		pageBase.editingStatus(pageId, operator);
		_codePage(req, res, pageId);
	});
		
};

module.exports.render = codePage;
module.exports.save = saveCode;
