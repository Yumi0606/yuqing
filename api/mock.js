import Mock from "mockjs"
//引入获取数据的对象
import permissionApi from "./mockData/permission"

//拦截指定接口，返回一个回调函数的返回值
//第一个参数使用正则的方式匹配拦截请求，第二个是请求方式，第三个是拦截后调用的方法
Mock.mock(/api\/login/,"post",permissionApi.getMenu)

import homeApi from "./mockData/home"
//拦截指定接口，返回一个回调函数的返回值
Mock.mock(/home\/getTableData/,homeApi.getTableData)
Mock.mock(/home\/getCountData/,homeApi.getCountData)
Mock.mock(/home\/getEchartsData/,homeApi.getEchartsData)

