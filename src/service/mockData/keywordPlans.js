import Mock from 'mockjs';

/**
 * 生成舆情关键词方案列表
 * 数据结构说明：
 * - keyword: 关键词方案名称
 * - keyid: 方案唯一标识ID（从100001开始）
 * - isEnabled: 方案是否启用状态
 * - isCurrent: 是否为当前选中的方案（进入dashboard时优先显示）
 * - createDate: 方案创建日期
 * - dataCount: 方案数据总量
 * - alertCount: 预警次数
 * - keywords: 关键词列表
 */
export const keywordPlans = Mock.mock({
  'list|5-10': [{
    'keyword': '@ctitle(3, 8)',
    'keyid|+1': 100001,
    'isEnabled|1': [true, false],
    'isCurrent': function() {
      // 确保只有一个方案是当前选中的
      return this.keyid === 100001;
    },
    'createDate': '@date("yyyy-MM-dd")',
    'dataCount|1000-10000': 1000,
    'alertCount|0-20': 0,
    'keywords|3-6': ['@cword(2,4)']
  }]
}).list;

/**
 * 获取所有关键词方案
 * @returns {Object} 接口返回对象，包含code、data和message
 */
export function getAllKeywordPlans() {
  return {
    code: 200,
    data: keywordPlans,
    message: '获取成功'
  };
}

/**
 * 获取单个关键词方案
 * @param {number} id 方案ID
 * @returns {Object} 接口返回对象，包含code、data和message
 */
export function getKeywordPlanById(id) {
  const plan = keywordPlans.find(item => item.keyid === parseInt(id));
  if (plan) {
    return {
      code: 200,
      data: plan,
      message: '获取成功'
    };
  } else {
    return {
      code: 404,
      data: null,
      message: '未找到该方案'
    };
  }
}

/**
 * 设置当前选中方案
 * @param {number} id 方案ID
 * @returns {Object} 接口返回对象，包含code、data和message
 */
export function setCurrentPlan(id) {
  keywordPlans.forEach(plan => {
    plan.isCurrent = plan.keyid === parseInt(id);
  });
  
  return {
    code: 200,
    data: keywordPlans.find(item => item.keyid === parseInt(id)),
    message: '设置成功'
  };
}

/**
 * 切换方案启用状态
 * @param {number} id 方案ID
 * @returns {Object} 接口返回对象，包含code、data和message
 */
export function togglePlanStatus(id) {
  const plan = keywordPlans.find(item => item.keyid === parseInt(id));
  if (plan) {
    plan.isEnabled = !plan.isEnabled;
    return {
      code: 200,
      data: plan,
      message: '状态更新成功'
    };
  } else {
    return {
      code: 404,
      data: null,
      message: '未找到该方案'
    };
  }
} 