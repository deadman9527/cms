/**
 * 登录
 */

var userDB = require('../db/user'),
	logout = require('./logout'),
	Utils = require('../tools/utils'),
	pageDB = require('../db/page'),
	S = require('kissy').KISSY;
	
var config = Utils.getJSONSync("config.json");

var loginPage = function(req, res){
	var	sessionUserId = req.session.user_id,
		loginData = null,
		redirectUrl = req.query['redirect'] || null;

	// 检查登录状态
	if(sessionUserId){
		// 如果是登录状态，则跳转到相应角色的工作台首页
		res.redirect('/');
	}else{
		if(req.body['userName']){
			loginData = {
				name: req.body['userName'],
				password: Utils.md5(req.body['userPassword'])
			}
		}
	
		if(!loginData){
			// 先执行退出，清空登录态
			logout.clean(req, res);			
			// 展示登录页面
			res.render('user/login', {
				'header': req.systemHeaderInfo,
				'page': {}
			});
		}else{
			// 有用户名则去登录
			login(loginData, function(r){
				if(r.success){
					// 登录成功跳转
					loginStatus(req, r);
					res.redirect(redirectUrl || '/');
				}else{
					// 登录失败回显
					res.render('user/login', {
						'header': req.systemHeaderInfo,
						'page': loginData, 
						'errMsg': r.msg
					});
				}
			});
		}
	}
};
// 统一登录
var login = function(data, callback){
	var loginBy = {
		'uid': data.name
	};
	
	userDB.findBy(loginBy, null, function(uData){
		if(uData && uData.length > 0){
			if(uData[0].password === data.password){
				callback({success: true, id: uData[0]._id.toString(), uid: uData[0].uid});
			}else{
				callback({success: false, msg: '密码不正确！'});
			}
		}else{
			callback({success: false, msg: '找不到用户！'});
		}
	});
};

// 登录成功，设置登录状态
var loginStatus = function(req, r){
	req.session.user_id = r.id;
};
// 获取用户登录信息
var getUserInfo = function(req, callback){
	var info;
	if(req.session.user_id){
		info = {
			isLogin: true,
			id: req.session.user_id
		};
		
		userDB.findById(info.id, function(uData){
			if(uData){
				info = S.merge(info, {
					uid: uData.uid,
					name: uData.name,
					email: uData.email,
					permission: uData.permission
				});
			}
			callback(info);
		});
				
	}else{
		info = {
			isLogin: false
		};
		callback(info);
	}
};

// 登录控制
var loginFilter = function(req, res, next){
	if(!req.session.user_id) {
		// 先执行退出，清空登录态
		logout.clean(req, res);
		res.redirect('/login?redirect=' + req.originalUrl);
	} else {
		next && next();
	}
};
// 权限控制
var permission = function(type){
	return function(req, res, next){
		var header = req.systemHeaderInfo,
			uId = header.uid;
		if(header.permission === 'admin' || (header.permission === 'coder' && type !== 'admin')){
			next && next();
		}else{
			// 其他用户
			if(type === 'admin' || type === 'coder'){
				res.send('对不起，您无权访问该页面~');
			}else if(type === 'white'){
				var pageId = req.params['id'];
				pageDB.findById(pageId, function(data){
					if(uId && (data.owner.uid === uId || (data.whiteList && S.inArray(uId, data.whiteList)))){
						next && next();
					}else{
						res.send('对不起，您无权访问该页面~');
					}
				});
			}else{
				next && next();
			}
		}
	}
}

module.exports.render = loginPage;
module.exports.getInfo = getUserInfo;
module.exports.login = loginFilter;
module.exports.permission = permission;
