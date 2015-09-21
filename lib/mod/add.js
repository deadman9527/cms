var S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	modDB = require('../db/mod'),
	pageBase = require('../page/base');
	
// 模块构建
var addPage = function(req, res){
	res.render('mod/add', {
		header: req.systemHeaderInfo
	});
};

// 保存构建信息，开始构建
var saveAddPage = function(req, res){
	var modId = req.body['id'],
		data = {
			name: UtilTools.formatInput(req.body['title']),
			tag: req.body['tagList'].split(','),
			owner: pageBase.getUser(req)
		};

	if(modId){
		// 修改页面
		modDB.updateInfo(modId, data, function(){
			res.redirect('/mod');
		});
	}else{
		// 添加页面
		modDB.add(data, function(newMod){
			res.redirect('/mod/code/' + newMod._id.toString());
		});
	}
	
};

// 模块修改
var modifyPage = function(req, res){
	var modId = req.params['id'];
	modDB.findById(modId, function(data){
		if(data && data.curStatus.id !== 'removed'){
			res.render('mod/add', {
				header: req.systemHeaderInfo,
				modData: data
			});
		}else{
			res.send('找不到页面！');
		}
	});
};


module.exports.render = addPage;
module.exports.save = saveAddPage;
module.exports.modify = modifyPage;
