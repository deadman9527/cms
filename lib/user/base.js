// User base
var S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	userDB = require('../db/user');
	

var initUser = function(req, res){

	userDB.refresh(function(){
		userDB.findBy({}, null, function(data){
			res.json({
				success: true,
				data: data
			});
		});
	}, function(){
		res.json({
			success: false
		});
	});

};

module.exports.init = initUser;
