/**
 * 二维码
 */

var Utils = require("./utils"),
	qr = require('qr-image'),
	Upyun = require("./upyun"),
	pathModule = require('path'),
	S = require('kissy').KISSY;

var QRcode = {},
	LEVEL_MAP = ['L', 'M', 'Q', 'H'],
	IMG_TYPE = 'png';
	config = Utils.getJSONSync("config.json"),
	imgBasePath = pathModule.join(config.buildPath, 'img');

QRcode.imgType = IMG_TYPE;

QRcode.createImg = function(text, size, margin, level){
	size = size ? size * 1 : 5;
	level = level || 'M';
	margin = margin ? margin * 1 : 1;
	if(!text){
		return 'no content~';
	}
	if(isNaN(size)){
		return 'error size~';
	}
	if(isNaN(margin)){
		return 'error margin~';
	}
	if(!S.inArray(level, LEVEL_MAP)){
		return 'error level~';
	}
	var img = qr.image(text, {
		type: IMG_TYPE,
		ec_level: level,
		size: size,
		margin: margin
	});
	return img;
};

QRcode.getImgPath = function(){
	var imgName = Utils.randomCode(32) + '.' + IMG_TYPE,
		imgPath = pathModule.join(imgBasePath, imgName);
	return imgPath;
};

module.exports = QRcode;

