var S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	pageDB = require('../db/page'),
	pageBase = require('./base');

// 页面构建
var addPage = function(req, res){
	res.render('page/add', {
		header: req.systemHeaderInfo
	});
};
// 保存构建信息，开始构建
var saveAddPage = function(req, res){
	var buildData = {
			title: UtilTools.formatInput(req.body['title']),
			name: UtilTools.formatInput(req.body['name']),
			path: UtilTools.formatInput(req.body['path']),
			pageType: UtilTools.formatInput(req.body['pageType']),
			buildType: UtilTools.formatInput(req.body['buildType'])
		},
		headerInfo = req.systemHeaderInfo;
	// 检验是否路径重复
	pageDB.findBy({
		'path': buildData.path,
		'curStatus.id': {'$ne': 'removed'}
	}, null, function(data){
		if(data && data.length > 0){
			// 路径存在
			res.render('page/add', {
				header: headerInfo,
				buildData: buildData,
				errorMsg: '线上地址路径已存在，请重新填写~'
			});
		}else{
			// 加入作者信息
			buildData.owner = pageBase.getUser(req);
			// 添加页面
			pageDB.add(buildData, function(newPage){
				res.redirect('/page/' + newPage._id.toString());
			});
		}
	});
	
};

var copyPage = function(req, res){
	var pageId = req.params['id'];
	pageDB.findById(pageId, function(data){
		if(data && data.curStatus.id !== 'removed'){
			res.render('page/add', {
				header: req.systemHeaderInfo,
				pageData: data,
				typeMap: pageDB.typeMap,
				buildMap: pageDB.buildMap
			});
		}else{
			res.send('页面不存在！');
		}
	});

};

var saveCopyPage = function(req, res){
	var pageId = req.params['id'],
		buildData = {
			title: UtilTools.formatInput(req.body['title']),
			name: UtilTools.formatInput(req.body['name']),
			path: UtilTools.formatInput(req.body['path']),
			pageType: UtilTools.formatInput(req.body['pageType']),
			buildType: UtilTools.formatInput(req.body['buildType'])
		},
		headerInfo = req.systemHeaderInfo;
		
	pageDB.findById(pageId, function(pageData){
		if(pageData && pageData.curStatus.id !== 'removed'){
			// 检验是否路径重复
			pageDB.findBy({
				'path': buildData.path,
				'curStatus.id': {'$ne': 'removed'}
			}, null, function(data){
				if(data && data.length > 0){
					// 路径存在
					res.render('page/add', {
						header: headerInfo,
						buildData: buildData,
						pageData: pageData,
						typeMap: pageDB.typeMap,
						buildMap: pageDB.buildMap,
						errorMsg: '线上地址路径已存在，请重新填写~'
					});
				}else{
					// 加入作者信息
					buildData.owner = pageBase.getUser(req);
					// 复制页面
					pageDB.copy(pageId, buildData, function(newPage){
						res.redirect('/page/' + newPage._id.toString());
					});
				}
			});

		}else{
			res.send('页面不存在！');
		}
	});
	
};

module.exports.render = addPage;
module.exports.save = saveAddPage;
module.exports.copyRender = copyPage;
module.exports.copySave = saveCopyPage;
