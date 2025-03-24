import Mock from 'mockjs';
import { keywordPlans } from './keywordPlans';

/**
 * 舆情分析数据
 * 包含：
 * 1. 全局分析数据 - 用于分析页面展示整体舆情趋势
 * 2. 方案详细分析数据 - 用于每个方案的详细分析
 */

/**
 * 全局舆情分析数据
 * 数据结构说明：
 * - overviewData: 数据概览
 *   - total: 总数据量
 *   - positive: 积极信息数量
 *   - negative: 消极信息数量
 *   - neutral: 中性信息数量
 *   - totalTrend: 总量趋势（百分比）
 *   - positiveTrend: 积极信息趋势
 *   - negativeTrend: 消极信息趋势
 *   - neutralTrend: 中性信息趋势
 * - platformData: 平台分布数据
 * - emotionData: 情感分析数据
 * - trendData: 趋势数据
 */
export const globalAnalysisData = {
  // 数据概览
  overviewData: {
    total: Mock.Random.integer(10000, 15000),     // 总数据量
    positive: Mock.Random.integer(4000, 6000),    // 积极信息数量
    negative: Mock.Random.integer(2000, 4000),    // 消极信息数量
    neutral: Mock.Random.integer(3000, 5000),     // 中性信息数量
    totalTrend: Mock.Random.float(5, 20, 1, 1),   // 总量趋势（百分比）
    positiveTrend: Mock.Random.float(10, 20, 1, 1), // 积极信息趋势
    negativeTrend: Mock.Random.float(-10, -1, 1, 1), // 消极信息趋势
    neutralTrend: Mock.Random.float(5, 15, 1, 1)    // 中性信息趋势
  },
  
  // 平台分布数据
  platformData: [
    { name: '微博', value: Mock.Random.integer(20, 40) },
    { name: '微信', value: Mock.Random.integer(15, 30) },
    { name: '新闻网站', value: Mock.Random.integer(10, 20) },
    { name: '论坛', value: Mock.Random.integer(5, 15) },
    { name: '抖音', value: Mock.Random.integer(5, 15) }
  ],
  
  // 情感分析数据
  emotionData: {
    positive: Mock.Random.integer(35, 50),  // 积极情感占比
    negative: Mock.Random.integer(20, 35),  // 消极情感占比
    neutral: Mock.Random.integer(15, 30),   // 中性情感占比
    unknown: Mock.Random.integer(1, 10)     // 未知情感占比
  },
  
  // 趋势图数据
  trendData: {
    // 周数据（7天）
    week: Mock.mock({
      'data|7': [{
        'date': '@date("MM/dd")',   // 日期
        'value|500-1500': 800       // 当日数据量
      }]
    }).data,
    
    // 两周数据（14天）
    biweek: Mock.mock({
      'data|14': [{
        'date': '@date("MM/dd")',
        'value|500-1500': 800
      }]
    }).data,
    
    // 月数据（30天）
    month: Mock.mock({
      'data|30': [{
        'date': '@date("MM/dd")',
        'value|500-1500': 800
      }]
    }).data
  }
};

/**
 * 方案详细分析数据
 * 数据结构说明：
 * - keyid: 方案唯一标识
 * - overview: 数据概览
 *   - infos: 总数据量
 *   - negative: 消极信息数量
 *   - positive: 积极信息数量
 *   - normal: 中性信息数量
 * - sentimentRatio: 情感占比
 * - keywordHits: 关键词命中统计
 * - hotTopics: 热门话题
 * - platformDistribution: 平台分布数据
 * - timelineData: 时间线数据
 * - hotArticles: 热门文章
 */
export const planAnalysisData = keywordPlans.map(plan => {
  return {
    keyid: plan.keyid,
    overview: {
      infos: Mock.Random.integer(500, 5000),  // 总数据量
      negative: Mock.Random.integer(100, 500), // 消极信息数量
      positive: Mock.Random.integer(200, 800), // 积极信息数量
      normal: Mock.Random.integer(200, 800)    // 中性信息数量
    },
    sentimentRatio: {
      negative: Mock.Random.float(0.1, 0.3, 2, 2), // 消极情感占比
      positive: Mock.Random.float(0.3, 0.5, 2, 2), // 积极情感占比
      normal: Mock.Random.float(0.2, 0.4, 2, 2)    // 中性情感占比
    },
    keywordHits: Mock.mock({
      'keywords|5': [{
        'name': '@cword(2,4)',       // 关键词名称
        'value|50-500': 100          // 命中次数
      }]
    }).keywords,
    hotTopics: Mock.mock({
      'list|5': [{
        'topic': '@ctitle(5, 10)',    // 热门话题名称
        'heat|500-2000': 500,         // 话题热度
        'trend|1': ['上升', '下降', '稳定'], // 趋势
        'sentiment|1': ['积极', '消极', '中性'] // 情感倾向
      }]
    }).list,
    platformDistribution: Mock.mock({
      'platforms|5': [{
        'name|+1': ['微博', '微信', '抖音', '新闻网站', '论坛', '博客'], // 平台名称
        'value|5-40': 10                                         // 平台占比
      }]
    }).platforms,
    timelineData: Mock.mock({
      'dates|7': [{
        'date': '@date("MM-dd")',    // 日期
        'value|100-500': 200         // 当日数据量
      }]
    }).dates,
    hotArticles: Mock.mock({
      'list|3': [{
        'title': '@ctitle(10, 20)',              // 文章标题
        'url': '@url',                           // 文章链接
        'source|1': ['微博', '微信', '抖音', '新闻网站', '论坛'], // 文章来源
        'publishTime': '@datetime("yyyy-MM-dd HH:mm:ss")', // 发布时间
        'heat|100-1000': 500,                    // 热度
        'sentiment|1': ['积极', '消极', '中性']      // 情感倾向
      }]
    }).list
  };
});

/**
 * 获取全局舆情分析数据
 * @returns {Object} 接口返回对象
 */
export function getAnalysisData() {
  return {
    code: 200,
    data: globalAnalysisData,
    message: '获取成功'
  };
}

/**
 * 获取所有方案分析详情
 * @returns {Object} 接口返回对象
 */
export function getAllPlanAnalysisData() {
  return {
    code: 200,
    data: planAnalysisData,
    message: '获取成功'
  };
}

/**
 * 获取单个方案分析详情
 * @param {number} id 方案ID
 * @returns {Object} 接口返回对象
 */
export function getPlanAnalysisDataById(id) {
  const detail = planAnalysisData.find(item => item.keyid === parseInt(id));
  if (detail) {
    return {
      code: 200,
      data: detail,
      message: '获取成功'
    };
  } else {
    return {
      code: 404,
      data: null,
      message: '未找到该方案详情'
    };
  }
} 