/**
 * API接口集合
 * 
 * 主要功能：
 * 1. 封装所有后端API请求
 * 2. 注册Mock接口，用于开发和测试
 * 3. 提供统一的接口调用方法
 */
import request from "./myAxios"
import Mock from 'mockjs'
import { getAllKeywordPlans, getKeywordPlanById, setCurrentPlan, togglePlanStatus } from '../mockData/keywordPlans'
import { getAllPlanDetails, getPlanDetailById } from '../mockData/planDetails'
import { getAnalysisData } from '../mockData/analysisData'

// 注册Mock接口
Mock.mock(/api\/keywordPlans\/all/, 'get', getAllKeywordPlans)
Mock.mock(/api\/keywordPlans\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\d+$/)[0])
  return getKeywordPlanById(id)
})
Mock.mock(/api\/keywordPlans\/setCurrent\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\d+$/)[0])
  return setCurrentPlan(id)
})
Mock.mock(/api\/keywordPlans\/toggle\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\d+$/)[0])
  return togglePlanStatus(id)
})
Mock.mock(/api\/planDetails\/all/, 'get', getAllPlanDetails)
Mock.mock(/api\/planDetails\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\d+$/)[0])
  return getPlanDetailById(id)
})
Mock.mock(/api\/analysis\/data/, 'get', getAnalysisData)

//默认暴露出一个对象，因为我们不止一个请求方法，所以要写在一个对象中
export default{
    //定义登录要发送的请求
    login(params) {
        return request({
            url: '/permission/getMenu',
            method: 'post',
            data: params
        })
    }, getTableData(params){
        return request({
            url:"/home/getTableData",
            method:"get",
            data:params,
        })
    },
    getCountData(params){
        return request({
            url:"/home/getCountData",
            method:"get",
            data:params,
        })
    },
    getEchartsData(params){
        return request({
            url:"/home/getEchartsData",
            method:"get",
            data:params,
        })
    } ,
    
    /**
     * 获取所有关键词方案
     * @returns {Promise} 包含关键词方案列表的Promise
     */
    getAllKeywordPlans() {
        return request({
            url: "/keywordPlans/all",
            method: "get"
        })
    },
    
    /**
     * 获取单个关键词方案
     * @param {number} id 方案ID
     * @returns {Promise} 包含单个关键词方案的Promise
     */
    getKeywordPlanById(id) {
        return request({
            url: `/keywordPlans/${id}`,
            method: "get"
        })
    },
    
    /**
     * 设置当前方案
     * @param {number} id 方案ID
     * @returns {Promise} 设置结果的Promise
     */
    setCurrentPlan(id) {
        return request({
            url: `/keywordPlans/setCurrent/${id}`,
            method: "put"
        })
    },
    
    /**
     * 切换方案启用状态
     * @param {number} id 方案ID
     * @returns {Promise} 切换结果的Promise
     */
    togglePlanStatus(id) {
        return request({
            url: `/keywordPlans/toggle/${id}`,
            method: "put"
        })
    },
    
    /**
     * 获取所有方案详情
     * @returns {Promise} 包含所有方案详情的Promise
     */
    getAllPlanDetails() {
        return request({
            url: "/planDetails/all",
            method: "get"
        })
    },
    
    /**
     * 获取单个方案详情
     * @param {number} id 方案ID
     * @returns {Promise} 包含单个方案详情的Promise
     */
    getPlanDetailById(id) {
        return request({
            url: `/planDetails/${id}`,
            method: "get"
        })
    },
    
    /**
     * 获取舆情分析数据
     * @returns {Promise} 包含舆情分析数据的Promise
     */
    getAnalysisData() {
        return request({
            url: "/analysis/data",
            method: "get"
        })
    },
}

