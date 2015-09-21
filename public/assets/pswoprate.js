// 修改密码验证
if($('#J_ModifyPasswordDialog')){
	var S = KISSY,
		ngPageMod = ngPageMod || angular.module('cms', ['ngSanitize']);
	// 页面控制器
	ngPageMod.controller('pswModify', ['$scope', '$http', function($scope, $http){
		$scope.whiteReg = /^[0-9\n]+$/;
		$scope.syncWhite = function(){
			if($scope.pswForm.white.$valid){
				$scope.infoData.white = $scope.infoData.whiteText.split('\n');
			}
		};
		$scope.doSubmit = function(){
			if($scope.pswForm.$valid){
				$http({
					method: 'POST', 
					url: '/s/password/update',
					data: $scope.infoData
				}).success(function(data, status) {
					if(data.success){
						alert("密码修改成功！");
						window.location.href = "/";
					}else{
						alert(data.errorMsg);
					}
				});
			}
		};

	}]);
}
