import Mock from 'mockjs';

/**
 * 舆情关键词方案详细信息
 * 数据结构说明：
 * - keyid: 方案唯一标识ID
 * - keyword: 关键词方案名称
 * - isEnabled: 方案是否启用
 * - isCurrent: 是否当前选中方案
 * - createDate: 创建日期
 * - alertCount: 预警次数
 * - keywords: 关键词列表 
 * - dataCount: 舆情总数据量
 */
export const planInfos = Mock.mock({
  'list|5-10': [{
    'keyid|+1': 100001,
    'keyword': '@ctitle(3, 8)', 
    'isEnabled|1': [true, false],
    'isCurrent': function() {
      return this.keyid === 100001; // 确保只有一个方案是当前选中的
    },
    'createDate': '@date("yyyy-MM-dd")',
    'alertCount|0-20': 0,
    'keywords|3-6': ['@cword(2,4)'],
    'dataCount|1000-10000': 1000
  }]
}).list;

/**
 * 获取所有方案信息
 * @returns {Object} 返回所有方案信息列表
 * 用途：方案管理页面加载时获取所有方案
 */
export function getAllPlanInfo() {
  return {
    code: 200,
    data: planInfos,
    message: '获取成功'
  };
}

/**
 * 获取单个方案信息
 * @param {number} id 方案ID
 * @returns {Object} 返回单个方案信息
 * 用途：左侧边栏编辑按钮点击时获取单个方案信息
 */
export function getPlanInfoById(id) {
  const plan = planInfos.find(item => item.keyid === parseInt(id));
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
 * 更新方案信息
 * @param {number} id 方案ID
 * @param {Object} data 更新的数据
 * @returns {Object} 更新后的方案信息
 */
export function updatePlanInfo(id, data) {
  const index = planInfos.findIndex(item => item.keyid === parseInt(id));
  if (index !== -1) {
    planInfos[index] = { ...planInfos[index], ...data };
    return {
      code: 200,
      data: planInfos[index],
      message: '更新成功'
    };
  } else {
    return {
      code: 404,
      data: null,
      message: '未找到该方案'
    };
  }
} 