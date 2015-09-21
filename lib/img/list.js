var S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	imgDB = require('../db/img');

var pageSize = 20;

// 页面列表
var listPage = function(req, res){
	var userId = req.session.user_id,
		searchObj = {
			userId: userId,
			curPage: req.query['page'] || 1
		};
		
	search(searchObj, userId, function(data, count){
		var pageObj = {
				totalPage: Math.ceil(count/pageSize),
				count: count
			};
			
		res.render('img/list', {
			header: req.systemHeaderInfo,
			listData: data || [],
			page: pageObj,
			search: searchObj
		});

	});
	
};

var search = function(sObj, userId, callback){
	var by = {
			'owner.id': userId,
			'type': {'$ne': 'qrcode'}
		},
		// 查询方式
		opt = {
			skip: (sObj.curPage - 1) * pageSize,
			limit: pageSize,
			sort: {'createDate': -1}
		};
	
	imgDB.findBy(by, opt, function(data, c){
		callback(data, c);
	});
	
};

module.exports.render = listPage;
