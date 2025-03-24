import Mock from 'mockjs';
import { keywordPlans } from './keywordPlans';

/**
 * 为每个方案生成详细数据
 * 数据结构说明：
 * - keyid: 方案唯一标识
 * - overview: 数据概览
 *   - infos: 总数据量
 *   - negative: 消极信息数量
 *   - positive: 积极信息数量
 *   - normal: 中性信息数量
 * - sentimentRatio: 情感占比
 *   - negative: 消极占比
 *   - positive: 积极占比
 *   - normal: 中性占比
 * - keywordHits: 关键词命中统计
 *   - name: 关键词名称
 *   - value: 命中次数
 * - hotTopics: 热门话题
 *   - topic: 话题名称
 *   - heat: 热度值
 *   - trend: 趋势（上升/下降/稳定）
 *   - sentiment: 情感倾向
 * - platformDistribution: 平台分布数据
 *   - name: 平台名称
 *   - value: 占比值
 * - timelineData: 时间线数据
 *   - date: 日期
 *   - value: 数据量
 * - hotArticles: 热门文章
 *   - title: 文章标题
 *   - url: 文章链接
 *   - source: 来源平台
 *   - publishTime: 发布时间
 *   - heat: 热度值
 *   - sentiment: 情感倾向
 */
export const planDetails = keywordPlans.map(plan => {
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
 * 获取所有方案详情
 * @returns {Object} 接口返回对象，包含code、data和message
 */
export function getAllPlanDetails() {
  return {
    code: 200,
    data: planDetails,
    message: '获取成功'
  };
}

/**
 * 获取单个方案详情
 * @param {number} id 方案ID
 * @returns {Object} 接口返回对象，包含code、data和message
 */
export function getPlanDetailById(id) {
  const detail = planDetails.find(item => item.keyid === parseInt(id));
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