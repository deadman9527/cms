/**
 * @author: zheng.fuz[at]alibaba-inc.com
 * @date: 2012-07-05 14:33
 * 数据库工具集
 */

var ldap = require('ldapjs'),
	S = require('kissy').KISSY;

var LDAP = {};

var bind = function(callback, errback){
	var client = ldap.createClient({
			url: 'ldap://192.168.60.65:389'
		});
	client.bind('cn=root,dc=ve,dc=cn', '341@ve.cn', function (err) {
		if(err){
			errback && errback(err.message);
		}else{
			callback && callback(client);
		}
	});

};

LDAP.search = function(dn, doFunc, callback, errback){
	bind(function(client){
		client.search(dn, {scope: 'sub'}, function (err, search) {
			if(err){
				errback && errback(err.message);
			}else{
				search.on('searchEntry', function(entry) {
					doFunc(entry.object);
				});
				search.on('error', function(err) {
					errback && errback(err.message);
				});
				search.on('end', function(result) {
					callback && callback();
				}); 
			}
		});
	});
};



module.exports = LDAP;


