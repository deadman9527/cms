// 模块路由
var express = require('express'),
	Utils = require('../tools/utils'),
	login = require('../user/login'),
	modList = require('../mod/list');
	modAdd = require('../mod/add');
	modCode = require('../mod/code');

var modRouter = function(app){
	
	var router = express.Router();
		
	router.get('/', login.login, Utils.headerInfo, login.permission('coder'), modList.render);
	
	router.get('/add', login.login, Utils.headerInfo, login.permission('coder'), modAdd.render);
	router.post('/add', login.login, Utils.headerInfo, login.permission('coder'), modAdd.save);
	router.get('/modify/:id', login.login, Utils.headerInfo, login.permission('coder'), modAdd.modify);
	
	router.get('/preview/:id', require('../mod/render').preview);
	router.get('/remove/:id', login.login, Utils.headerInfo, login.permission('coder'), modList.remove);
	
	
	router.get('/fav/add/:id', login.login, Utils.headerInfo, login.permission('coder'), modList.addFav);
	router.get('/fav/remove/:id', login.login, Utils.headerInfo, login.permission('coder'), modList.removeFav);
	
	router.get('/code/:id', login.login, Utils.headerInfo, login.permission('coder'), modCode.render);
	router.post('/code/:id', login.login, Utils.headerInfo, login.permission('coder'), modCode.save);
		
	router.get('/datatemp/:id', login.login, require('../mod/datatemp').render);
	router.post('/render', login.login, Utils.headerInfo, require('../mod/render').render);
		
	app.use('/mod', router);
	
};

module.exports.r = modRouter;
