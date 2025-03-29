import Mock from 'mockjs';
import { keywordPlans } from './keywordPlans';

/**
 * 为每个方案生成舆情数据
 * 数据结构说明：
 * - keyid: 方案唯一标识ID
 * - overview: 数据概览（用于舆情查看页的统计卡片）
 *   - total: 总数据量
 *   - newToday: 今日新增
 *   - positive: 积极信息数量
 *   - negative: 消极信息数量
 * - articles: 舆情文章列表（用于舆情查看页的数据表格）
 *   - id: 文章ID
 *   - title: 文章标题
 *   - source: 来源平台
 *   - sentiment: 情感类型
 *   - publishTime: 发布时间
 *   - heat: 热度
 *   - content: 内容摘要
 *   - url: 原文链接
 */
export const sentimentData = keywordPlans.map(plan => {
  const dataCount = plan.dataCount || Mock.Random.integer(800, 5000);
  
  // 生成文章列表
  const articles = Mock.mock({
    [`list|${Mock.Random.integer(30, 50)}`]: [{
      'id|+1': 10001,
      'title': '@ctitle(10, 30)',
      'source|1': ['微博', '微信', '新闻网站', '论坛', '抖音'],
      'sentiment|1': ['positive', 'negative', 'neutral'],
      'publishTime': '@datetime("yyyy-MM-dd HH:mm:ss")',
      'heat|10-95': 10,
      'content': '@cparagraph(1, 2)',
      'url': '@url'
    }]
  }).list;
  
  // 计算概览数据
  const positiveCount = articles.filter(a => a.sentiment === 'positive').length;
  const negativeCount = articles.filter(a => a.sentiment === 'negative').length;
  
  return {
    keyid: plan.keyid,
    overview: {
      total: dataCount,
      newToday: Mock.Random.integer(10, 100),
      positive: positiveCount,
      negative: negativeCount
    },
    articles: articles
  };
});

/**
 * 获取某个方案的舆情数据
 * @param {number} id 方案ID
 * @returns {Object} 舆情数据
 * 用途：舆情查看页加载时获取指定方案的舆情数据
 */
export function getSentimentDataByPlanId(id) {
  const data = sentimentData.find(item => item.keyid === parseInt(id));
  if (data) {
    return {
      code: 200,
      data: data,
      message: '获取成功'
    };
  } else {
    return {
      code: 404,
      data: null,
      message: '未找到该方案的舆情数据'
    };
  }
}

/**
 * 获取方案舆情数据的过滤结果
 * @param {number} id 方案ID 
 * @param {Object} filters 过滤条件
 * @returns {Object} 过滤后的舆情数据
 * 用途：舆情查看页应用过滤器时获取过滤结果
 */
export function getFilteredSentimentData(id, filters) {
  const data = sentimentData.find(item => item.keyid === parseInt(id));
  if (!data) {
    return {
      code: 404,
      data: null,
      message: '未找到该方案的舆情数据'
    };
  }
  
  // 应用过滤器
  let filtered = [...data.articles];
  
  if (filters.sentiment) {
    filtered = filtered.filter(item => item.sentiment === filters.sentiment);
  }
  
  if (filters.platform) {
    filtered = filtered.filter(item => item.source === filters.platform);
  }
  
  if (filters.startDate && filters.endDate) {
    filtered = filtered.filter(item => {
      const date = new Date(item.publishTime);
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      return date >= start && date <= end;
    });
  }
  
  return {
    code: 200,
    data: {
      keyid: data.keyid,
      overview: data.overview,
      articles: filtered
    },
    message: '获取成功'
  };
} 