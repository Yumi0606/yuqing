// ./api/mockData/schemes.js
import Mock from 'mockjs';

// 定义唯一的id列表
const schemeIds = ['100001', '100002', '114514', '100606', '100866'];

// 模拟舆情方案数据
const schemes = Mock.mock({
    'list|5': [
        {
            name: '@pick(["方案A", "方案B", "方案C", "方案D", "方案E"])',
            id: function() {
                return Mock.Random.pick(schemeIds); // 使用 Mock.Random.pick 从 schemeIds 中随机选择一个 id
            }
        }
    ]
}).list;

Mock.mock('/api/schemes', 'get', schemes);