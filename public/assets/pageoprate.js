$('.J_PopupQCode').popover({
	html: true,
	content: function(){
		return '<img width="200" src="' + $(this).attr('data-qcode') + '"/>';
	},
	trigger: 'focus',
	placement: 'bottom',
	container: 'body'
});
$('.J_PopupInfo').tooltip({
	html: true,
	placement: 'bottom'
});
$('.J_DelPageBtn').on('click', function(){
	var $this = $(this);
	var confirmLayer = layer.confirm('删除后不可恢复，确认要删除吗？', function(){
		layer.close(confirmLayer);
		var loadLayer = layer.load();
		$.getJSON($this.attr('data-url'), function(data){
			layer.close(loadLayer);
			if(data.success){
				layer.msg("操作成功", {icon: 1}, function(){
					window.location.href = window.location.href;
				});
			}else{
				layer.msg(data.errorMsg, {shift: 6});
			}
		});
	})
});

$('.J_PubPageBtn').on('click', function(){
	var $this = $(this);
	var confirmLayer = layer.confirm('确认要正式发布页面上线吗？', function(){
		layer.close(confirmLayer);
		var loadLayer = layer.load();
		$.getJSON($this.attr('data-url'), function(data){
			layer.close(loadLayer);
			if(data.success){
				if(data.msg){
					layer.msg(data.msg, {icon: 1}, function(){
						window.location.href = window.location.href;
					});
				}
			}else{
				layer.msg(data.errorMsg, {shift: 6});
			}
		});
	});
});

$('.J_RefreshPageBtn').on('click', function(){
	var $this = $(this);
	var confirmLayer = layer.confirm('确认刷新缓存吗？', function(){
		layer.close(confirmLayer);
		var loadLayer = layer.load();
		$.getJSON($this.attr('data-url'), function(data){
			layer.close(loadLayer);
			if(data.success){
				if(data.msg){
					layer.msg(data.msg, {icon: 1});
				}
			}else{
				layer.msg(data.msg, {shift: 6});
			}
		});
	});
});

$('.J_FavBtn').on('click', function(){
	$.getJSON($(this).attr('data-url'), function(data){
		if(data.success){
			window.location.href = window.location.href;
		}else{
			alert(data.errorMsg);
		}
	});
});

if($('#J_ModifyInfoDialog')){
	var S = KISSY,
		ngPageMod = ngPageMod || angular.module('cms', ['ngSanitize']);
	// 页面控制器
	ngPageMod.controller('infoModify', ['$scope', '$http', function($scope, $http){
		$scope.whiteReg = /^[0-9\n]+$/;
		$scope.syncWhite = function(){
			if($scope.infoForm.white.$valid){
				$scope.infoData.white = $scope.infoData.whiteText.split('\n');
			}
		};
		$scope.saveInfo = function(){
			if($scope.infoForm.$valid){
				$http({
					method: 'POST', 
					url: '/page/modify/' + $scope.infoData.id,
					data: $scope.infoData
				}).success(function(data, status) {
					if(data.success){
						window.location.href = window.location.href;
					}else{
						alert(data.errorMsg);
					}
				});
			}
		};

	}]);
	
}
