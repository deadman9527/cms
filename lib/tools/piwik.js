/**
 * piwik
 */

var Utils = require("./utils"),
	urlModule = require('url'),
	pageDB = require('../db/page'),
	S = require('kissy').KISSY;

var token = '36fe90ab0b3ea7f76b64ec823225d68c',
	urlObj = {
		protocol: 'http',
		host: '163.177.19.175',
		pathname: '/piwik/index.php'
	},
	baseParam = {
		'module': 'API',
		'format': 'JSON',
		'idSite': '1',
		'token_auth': token
	},
	tmsBaseUrl = 'http://act.quxiu.me/',
	mPageBaseUrl = 'http://m.quxiu.me/tms.php?f=',
	Piwik = {};

// 获取页面数据
var _getDayData = function(url, day, callback, errback){
	var param = S.merge(baseParam, {
		'method': 'Actions.getPageUrl',
		'pageUrl': url,
		'period': 'day',
		'date': day || 'yesterday'
	}),
	dataUrl = urlModule.format(S.merge(urlObj, {
		query: param
	}));
	// 发起请求
	//console.log(dataUrl);
	Utils.getJSON(dataUrl, function(data){
		//console.log(data);
		if(data && data.result !== 'error' && data.length > 0){
			callback && callback(data[0]);
		}else{
			// 返回数据为空，证明没有那一天的数据，算获取数据成功
			callback && callback(null);
		}
	}, errback);
	
};
// 获取移动页面数据
var getMDayData = function(path, day, callback, errback){
	//path = path.replace('-test', '');
	var url = [tmsBaseUrl, 'm/', path + '.html'].join('');
	_getDayData(url, day, callback, errback);
	/*var url = mPageBaseUrl + path;
	_getDayData(url, day, function(data){
		if(data){
			callback && callback(data);
		}else{
			// 如果为空，则换个url 重新获取
			var _url = [tmsBaseUrl, 'm/', path + '.html'].join('');
			_getDayData(_url, day, callback, errback);
		}
	}, errback);*/
};
// 获取PC页面数据
var getPcDayData = function(path, day, callback, errback){
	var url = [tmsBaseUrl, 'pc/', path + '.html'].join('');
	_getDayData(url, day, callback, errback);
};

var getDayData = function(id, day, callback, errback){
	pageDB.findById(id, function(pdata){
		if(pdata){
			if(pdata.curStatus.id === 'published' || pdata.curStatus.id === 'editing'){
				if(pdata.pageType === 'm'){
					getMDayData(pdata.path, day, callback, errback);
				}else if(pdata.pageType === 'pc'){
					getPcDayData(pdata.path, day, callback, errback);
				}else{
					errback && errback();
				}
			}else{
				errback && errback();
			}
		}else{
			errback && errback();
		}
	});
};



module.exports.getDay = getDayData;

