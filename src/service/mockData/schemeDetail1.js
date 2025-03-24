// ./api/mockData/schemeDetail.js
import Mock from 'mockjs';

// 定义唯一的id列表
const schemeIds = ['100001', '100002', '114514', '100606', '100866'];

// 为每个id生成对应的详细数据，并存储在一个对象中
const schemeDetails = schemeIds.reduce((acc, id) => {
    acc[id] = Mock.mock({
        overview: {
            infos: '@integer(100, 1000)',
            negative: '@integer(0, 100)',
            positive: '@integer(0, 100)',
            normal: '@integer(0, 100)'
        },
        sentimentRatio: {
            negative: '@float(0, 1, 2)',
            positive: '@float(0, 1, 2)',
            normal: '@float(0, 1, 2)'
        },
        keywordHits: {
            keyword1: '@integer(50, 200)',
            keyword2: '@integer(50, 200)',
            keyword3: '@integer(50, 200)',
            keyword4: '@integer(50, 200)',
            keyword5: '@integer(50, 200)'
        },
        hotVideos: {
            'list|3': [
                {
                    title: '@ctitle(5, 10)',
                    link: '@url',
                    popularity: '@integer(100, 1000)',
                    sentiment: '@pick(["positive", "negative", "normal"])',
                    source: '@pick(["微博", "抖音", "B站", "知乎"])',
                    time: '@datetime'
                }
            ]
        }
    });
    return acc;
}, {});

// Mock 接口
Mock.mock('/api/schemeDetail/:id', 'get', (req) => {
    const id = req.url.split('/').pop(); // 从 URL 中提取 id
    return schemeDetails[id] || { error: 'Scheme not found' };
});