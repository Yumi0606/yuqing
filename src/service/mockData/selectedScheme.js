// ./api/mockData/selectedScheme.js
import Mock from 'mockjs';

// 定义唯一的id列表
const schemeIds = ['100001', '100002', '114514', '100606', '100866'];

// 随机选择一个id作为上次选择的舆情方案
const selectedScheme = Mock.mock({
    // id: '@pick([schemeIds])'  // 使用 @pick 从 schemeIds 中随机选择一个 id
    id: '100001'  // 使用 @pick 从 schemeIds 中随机选择一个 id
});

Mock.mock('/api/selectedScheme', 'get', selectedScheme);