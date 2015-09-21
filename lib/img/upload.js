// 图片上传
var S = require("kissy").KISSY,
	qiniu = require("qiniu"),
	pathModule = require("path"),
	pageBase = require('../page/base'),
	imgDB = require('../db/img'),
	UtilTools = require('../tools/utils'),
	imgSize = require('image-size');

qiniu.conf.ACCESS_KEY = "bNjF-cHiPqTFqu_rO9EK81gnKHFsvmML25myqes5";
qiniu.conf.SECRET_KEY = "6iy350G-a8nqtild72PeI4Y5kU1ywuuhw36zWSgZ";

// 实例化带授权的 HTTP Client 对象
var bucket = "quxiu-imgcms";

var putPolicy = new qiniu.rs.PutPolicy(bucket);
putPolicy.expires = 31536000;
var token = putPolicy.token();
var imgBaseUrl = 'http://imgcms.quxiu.me/';

var renderPage = function(req, res){
	res.render('img/upload', {
		header: req.systemHeaderInfo
	});
};

var saveImg = function(req, res){
	var fileObj = req.files && req.files['file'],
		owner = pageBase.getUser(req);
	if(S.isArray(fileObj)){
		fileObj = fileObj[0];
	}
	if(fileObj){
		// 检测图片大小
		var result = maxSize(fileObj);
		if(result.success){
			// 上传
			_upload(fileObj, function(url){
				// 数据库存储
				imgDB.add({
					url: url,
					name: fileObj.name,
					type: 'img',
					owner: owner
				}, function(){
					_render(req, res, {
						success: true,
						url: url
					}, fileObj);
				});
			}, function(err){
				_render(req, res, {
					success: false,
					error: err
				}, fileObj);
			});
		}else{
			_render(req, res, {
				success: false,
				error: result.max ? '图片过大，不能超过' + (result.max/1024).toFixed(1) + 'KB，上传失败~' : '图片损坏，上传失败~',
				max: result.max
			}, fileObj);
		}
	}else{
		_render(req, res, {
			success: false,
			error: '上传失败，请重试~'
		});
	}
};

var _render = function(req, res, result, fileObj){
	if(fileObj && fileObj.path){
		// 删除本地文件
		UtilTools.deletePathSync(fileObj.path);
	}
	res.json(result);
};

var maxSize = function(fileObj){
	var fileSize = fileObj.size,
		size,
		max;
	try{ 
		size = imgSize(fileObj.path)
	}catch(e){
		return {
			success: false,
			error: e.message
		}
	}
	max = (size.width * size.height * 0.4/1024 + 2) * 1024;
	if(fileSize > max){
		return {
			success: false,
			max: max
		};
	}else{
		return {
			success: true
		};
	}
};

var randomString = function(len) {
　　len = len || 32;
　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
　　var maxPos = $chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}

var _upload = function(fileObj, callback, errback){
	var descPath = fileObj.path,
		imgType = fileObj.type;

	var extra = new qiniu.io.PutExtra(bucket);
	var extname = pathModule.extname(descPath);
	var key = 'party/' + randomString(32) + extname;
	qiniu.io.putFile(token, key, descPath, extra, function(err, ret) {
	    if(!err) {
			// 上传成功， 处理返回值
			callback(imgBaseUrl + ret.key);
			console.log(ret.key, ret.hash);
			// ret.key & ret.hash
	    } else {
			// 上传失败， 处理返回代码
			console.log(err);
			// http://developer.qiniu.com/docs/v6/api/reference/codes.html
	    }
	});
};

module.exports.render = renderPage;
module.exports.save = saveImg;
