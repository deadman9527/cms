var S = KISSY;
/**
* 从url中获取当前页码 - 用于后台同步请求，前端动态渲染分页
* @method getUrlPage
* @static
* @param {String} [key] 页码的key，默认：page
*/
var getUrlPage = function(key){
	var _self = this,
		page;
	key = key || 'page';
	page = S.unparam(window.location.search.substring(1))[key] || 1;
	return parseInt(page);
};
/**
* 通过改变url，跳到另一个页面，用于后台同步分页的页面跳转
* @method goToPage
* @static
* @param {Number} page 目标页数
* @param {String} [key] 页码的key，默认：page
*/
var goToPage = function(page, key){
	key = key || 'page';
	page =  parseInt(page);
	var url = window.location.href,
		anchor = '',
		anchorIndex = url.indexOf('#'),
		keyReg = new RegExp(key + '=\\-?\\d+&*', 'ig'),
		urlPage = getUrlPage(key);

	// 只有分页不等于1时才
	if(page === urlPage){
		return false;
	}

	// 支持锚点
	if (anchorIndex > -1) {
		anchor = url.substring(anchorIndex);
		url = url.substring(0, anchorIndex);
	}
	if (url.indexOf('?') === -1) {
		url += '?';
	}else{
		if(url.slice(-1) !== "?" && url.slice(-1) !== "&"){
			url += '&';
		}
	}
	// 去掉之前的key
	url = url.replace(keyReg, '');
	url = [url, key, '=', page, anchor].join('');
	// 页面跳转
	window.location.href = url;
};
$('.J_PageItem').on('click', function(){
	var page = $(this).attr('data-page');
	goToPage(page);
});
$('.J_PagePrevious').on('click', function(){
	var page = getUrlPage();
	if(page > 1){
		goToPage(page - 1);
	}
});
$('.J_PageNext').on('click', function(){
	var page = getUrlPage();
	if(page < $(this).attr('data-max') * 1){
		goToPage(page + 1);
	}
});
