// 图片上传
var S = require("kissy").KISSY,
	Upyun = require("../tools/upyun"),
	QRcode = require("../tools/qrcode"),
	pathModule = require('path'),
	imgDB = require('../db/img'),
	pageBase = require('../page/base'),
	UtilTools = require('../tools/utils');

var getImg = function(req, res){
	var img = _getImg(req);
		
	if(S.isString(img)){
		res.send(img);
	}else{
		img.pipe(res);
	}
};
var _getImg = function(req){
	var content = req.query['c'],
		size = req.query['s'],
		level = req.query['l'],
		margin = req.query['m'];
	return QRcode.createImg(content, size, margin, level);
};


var getUrl = function(req, res){
	var img = _getImg(req),
		owner = pageBase.getUser(req);
		
	if(S.isString(img)){
		res.json({
			success: false,
			err: img
		});
	}else{
		// 图片暂存
		_saveImg(img, function(imgPath){
			// 图片上传
			_uploadImg(imgPath, function(url){
				// 数据存储
				imgDB.add({
					url: url,
					name: req.query['c'],
					type: 'qrcode',
					owner: owner
				}, function(){
					// 删除暂存图片
					_rmImg(imgPath);
					res.json({
						success: true,
						url: url
					});
				});
			}, function(err){
				// 删除暂存图片
				_rmImg(imgPath);
				res.json({
					success: false,
					err: err
				});
			});	
		});
	}
};
// 图片暂存
var _saveImg = function(img, callback){
	var imgPath = QRcode.getImgPath();
	UtilTools.writeStream(img, imgPath, function(){
		callback(imgPath);
	});
};
// 图片上传
var _uploadImg = function(imgPath, callback, errback){
	Upyun.uploadImg(imgPath, 'image/' + QRcode.imgType, 'qrcode', callback, errback);
};
// 删除暂存图片
var _rmImg = function(imgPath){
	//UtilTools.deletePathSync(imgPath);
}

module.exports.img = getImg;
module.exports.url = getUrl;
