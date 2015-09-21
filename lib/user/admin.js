// User base
var S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	userDB = require('../db/user');
	

var adminPage = function(req, res){
	
	userDB.findBy({'permission': 'admin'}, null, function(adminList){
		userDB.findBy({'permission': 'coder'}, null, function(coderList){
			res.render('user/admin', {
				'header': req.systemHeaderInfo,
				'page': {
					admin: adminList,
					coder: coderList
				}
			});
		});
	});



};

var updatePms = function(req, res){
	var uid = req.body['uid'],
		pms = req.params['pms'];
	if(uid && pms){
		userDB.updatePms(uid, pms, function(){
			res.redirect('/s/admin');
		});
	}else{
		res.redirect('/s/admin');
	}
};
var removePms = function(req, res){
	var uid = req.body['uid'];
	if(uid){
		userDB.updatePms(uid, null, function(){
			res.redirect('/s/admin');
		});
	}else{
		res.redirect('/s/admin');
	}
};

module.exports.render = adminPage;
module.exports.updatePms = updatePms;
module.exports.removePms = removePms;
