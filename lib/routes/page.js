// 页面构建路由
var express = require('express'),
	Utils = require('../tools/utils'),
	login = require('../user/login'),
	pageList = require('../page/list'),
	pageAdd = require('../page/add'),
	pageCode = require('../page/code');

var pageRouter = function(app){
	
	var router = express.Router();
	
	router.get('/', Utils.headerInfo, pageList.render);
	
	router.get('/add', login.login, Utils.headerInfo, pageAdd.render);
	router.post('/add', login.login, Utils.headerInfo, pageAdd.save);
	
	router.get('/copy/:id', login.login, Utils.headerInfo, pageAdd.copyRender);
	router.post('/copy/:id', login.login, Utils.headerInfo, pageAdd.copySave);
	
	router.get('/preview/:id', require('../page/render').render);
	router.get('/publish/:id', login.login, Utils.headerInfo, login.permission('white'), require('../page/publish').render);
	router.get('/refresh/:id', login.login, Utils.headerInfo, login.permission('white'), require('../page/publish').refresh);
	
	router.get('/remove/:id', login.login, Utils.headerInfo, login.permission('white'), pageList.remove);
	router.post('/modify/:id', login.login, Utils.headerInfo, login.permission('white'), pageList.modify);
	
	router.get('/updatemod/:id', login.login, Utils.headerInfo, login.permission('white'), require('../page/build').updateMod);
	router.get('/updateproduct/:id', login.login, Utils.headerInfo, login.permission('white'), require('../page/build').updateProduct);
	
	router.get('/fav/add/:id', login.login, Utils.headerInfo, login.permission('white'), pageList.addFav);
	router.get('/fav/remove/:id', login.login, Utils.headerInfo, login.permission('white'), pageList.removeFav);
	
	router.get('/code/:id', login.login, Utils.headerInfo, login.permission('coder'), pageCode.render);
	router.post('/code/:id', login.login, Utils.headerInfo, login.permission('coder'), pageCode.save);

	router.get('/:id', login.login, Utils.headerInfo, login.permission('white'), require('../page/build').render);
	
	app.use('/page', router);
	
};

module.exports.r = pageRouter;
