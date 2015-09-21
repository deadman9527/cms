var S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	modDB = require('../db/mod');

// 代码构建
var codePage = function(req, res){
	var modId = req.params['id'];
	_codePage(req, res, modId);
};

var _codePage = function(req, res, id){
	// 查询
	modDB.findById(id, function(data){
		if(data && data.curStatus.id !== 'removed'){
			var renderData = {
				header: req.systemHeaderInfo,
				modData: data,
				isPc: S.inArray('pc', data.tag)
			};
			_render(res, renderData);
		}else{
			res.send('找不到模块！');
		}
	});
};

var _render = function(res, renderData){
	res.render('mod/code', renderData);
};

var saveCode = function(req, res){
	var modId = req.params['id'],
		data = {
			config: JSON.parse(req.body['config']),
			html: req.body['html'],
			js: req.body['js'],
			css: req.body['css'],
			jsUrl: req.body['jsUrl'],
			cssUrl: req.body['cssUrl'],
			data: JSON.parse(req.body['data'])
		};

	modDB.updateData(modId, data, function(){
		/*modDB.findById(modId, function(d){
			console.log(d);
		});*/
		_codePage(req, res, modId);
	});
		
};

module.exports.render = codePage;
module.exports.save = saveCode;
