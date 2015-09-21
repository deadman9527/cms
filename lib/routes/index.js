/**
 * 路由总入口
 */

var express = require('express'),
	Utils = require('../tools/utils'),
	login = require('../user/login'),
	UAParser = require('ua-parser-js');

var bindRoutes = function(app){
	
	rootRouter(app);
	require('./page').r(app);
	require('./mod').r(app);
	require('./img').r(app);
	require('./qrcode').r(app);
	require('./s').r(app);
	
};

var rootRouter = function(app){
	var router = express.Router();
	// 首页
	router.get('/', Utils.headerInfo, require('../page/list').render);
	// 登录
	router.all('/login', Utils.headerInfo, require('../user/login').render);
	// 登出
	router.get('/logout', require('../user/logout').render);
	// 文档
	router.get('/doc/:file', Utils.headerInfo, require('../root/doc').render);

	app.use('/', router);
};

module.exports.bind = bindRoutes;
