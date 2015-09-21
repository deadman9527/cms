var S = KISSY,
	ngPageMod = angular.module('cms', ['ngSanitize']);

// 页面控制器
ngPageMod.controller('buildMobile', ['$scope', '$http', '$sce', function($scope, $http, $sce){
	$scope.piwikDataTitle = '';
	// 当前编辑的模块
	$scope.curEditMod = null;
	$scope.curEditModData = null;

	var getMod = function(id){
		var mod = null;
		S.each($scope.pageModList, function(m, i){
			if(m.id === id){
				mod = m;
				return false;
			}
		});
		return mod;
	};
	var getModIndex = function(id){
		var index = -1;
		S.each($scope.pageModList, function(m, i){
			if(m.id === id){
				index = i;
				return false;
			}
		});
		return index;
	};
	var exchangeMod = function(a, b){
		var aObj = $scope.pageModList[a],
			bObj = $scope.pageModList[b];
		$scope.pageModList[a] = bObj;
		$scope.pageModList[b] = aObj;
	};
	$scope.addModule = function(d){
		var _d = S.merge(d, {id: new Date().getTime() + ''});
		$scope.pageModList.push(_d);
		$scope.sync();
	};
	$scope.upModule = function(id){
		var i = getModIndex(id);
		if(i > 0){
			exchangeMod(i - 1, i);				
		}
	};
	$scope.downModule = function(id){
		var i = getModIndex(id);
		if(i > -1 && i < ($scope.pageModList.length - 1)){
			exchangeMod(i, i + 1);				
		}
	};
	$scope.delModule = function(id){
		if(confirm('确实要删除该模块码？')){
			var i = getModIndex(id);
			if(i > -1){
				$scope.pageModList.splice(i, 1);
				$scope.sync();
			}
		}
	};
	$scope.editModule = function(id){
		if($scope.pageCode){
			$scope.curEditMod = $scope.pageCode;
			$scope.curEditModData = $scope.curEditMod.data;
		}else{
			$scope.curEditMod = getMod(id);
			$scope.curEditModData = $scope.curEditMod.data;
			$scope.modDataTempUrl = '/mod/datatemp/' + $scope.curEditMod._id;
		}
	};
	$scope.secModule = function(data){
		return $sce.trustAsHtml(data);
	};
	$scope.tagSelect = function(tag){
		$scope.curTag = tag;
	};
	$scope.sync = function(){
		$scope.syncData({
			modList: $scope.pageModList
		});
	};
	$scope.syncData = function(d, callback){
		var _data = {
			pageId: $scope.pageId
		};
		if(d){
			_data = S.merge(_data, d);
		}
		//console.log(_data);
		$http({
			method: 'POST', 
			url: '/mod/render',
			data: _data
		}).success(function(data, status) {
			callback && callback(data);
			$('#J_ViewIframe').attr('src', $('#J_ViewIframe').attr('src'));
		});
	};
	$scope.updateMod = function(){
		$http({
			method: 'GET', 
			url: '/page/updatemod/' + $scope.pageId,
		}).success(function(data, status) {
			if(data.success){
				window.location.href = window.location.href;
			}else{
				$('#J_WaitingDialog').modal('hide');
				alert(data.errMsg);
			}
		});
	};
	
	$scope.showPiwikData = function(url, title){
		$scope.piwikDataTitle = title;
		$('#J_PiwikIframe').attr('src', url);
	};
	
	$scope.updateProduct = function(){
		$http({
			method: 'GET', 
			url: '/page/updateproduct/' + $scope.pageId,
		}).success(function(data, status) {
			if(data.success){
				window.location.href = window.location.href;
			}else{
				$('#J_WaitingDialog').modal('hide');
				alert(data.errMsg);
			}
		});
	};
}]);

// 模块编辑控制器
ngPageMod.controller('editModCtrl', ['$scope', '$filter', function($scope, $filter){
	var getInitData = function(arr){
		var blank = KISSY.clone(arr[0]);
		S.each(blank, function(v, k){
			blank[k] = '';
		});
		return blank;
	};
	var exchangeRow = function(arr, a, b){
		var aObj = arr[a],
			bObj = arr[b];
		arr[a] = bObj;
		arr[b] = aObj;
	};
	
	$scope.importKey = null;
	$scope.importData = {};
	$scope.addRow = function(key){
		var arr = $scope.curEditModData[key];
		arr.push(getInitData(arr));
	};
	$scope.upRow = function(key, item){
		var arr = $scope.curEditModData[key],
			i = arr.indexOf(item);
		if(i > 0){
			exchangeRow(arr, i - 1, i);
		}
	};
	$scope.downRow = function(key, item){
		var arr = $scope.curEditModData[key],
			i = arr.indexOf(item);
		if(i > -1 && i < arr.length -1){
			exchangeRow(arr, i, i + 1);
		}
	};
	$scope.removeRow = function(key, item){
		var arr = $scope.curEditModData[key];
		if(arr.length > 1){
			var index = arr.indexOf(item);
			arr.splice(index, 1);				
		}else{
			alert('请至少保留一行~');
		}
	};
	$scope.renderModule	= function(){
		if($scope.editModForm.$valid){
			var postData = {
				data: $scope.curEditMod.data
			};
			if($scope.pageModList){
				postData.modId =  $scope.curEditMod._id;
				postData.modIdAtList =  $scope.curEditMod.id;
			}
			$scope.syncData(postData, function(data){
				$scope.curEditMod.render = data.html;
				$scope.curEditMod.data = data.data;
			});
			$('#J_EditDataDialog').modal('hide');
		}
	};
	$scope.importMode = function(key){
		$scope.importKey = key;
	};
	$scope.editMode = function(){
		$scope.importKey = null;
	};
	$scope.parseImport = function(){
			var data = $scope.importData[$scope.importKey],
				moduleData = $scope.curEditModData[$scope.importKey],
				initData = getInitData(moduleData);
		if(data && data.length > 0){
			moduleData.length = 0;
			S.each(data, function(d, i){
				var rData = d.split('\t'),
					rObj = S.clone(initData),
					j = 0;
				S.each(rObj, function(f, k){
					rObj[k] = S.trim(rData[j]);
					j ++;
				});
				moduleData.push(rObj);
			});		
			$scope.importData[$scope.importKey] = '';
			$scope.importKey = null;
		}
	};
	
	$scope.showRichEditor = function(item, key){
		if(tmsRichEditor){
			$scope.richEditing = [item, key];
			tmsRichEditor.setData(item[key]);
		}
	};
	$scope.saveRichEditor = function(){
		if(tmsRichEditor && $scope.richEditing){
			str = tmsRichEditor.getData();
			$scope.richEditing[0][$scope.richEditing[1]] = str;
			$scope.cancelRichEditor();
		}
	};
	$scope.cancelRichEditor = function(){
		if(tmsRichEditor){
			$scope.richEditing = null;
			tmsRichEditor.setData('');
		}
	};
}]);
