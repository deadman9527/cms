/**
 * 又拍云
 */

var Utils = require("./utils"),
	urlModule = require('url'),
	pathModule = require('path'),
	UpyunModule = require("upyun"),
	S = require('kissy').KISSY;

var Upyun = {},
	purgeUrl = 'http://purge.upyun.com/purge/';
	upyunImg = new UpyunModule('veimg', 'hz000002', 'hzve123456', 'v0.ftp.upyun.com'),
	imgBaseUrl = 'http://img01.ve.cn';

Upyun.uploadImg = function(filePath, imgType, dir, callback, errback){
	var fileName = filePath.slice(filePath.lastIndexOf('/') + 1),
		remotePath = '/' + dir +  '/' + fileName,
		url = imgBaseUrl + remotePath;
	// 源地址转换绝对路径
	filePath = pathModule.join(__dirname, '..', '..', filePath),
	// 上传
	upyunImg.uploadFile(remotePath, filePath, imgType, function(err, resultData){
		if(!err){
			if(resultData.statusCode === 200){
				callback(url);
			}else{
				console.log(resultData.error);
				errback(resultData.error);
			}
		}else{
			errback && errback(err);
		}
	});
};

var getPurgeAuthorization = function(url, data){
	var sign = [],
		authorization = 'UpYun vetms:hz000002:';
	
	sign.push(url);
	sign.push('vetms');
	sign.push(data);
	sign.push(Utils.md5('hzve123456'));
	
	sign = Utils.md5(sign.join('&'));
	authorization = authorization + sign;
	
	return authorization;
};

Upyun.purge = function(url, callback, errback){
	if(S.isArray(url)){
		url = url.join('\n');
	}
	var date = new Date().toGMTString(),
		authorization = getPurgeAuthorization(url, date);
	console.log(url);
	Utils.postUrl(purgeUrl, {
		'purge': url
	}, {
		'Authorization': authorization,
		'Date': date
	}, function(result){
    	try{
			result = JSON.parse(result);
			if(result['invalid_domain_of_url'] && result['invalid_domain_of_url'].length === 0){
				callback && callback();
			}else{
				errback && errback('刷新失败，请重试~');
			}
    	}catch(e){
    		errback && errback('刷新失败，请重试~');
    	}
	}, function(err){
		errback && errback(err);
	});

};

module.exports = Upyun;

