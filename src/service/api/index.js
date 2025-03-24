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
import { getAllPlanInfo, getPlanInfoById, updatePlanInfo } from '../mockData/planInfo'
import { getSentimentDataByPlanId, getFilteredSentimentData } from '../mockData/sentimentData'

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
Mock.mock(/api\/planInfo\/all/, 'get', getAllPlanInfo)
Mock.mock(/api\/planInfo\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\d+$/)[0])
  return getPlanInfoById(id)
})
Mock.mock(/api\/planInfo\/update\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\d+$/)[0])
  const data = JSON.parse(options.body)
  return updatePlanInfo(id, data)
})
Mock.mock(/api\/sentimentData\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\d+$/)[0])
  return getSentimentDataByPlanId(id)
})
Mock.mock(/api\/sentimentData\/filter\/\d+/, 'post', (options) => {
  const id = parseInt(options.url.match(/\d+$/)[0])
  const filters = JSON.parse(options.body)
  return getFilteredSentimentData(id, filters)
})

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
    
    /**
     * 获取所有方案信息
     * @returns {Promise} 返回所有方案信息的Promise
     */
    getAllPlanInfo() {
        return request({
            url: "/planInfo/all",
            method: "get"
        })
    },
    
    /**
     * 获取单个方案信息
     * @param {number} id 方案ID
     * @returns {Promise} 返回单个方案信息的Promise
     */
    getPlanInfoById(id) {
        return request({
            url: `/planInfo/${id}`,
            method: "get"
        })
    },
    
    /**
     * 更新方案信息
     * @param {number} id 方案ID
     * @param {Object} data 更新数据
     * @returns {Promise} 返回更新结果的Promise
     */
    updatePlanInfo(id, data) {
        return request({
            url: `/planInfo/update/${id}`,
            method: "put",
            data: data
        })
    },
    
    /**
     * 获取方案舆情数据
     * @param {number} id 方案ID
     * @returns {Promise} 返回舆情数据的Promise
     */
    getSentimentDataByPlanId(id) {
        return request({
            url: `/sentimentData/${id}`,
            method: "get"
        })
    },
    
    /**
     * 获取过滤后的舆情数据
     * @param {number} id 方案ID
     * @param {Object} filters 过滤条件
     * @returns {Promise} 返回过滤后的舆情数据的Promise
     */
    getFilteredSentimentData(id, filters) {
        return request({
            url: `/sentimentData/filter/${id}`,
            method: "post",
            data: filters
        })
    }
}

