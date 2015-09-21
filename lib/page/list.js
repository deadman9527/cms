var S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	DBTools = require('../tools/db'),
	pageBase = require('./base'),
	pageBuild = require('./build'),
	pageDB = require('../db/page'),
	userDB = require('../db/user'),
	Promise = require('promise');


var pageSize = 20;

// 页面列表
var listPage = function(req, res){
	var userId = req.session.user_id,
		header = req.systemHeaderInfo,
		uId = header.uid,
		searchObj = {
			title: req.query['q'],
			sType: req.query['type'] || 'all',
			curPage: req.query['page'] || 1
		};
		
	search(searchObj, userId, uId, function(data, count){
		var promiseList = [],
			pageObj = {
				statusMap: pageDB.statusMap,
				typeMap: pageDB.typeMap,
				totalPage: Math.ceil(count/pageSize),
				count: count
			};
		if(data && data.length > 0){
			S.each(data, function(item){
				promiseList.push(new Promise(function(resolve, reject){
					pageBuild.getDetail(item, userId, uId, function(_d){
						resolve(_d);
					});
				}));
			});
			Promise.all(promiseList).then(function(r){
				_render(req, res, data, pageObj, searchObj);
			});
		}else{
			_render(req, res, [], pageObj, searchObj);
		}

	});
	
};

var _render = function(req, res, data, page, search){
	res.render('page/list', {
		header: req.systemHeaderInfo,
		listData: data || [],
		page: page,
		search: search
	});
};

var search = function(sObj, userId, uId, callback){
	var by = {
			'curStatus.id': {'$ne': 'removed'}
		},
		// 查询方式
		opt = {
			skip: (sObj.curPage - 1) * pageSize,
			limit: pageSize,
			sort: {'createDate': -1}
		};
	
	if(sObj.sType === 'fav' && userId){
		var idList = [];
		userDB.findById(userId, function(uData){
			idList = uData.favPage;
			S.each(idList, function(id, i){
				idList[i] = DBTools.getId(id);
			});
			
			by['_id'] = {'$in': idList};
			
			pageDB.findBy(by, opt, function(data, c){
				callback(data, c);
			});
		});
	}else{
		if(sObj.title){
			by['$or'] = [{
				'title': new RegExp(sObj.title)
			}, {
				'name': new RegExp(sObj.title)
			}, {
				'path': new RegExp(sObj.title)
			}, {
				'owner.name': new RegExp(sObj.title)
			}];
		}else if(sObj.sType === 'mine' && userId){
			by['owner.id'] = userId;
		}else if(sObj.sType === 'key' && uId && userId){
			by['$or'] = [{
				'owner.id': userId
			}, {
				'whiteList': uId
			}];
		}else if(sObj.sType && sObj.sType !== 'all'){
			by['pageType'] = sObj.sType;
		}
		pageDB.findBy(by, opt, function(data, c){
			callback(data, c);
		});
	}
	
};

// 删除页面
var removePage = function(req, res){
	var pageId = req.params['id'];
	// 检测页面状态，只有新页面能删除
	pageDB.findById(pageId, function(data){
		if(data && data.curStatus.id !== 'removed'){
			//if(data.curStatus.id === 'new'){
				// 删除已经构建的页面
				UtilTools.deletePathSync(pageBase.getPagePath(data));
				// 删除页面数据
				pageDB.removeSoft(pageId, pageBase.getUser(req), function(){
					res.json({
						success: true
					});
				});
			/*}else{
				res.json({
					success: false,
					errorMsg: '页面已发布，不能删除！'
				});
			}*/
		}else{
			res.json({
				success: false,
				errorMsg: '页面不存在！'
			});
		}
	});
};

// 基本信息修改
var modifyInfo = function(req, res){
	var pageId = req.params['id'],
		operator = pageBase.getUser(req),
		updateInfo = {
			title: req.body['title'],
			name: req.body['name'],
			whiteList: req.body['white']
		};
	if(pageId && updateInfo.title){
		pageDB.findById(pageId, function(data){
			if(data){
				// 如果没有owner, 就确定当前操作人为owner
				if(!data.owner || !data.owner.uid){
					updateInfo.owner = operator;
				}
				// 修改页面基本信息
				pageDB.updateInfo(pageId, updateInfo, function(){
					res.json({
						success: true
					});
				});
			}else{
				res.json({
					success: false,
					errorMsg: '找不到页面~'
				});
			}
		});
	}else{
		res.json({
			success: false,
			errorMsg: '提交数据有误~'
		});
	}
	
};

// 收藏
var addFav = function(req, res){
	var pageId = req.params['id'],
		userId = req.session.user_id;
	if(pageId && userId){
		userDB.addPageFav(userId, pageId, function(){
			res.json({
				success: true
			});
		}, function(err){
			res.json({
				success: false,
				errorMsg: err.err
			});
		});
	}else{
		res.json({
			success: false,
			errorMsg: '参数不正确~'
		});
	}	
};
var removeFav = function(req, res){
	var pageId = req.params['id'],
		userId = req.session.user_id;
	if(pageId && userId){
		userDB.removePageFav(userId, pageId, function(){
			res.json({
				success: true
			});
		}, function(err){
			res.json({
				success: false,
				errorMsg: err.err
			});
		});
	}else{
		res.json({
			success: false,
			errorMsg: '参数不正确~'
		});
	}	
	
};

module.exports.remove = removePage;
module.exports.render = listPage;
module.exports.modify = modifyInfo;
module.exports.addFav = addFav;
module.exports.removeFav = removeFav;
