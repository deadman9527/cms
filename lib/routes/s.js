// 系统级路由
var express = require('express'),
	Utils = require('../tools/utils'),
	GitTools = require('../tools/git'),
	adminPage = require('../user/admin'),
	userList = require('../user/list'),
	userPassword = require('../user/password'),
	login = require('../user/login');

var config = Utils.getJSONSync("config.json");

var systemRouter = function(app){
	
	var router = express.Router();
	// 更新cms
	router.all('/update', function(req, res){
		var ref = req.body['ref'];
		// 只接受master的推送
		if(ref && ref.indexOf('heads/master') > -1){
			Utils.exec('git pull', function(){
				res.json({success: true});
			});
		}else{
			res.json({success: false});
		}
	});
	// 更新页面模板
	router.all('/update/pagetemp', function(req, res){
		GitTools.pull(config.pagePath, function(){
			res.json({success: true});
		});
	});
	// 同步用户
	router.all('/update/user', require('../user/base').init);
	
	// 管理员
	router.get('/admin', login.login, Utils.headerInfo, login.permission('admin'), adminPage.render);
	router.post('/admin/pms/update/:pms', login.login, Utils.headerInfo, login.permission('admin'), adminPage.updatePms);
	router.post('/admin/pms/remove', login.login, Utils.headerInfo, login.permission('admin'), adminPage.removePms);
		

	// 用户管理
	router.get('/list', login.login, Utils.headerInfo, login.permission('admin'), userList.render);
	router.get('/user/set/:id', login.login, Utils.headerInfo, login.permission('admin'), userList.setAdmin);
	router.post('/user/modify/:id', login.login, Utils.headerInfo, login.permission('admin'), userList.modify);
	router.get('/password', login.login, Utils.headerInfo, login.permission('admin'), userPassword.render);
	router.post('/password/update', login.login, Utils.headerInfo, login.permission('admin'), userPassword.modifyPassword);


	app.use('/s', router);
	
};

module.exports.r = systemRouter;
