var pathModule = require("path"),
	S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	fs = require('fs'),
	qiniu = require("qiniu"),
	pageBase = require('./base'),
	pageDB = require('../db/page');


qiniu.conf.ACCESS_KEY = "XuU0iIbToWDtxAnjurk6iGqrXa82RKUl_FjILRc7";
qiniu.conf.SECRET_KEY = "qcf0CesyDgjtOQO6tPLzzjPoPfcs6RLwaYN5DJC6";

// 实例化带授权的 HTTP Client 对象
var bucketName = "quxiu-act";
var imgBaseUrl = 'http://act.quxiu.me/';

// 页面发布
var publishPage = function(req, res){
	var pageId = req.params['id'];
	
	pageDB.findById(pageId, function(data){
		if(data && data.curStatus.id !== 'removed'){
			var pagePath = pathModule.join(__dirname, '..', '..', pageBase.getPagePath(data)),
				ext = pageBase.getExt(data),
				remotePath = [
					data.pageType + '/',
					data.path, 
					ext
				].join(''),
				contentType = data.pageType === 'data' ? 'application/json' : 'text/html';
			// 上传
			var key = remotePath;
			var putPolicy = new qiniu.rs.PutPolicy(bucketName+":"+key);
			var uptoken = putPolicy.token();
			var extra = new qiniu.io.PutExtra(bucketName);

			// 判断文件是否存在
			// var client = new qiniu.rs.Client();
			// client.stat(bucketName, key, function(err, ret) {
		 	//  		if (!err) {
		  			
		 	//  		}else{
			//     	console.log(err);
			//   	}
			// });
			qiniu.io.putFile(uptoken, key, pagePath, extra, function(err, ret) {
			    if(!err) {
					// 上传成功， 处理返回值
					console.log(ret.key, ret.hash);
					// 更改页面状态
					pageDB.updateStatus(data._id, 'published', pageBase.getUser(req), function(){
						var pageUrl = pageBase.getUrl(data);
						// 刷新缓存
						// UpyunTools.purge(pageUrl, function(){
						// 	res.json({
						// 		success: true,
						// 		url: pageUrl
						// 	});
						// });
					});
					res.json({
						success: true,
						msg: "发布成功！"
					});
			    } else {
					// 上传失败， 处理返回代码
					console.log(err);
					res.json({
						success: false,
						errorMsg: err
					});
					// http://developer.qiniu.com/docs/v6/api/reference/codes.html
			    }
			});

			if(data.pageType === "data"){
				var putPolicy = new qiniu.rs.PutPolicy(bucketName+":"+key+"p");
				var uptoken = putPolicy.token();
				var extra = new qiniu.io.PutExtra(bucketName);
				// contentType = "application/jsonp";
				qiniu.io.putFile(uptoken, key+"p", pagePath+"p", extra, function(err, ret) {
				    if(!err) {
						// 上传成功， 处理返回值
						console.log(ret.key, ret.hash);
						// 更改页面状态
						pageDB.updateStatus(data._id, 'published', pageBase.getUser(req), function(){
							var pageUrl = pageBase.getUrl(data);
							// 刷新缓存
							// UpyunTools.purge(pageUrl, function(){
							// 	res.json({
							// 		success: true,
							// 		url: pageUrl
							// 	});
							// });
						});
				    } else {
						// 上传失败， 处理返回代码
						console.log(err);
						res.json({
							success: false,
							errorMsg: err
						});
						// http://developer.qiniu.com/docs/v6/api/reference/codes.html
				    }
				});
			}
		}else{
			res.json({
				success: false,
				errorMsg: '页面不存在！'
			});
		}
		
	});

};

// 页面刷新
var refreshPage = function(req, res){
	var pageId = req.params['id'];
	
	pageDB.findById(pageId, function(data){
		if(data && data.curStatus.id !== 'removed'){
			var pageUrl = pageBase.getUrl(data),
				cmdFile = process.cwd() + '/refresh',
				op = process.platform,
				opCmd = "",
				cmdStr = "";
			if(op === "linux"){
				cmdFile += ".sh";
				opCmd = "sh "+ cmdFile;
				cmdStr = "qrsctl login root@quxiu.me 018@qx.com\nqrsctl cdn/refresh quxiu-act " + pageUrl;
			}else{
				cmdFile += ".cmd";
				opCmd = "call " + cmdFile;
				cmdStr = "qrsctl login root@quxiu.me 018@qx.com\r\nqrsctl cdn/refresh quxiu-act " + pageUrl;
			}
			// console.log(pageUrl);
			// console.log(cmdFile);
			// console.log(cmdStr);
			// console.log("op="+op);
			fs.writeFile(cmdFile, cmdStr, function (err) {
				if(err){
					throw err;
					res.json({
						success: false,
						msg: '刷新缓存失败！请联系技术支持！'
					});
				}else{
					var exec = require('child_process').exec;
					exec(opCmd, function (error, stdout, stderr) {
						if (error !== null) {
							console.log('exec error: ' + error);
						}else{
							console.log('refresh page ==> ' + pageUrl)
							console.log('====the cmd=======================\n' + cmdStr + '\n==================================');
							res.json({
								success: true,
								msg: '刷新缓存成功！'
							});
						}
					});
				}
			}); 
		}else{
			res.json({
				success: false,
				msg: '页面不存在！'
			});
		}
	});
};


module.exports.render = publishPage;
module.exports.refresh = refreshPage;
