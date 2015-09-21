var S = require('kissy').KISSY,
	UtilTools = require('../tools/utils'),
	DBTools = require('../tools/db'),
	userBase = require('./base'),
	userBuild = require('./build'),
	userDB = require('../db/user'),
	Promise = require('promise');

var pageSize = 20;

var listPage = function(req, res){
	var header = req.systemHeaderInfo,
		searchObj = {
			title: req.query['q'],
			sType: req.query['type'] || 'all',
			curPage: req.query['page'] || 1
		};

	search(searchObj, function(data, count){
		var promiseList = [],
			userObj = {
				totalPage: Math.ceil(count/pageSize),
				count: count
			};
		if(data && data.length > 0 ){
			S.each(data, function(item){
				promiseList.push(new Promise(function(resolve, reject){
					userBuild.getDetail(item, function(_d){
						resolve(_d);
					})
				}));
			});
			Promise.all(promiseList).then(function(r){
				_render(req, res, data, userObj, searchObj);
			});
		}else{
			_render(req, res, [], userObj, searchObj);
		}
	});
}

var _render = function(req, res, data, user, search){
	res.render('user/list', {
		header: req.systemHeaderInfo,
		listData: data || [],
		page: user,
		search: search
	});
};

var search = function(sObj, callback){
	var by = {
			'curStatus.id': {'$ne': 'removed'}
		},
		// 查询方式
		opt = {
			skip: (sObj.curPage - 1) * pageSize,
			limit: pageSize,
			sort: {'createDate': -1}
		};

	if(sObj.title){
		by['$or'] = [{
			'name': new RegExp(sObj.title)
		}, {
			'email': new RegExp(sObj.title)
		}, {
			'uid': new RegExp(sObj.title)
		}];
	}else if(sObj.sType === 'admin' || sObj.sType === "coder"){
		by['permission'] = sObj.sType;
	}

	userDB.findBy(by, opt, function(data, c){
		callback(data, c);
	});
};

// 基本信息修改
var modifyInfo = function(req, res){
	var userId = req.params['id'],
		updateInfo = {
			password: UtilTools.md5(req.body['password'])
		};

	if(userId && updateInfo.password){
		userDB.findById(userId, function(data){
			if(data){
				// 修改页面基本信息
				userDB.updateInfo(userId, updateInfo, function(){
					res.json({
						success: true,
						errorMsg: '修改成功'
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


// 设置管理员
var setAdmin = function(req, res){
	var userId = req.params['id'],
		pms = req.query['type'] || '';
	if(userId && pms){
		userDB.findById(userId, function(data){
			if(data.permission===pms){
				pms = null;
			}
			if(data){
				userDB.updatePms(userId, pms, function(){
					res.json({
						success: true,
						errorMsg: '修改成功'
					})
				})
			}else{
				res.json({
					success: false,
					errorMsg: '原密码不正确~'
				});
			}
		});
	}else{
		res.json({
			success: false,
			errorMsg: '提交数据有误~'
		});
	}
}


// module.exports.remove = removePage;
module.exports.render = listPage;
module.exports.modify = modifyInfo;
module.exports.setAdmin = setAdmin;