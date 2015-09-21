/**
 * 退出登录
 */
var	Utils = require('../tools/utils');

var logoutPage = function(req, res){

	cleanSession(req);

    res.redirect('/login');
};

var cleanSession = function(req, res){
	req.session.user_id = null;
	// 更新头部登录信息
	Utils.headerInfo(req, res);
};

module.exports.render = logoutPage;
module.exports.clean = cleanSession;
