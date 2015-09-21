/**
 * 路由总入口
 */

var express = require('express'),
	Utils = require('../tools/utils'),
	login = require('../user/login'),
	imgUpload = require('../img/upload');

var imgRouter = function(app){
	
	var router = express.Router();
	
	router.get('/', login.login, Utils.headerInfo, require('../img/list').render);
	router.get('/upload', login.login, Utils.headerInfo, imgUpload.render);
	router.post('/upload', login.login, Utils.headerInfo, imgUpload.save);
	
	app.use('/img', router);
	
};

module.exports.r = imgRouter;
