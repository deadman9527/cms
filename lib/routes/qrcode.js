/**
 * 路由总入口
 */

var express = require('express'),
	Utils = require('../tools/utils'),
	login = require('../user/login'),
	getQr = require('../qrcode/get');

var qrcodeRouter = function(app){
	
	var router = express.Router();
	
	router.get('/', login.login, Utils.headerInfo, require('../qrcode/list').render);
	router.get('/create', login.login, Utils.headerInfo, require('../qrcode/create').render);
	router.get('/img', getQr.img);
	router.get('/url', login.login, Utils.headerInfo, getQr.url);
	
	app.use('/qrcode', router);
	
};

module.exports.r = qrcodeRouter;
