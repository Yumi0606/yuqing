export default {
    getTableData:()=>{
        return {
            tableData: [
                {
                    name: "oppo",
                    todayBuy: 500,
                    monthBuy: 3500,
                    totalBuy: 22000,
                },
                {
                    name: "vivo",
                    todayBuy: 300,
                    monthBuy: 2200,
                    totalBuy: 24000,
                },
                {
                    name: "苹果",
                    todayBuy: 800,
                    monthBuy: 4500,
                    totalBuy: 65000,
                },
                {
                    name: "小米",
                    todayBuy: 1200,
                    monthBuy: 6500,
                    totalBuy: 45000,
                },
                {
                    name: "三星",
                    todayBuy: 300,
                    monthBuy: 2000,
                    totalBuy: 34000,
                },
                {
                    name: "魅族",
                    todayBuy: 350,
                    monthBuy: 3000,
                    totalBuy: 22000,
                },
            ]


        }
    },
    getCountData:()=>{
        return {
            countData: [
                {
                    "name": "今日支付订单",
                    "value": 1234,
                    "icon": "SuccessFilled",
                    "color": "#2ec7c9"
                },
                {
                    "name": "今日收藏订单",
                    "value": 210,
                    "icon": "StarFilled",
                    "color": "#ffb980"
                },
                {
                    "name": "今日未支付订单",
                    "value": 1234,
                    "icon": "GoodsFilled",
                    "color": "#5ab1ef"
                },
                {
                    "name": "本月支付订单",
                    "value": 1234,
                    "icon": "SuccessFilled",
                    "color": "#2ec7c9"
                },
                {
                    "name": "本月收藏订单",
                    "value": 210,
                    "icon": "StarFilled",
                    "color": "#ffb980"
                },
                {
                    "name": "本月未支付订单",
                    "value": 1234,
                    "icon": "GoodsFilled",
                    "color": "#5ab1ef"
                }
            ]


        }
    },
    getEchartsData:()=>{
        return {
            "orderData": {
                "date": [
                    "20191001",
                    "20191002",
                    "20191003",
                    "20191004",
                    "20191005",
                    "20191006",
                    "20191007"
                ],
                "data": [
                    {
                        "苹果": 2112,
                        "小米": 1809,
                        "华为": 2110,
                        "oppo": 1129,
                        "vivo": 3233,
                        "一加": 3871
                    },
                    {
                        "苹果": 1969,
                        "小米": 3035,
                        "华为": 4204,
                        "oppo": 3779,
                        "vivo": 3282,
                        "一加": 4800
                    },
                    {
                        "苹果": 1649,
                        "小米": 3300,
                        "华为": 2176,
                        "oppo": 4141,
                        "vivo": 1699,
                        "一加": 3579
                    },
                    {
                        "苹果": 4966,
                        "小米": 2862,
                        "华为": 4963,
                        "oppo": 4897,
                        "vivo": 1102,
                        "一加": 3671
                    },
                    {
                        "苹果": 2598,
                        "小米": 3852,
                        "华为": 2320,
                        "oppo": 2413,
                        "vivo": 3673,
                        "一加": 4100
                    },
                    {
                        "苹果": 1581,
                        "小米": 3975,
                        "华为": 4405,
                        "oppo": 3379,
                        "vivo": 1843,
                        "一加": 4288
                    },
                    {
                        "苹果": 3581,
                        "小米": 4725,
                        "华为": 2224,
                        "oppo": 4463,
                        "vivo": 4339,
                        "一加": 1640
                    }
                ]
            },
            "videoData": [
                {
                    "name": "小米",
                    "value": 2999
                },
                {
                    "name": "苹果",
                    "value": 5999
                },
                {
                    "name": "vivo",
                    "value": 1500
                },
                {
                    "name": "oppo",
                    "value": 1999
                },
                {
                    "name": "魅族",
                    "value": 2200
                },
                {
                    "name": "三星",
                    "value": 4500
                }
            ],
            "userData": [
                {
                    "date": "周一",
                    "new": 5,
                    "active": 200
                },
                {
                    "date": "周二",
                    "new": 10,
                    "active": 500
                },
                {
                    "date": "周三",
                    "new": 12,
                    "active": 550
                },
                {
                    "date": "周四",
                    "new": 60,
                    "active": 800
                },
                {
                    "date": "周五",
                    "new": 65,
                    "active": 550
                },
                {
                    "date": "周六",
                    "new": 53,
                    "active": 770
                },
                {
                    "date": "周日",
                    "new": 33,
                    "active": 170
                }
            ]
        }
    }

}
