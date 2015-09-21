/**
 * @author: zheng.fuz[at]alibaba-inc.com
 * @date: 2012-07-05 14:33
 * 数据库工具集
 */

var mongodb = require('mongodb'),
	S = require('kissy').KISSY;

var DB = {},
	mongoDBManager = {};


var connectMongodb = function(dbcfg, col, callback){
	var connectCol = function(d){
		d.collection(col, function(err, _col){
			callback(_col, d);
		});
	};
	var key = null,
		db = null,
		connectStr;
	if(S.isString(dbcfg)){
		db = dbcfg;
	}else{
		key = dbcfg.key;
		db = dbcfg.db;
	}
	connectStr = 'mongodb://' + (key ? (key + '@') : '') + '127.0.0.1:27017/' + db;
	// connectStr = 'mongodb://' + (key ? (key + '@') : '') + '192.168.60.61:27017/' + db;

	if(!mongoDBManager[db]){
		mongoDBManager[db] = 'connecting';
		mongodb.MongoClient.connect(connectStr, function(err, _db) {
			mongoDBManager[db] = _db;
			connectCol(mongoDBManager[db]);
		});
	}else{
		if(mongoDBManager[db] === 'connecting'){
			var timer = setInterval(function(){
				if(mongoDBManager[db] !== 'connecting'){
					clearInterval(timer);
					connectCol(mongoDBManager[db]);
				}
			}, 1);
		}else{
			connectCol(mongoDBManager[db]);
		}
	}
};

// 根据条件做简单查询
DB.findBy = function(db, col, by, opt, callback){
	opt = opt || {};
	connectMongodb(db, col, function(_col, _db){
		_col.count(by, function(err, c){
			var list = _col.find(by, opt);
			if(list){
				list.toArray(function(err, data) {
					callback(data, c);
				});
			}else{
				callback(null, 0);
			}
		});
	});	
};

DB.findById = function(db, col, id, callback){
	if(S.isString(id)){
		id = getId(id);
	}
	connectMongodb(db, col, function(_col, _db){
		_col.find({'_id': id}).toArray(function(err, data) {
			callback(data ? (data[0] || null) : null);
		});
	});
};
DB.findByIds = function(db, col, ids, callback){
	var _idList = [];
	S.each(ids, function(d){
		if(S.isString(d)){
			d = getId(d);
		}
		_idList.push(d);
	});
	connectMongodb(db, col, function(_col, _db){
		_col.find({'_id': {'$in': _idList}}).toArray(function(err, data) {
			callback(data);
		});
	});
};


// 新增记录
DB.add = function(db, col, data, callback){
	connectMongodb(db, col, function(_col, _db){
		_col.insert(data, callback);
	});
};
// 修改记录
DB.updateBy = function(db, col, by, data, callback){
	connectMongodb(db, col, function(_col, _db){
		_col.update(by, data, {multi: true}, callback);
	});
};
DB.updateById = function(db, col, id, data, callback){
	if(S.isString(id)){
		id = getId(id);
	}
	DB.updateBy(db, col, {'_id': id}, data, callback)
};

// 删除记录
DB.removeBy = function(db, col, by, callback){
	connectMongodb(db, col, function(_col, _db){
		_col.remove(by, callback);
	});
}
DB.removeById = function(db, col, id, callback){
	if(S.isString(id)){
		id = getId(id);
	}
	DB.removeBy(db, col, {'_id': id}, callback)
}


// 获取 _id
var getId = function(id){
	var ObjectID = mongodb.ObjectID;
	return new ObjectID(id);
};
DB.getId = getId;

// 连接
DB.connect = connectMongodb;

module.exports = DB;


