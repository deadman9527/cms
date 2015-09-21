var S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	DBTools = require('../tools/db'),
	pageBase = require('../page/base'),
	modDB = require('../db/mod'),
	userDB = require('../db/user'),
	Promise = require('promise');


var pageSize = 20;

// 页面列表
var listPage = function(req, res){
	var userId = req.session.user_id,
		searchObj = {
			title: req.query['q'],
			sType: req.query['type'] || 'all',
			curPage: req.query['page'] || 1
		};
		
	search(searchObj, userId, function(data, count){
		var promiseList = [],
			pageObj = {
				totalPage: Math.ceil(count/pageSize),
				count: count
			};
		if(data && data.length > 0){
			S.each(data, function(item){
				promiseList.push(new Promise(function(resolve, reject){
					getDetail(item, userId, function(_d){
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
	res.render('mod/list', {
		header: req.systemHeaderInfo,
		listData: data || [],
		page: page,
		search: search
	});
};

var search = function(sObj, userId, callback){
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
			idList = uData.favMod;
			S.each(idList, function(id, i){
				idList[i] = DBTools.getId(id);
			});
			
			by['_id'] = {'$in': idList};
			
			modDB.findBy(by, opt, function(data, c){
				callback(data, c);
			});
		});
	}else{
		if(sObj.title){
			by['name'] = new RegExp(sObj.title);
		}else if(sObj.sType === 'mine' && userId){
			by['owner.id'] = userId;
		}
	
		modDB.findBy(by, opt, function(data, c){
			callback(data, c);
		});
	}
	
};


// 删除模块
var removeMod = function(req, res){
	var modId = req.params['id'];

	// 删除数据
	modDB.removeSoft(modId, function(){
		res.json({
			success: true
		});
	});
};

// 收藏
var addFav = function(req, res){
	var modId = req.params['id'],
		userId = req.session.user_id;
	if(modId && userId){
		userDB.addModFav(userId, modId, function(){
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
	var modId = req.params['id'],
		userId = req.session.user_id;
	if(modId && userId){
		userDB.removeModFav(userId, modId, function(){
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

var getDetail = function(data, userId, callback){
	data.createDate = UtilTools.formatDate(data.createDate);
	if(userId){
		userDB.isFavMod(userId, data._id, function(isFav){
			data.isFav = isFav;
			callback && callback(data);
		});
	}else{
		callback && callback(data);
	}
};


module.exports.remove = removeMod;
module.exports.render = listPage;
module.exports.addFav = addFav;
module.exports.removeFav = removeFav;
