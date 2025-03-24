# 目录结构
```
src/
├── assets/            # 静态资源
│   ├── css/           # CSS 样式
│   ├── images/        # 图片资源
│   ├── fonts/         # 字体资源
├── components/        # 组件
│   ├── common/        # 通用组件
│   ├── analysis/      # 舆情分析组件
│   ├── view/          # 舆情查看组件
│   ├── management/    # 方案管理组件
│   ├── knowledge/     # 知识科普组件
├── layouts/           # 布局组件
│   ├── MainLayout.vue # 主布局
│   ├── Sidebar.vue    # 侧边栏
│   ├── Navbar.vue     # 顶部导航栏
├── views/             # 页面视图
│   ├── Home.vue       # 介绍页
│   ├── Analysis.vue   # 舆情分析页
│   ├── View.vue       # 舆情查看页
│   ├── Management.vue # 方案管理页
│   ├── Knowledge.vue  # 知识科普页
├── router/            # 路由配置
│   ├── index.js       # 路由定义
├── store/             # Vuex 状态管理
│   ├── index.js       # 主 store
│   ├── modules/       # 模块化 store
│       ├── sidebar.js # 侧边栏状态
│       ├── sentiments.js # 舆情数据状态
├── services/          # API 服务
│   ├── api.js         # API 请求函数
│   ├── mock.js        # 模拟数据
├── utils/             # 工具函数
│   ├── charts.js      # 图表配置
│   ├── animations.js  # 动画效果
├── App.vue            # 根组件
└── main.js            # 入口文件
```