Coding Help
======

Fields Config - 字段配置
------

用于配置运营填写数据的数据字段

* 必须是一个数组
* 必须是标准JSON结构，键名用双引号
* 每一个字段配置项必须拥有 `name`、 `key`、 `type` 三个字段
	* `name` : 用来提示运营该字段的功能
	* `key` : 在模板中用这个字段来获取数据
	* `type` : 标识字段的类型

例子:

```
[{
	"name": "Banner列表",
	"key": "bannerList",
	"type": "imgLinkList"
}]
```

### 字段类型

#### 基本数据类型

* `text` : 文本类型
* `link` : 超链接类型
* `number` : 数字类型
* `img` : 图片超链接类型
* `color` : 颜色值类型（不带 `#` ）
* `boolean` : 布尔类型
* `richText` : 富文本编辑
* `date` : 日期 yyyy-MM-dd
* `datetime` : 日期时间 yyyy-MM-dd HH:mm:ss

#### 组合数据类型

* `textLink` : 文案链接， 包含字段：
	*  key.text
	*  key.link
* `imgLink` : 图片链接， 包含字段：
	*  key.text
	*  key.link
	*  key.img
* `product` : 商品数据， 包含字段：
	* key.id 
	* key.name 
	* key.quick.link 
	* key.quick.image 
	* key.quick.price
	* key.quick.oprice
	* key.quick.discount


#### 列表数据类型

* `textList` : 文字列表， 包含字段：
	* item.text
* `textLinkList` : 文案链接列表
* `imgLinkList` : 图片链接列表
* `productList` : 商品列表

#### 自定义列表类型

* `customList` : 自定义列表 只能包含下列6种基本类型数据
	* text
	* link
	* img
	* color
	* boolean
	* richText

Template - 模板
-------

模板必须用 [Juicer](http://juicer.name/) 编写 

### 区块引入

```
${'data/indexmain.json'|include} 
```

Test Data - 测试数据
-----

编辑模块代码时，可以填写测试数据，用来测试模块

* 测试数据只会在模块预览时被调用，不会影响运营填写数据
* 测试数据必须是严格的JSON格式


