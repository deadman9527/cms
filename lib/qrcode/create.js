// 图片上传
var S = require("kissy").KISSY,
	UtilTools = require('../tools/utils');

var renderPage = function(req, res){
	res.render('qrcode/create', {
		header: req.systemHeaderInfo
	});
};


module.exports.render = renderPage;
