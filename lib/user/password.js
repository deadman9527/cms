var S = require('kissy').KISSY,
	UtilTools = require('../tools/utils'),
	DBTools = require('../tools/db'),
	userBase = require('./base'),
	userBuild = require('./build'),
	userDB = require('../db/user'),
	Promise = require('promise');

var passwordPage = function(req, res){
	res.render('user/password', {
		header: req.systemHeaderInfo
	})
}

var modifyPsw = function(req, res){
	var userId = req.session.user_id,
		updateInfo = {
			password: UtilTools.md5(req.body['password']),
			newpassword: UtilTools.md5(req.body['newpassword']),
			repassword: UtilTools.md5(req.body['repassword'])
		};
	if(updateInfo.newpassword !== updateInfo.repassword){
		res.json({
			success:false,
			errorMsg:"两次密码输入不一致"
		})
		return false;
	}
	if(userId && updateInfo.password){
		userDB.findById(userId, function(data){
			if(data){
				if(data.password === updateInfo.password){
					userDB.updatePassword(userId, updateInfo.newpassword, function(){
						res.json({
							success: true
						})
					})
				}else{
					res.json({
						success: false,
						errorMsg: '原密码不正确~'
					});
				}
			}else{
				res.json({
					success: false,
					errorMsg: '用户不存在~'
				});
			}
		})
	}else{
		res.json({
			success: false,
			errorMsg: '提交数据有误~'
		});
	}
}


module.exports.render = passwordPage;
module.exports.modifyPassword = modifyPsw;