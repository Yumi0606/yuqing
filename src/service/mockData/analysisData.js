import Mock from 'mockjs';

/**
 * 舆情分析页面数据
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
 *   - name: 平台名称
 *   - value: 占比值
 * - emotionData: 情感分析数据
 *   - positive:
 *   - negative: 
 *   - neutral: 
 *   - unknown: 
 * - trendData: 趋势数据
 */
export const analysisData = {
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
 * 获取舆情分析数据
 * @returns {Object} 接口返回对象，包含code、data和message
 */
export function getAnalysisData() {
  return {
    code: 200,
    data: analysisData,
    message: '获取成功'
  };
} 