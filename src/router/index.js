

import { createRouter, createWebHistory } from 'vue-router';
import TodoList from '../components/TodoList.vue';
import Main from '../components/Main.vue';
import Analysis from '../components/Analysis.vue';
import View from '../components/View.vue';
import Management from '../components/Management.vue';
import Knowledge from '../components/Knowledge.vue';
// import HW from '../components/HelloWorld.vue'

const routes = [
    {
        path: '/', // 定义根路径
        name: 'TodoList',
        component: TodoList
    },
    {
        path: '/login', // 定义 /login 路径
        name: 'login', // 为该路由路径设置一个名称，方便在代码中通过名称引用
        // component: Login // 注释掉的代码，原本可能用于指定 /login 路径对应的组件
        // component: () => import('@/components/Login') // 懒加载代码，表示按需加载 Login 组件
        component: () => import('@/components/login.vue') // 懒加载 Login 组件
    },
    // {
    //     path: '/dashboard',  // 改为更具描述性的路径
    //     name: 'dashboard',   // 改为更具描述性的名称
    //     component: () => import("../components/main.vue"),
    //     children: [
    //         {
    //             path: "home",
    //             component: () => import("../components/home/index.vue"),
    //             name: 'home'
    //         },
    //         {
    //             path: "test",
    //             component: () => import("../components/test.vue"),
    //             name: 'test'
    //         }
    //     ]
    // },
    {
        path: '/analysis',
        name: 'Analysis',
        component: Analysis,
    },
    {
        path: '/view',
        name: 'View',
        component: View,
    },
    {
        path: '/management',
        name: 'Management',
        component: Management,
    },
    {
        path: '/knowledge',
        name: 'Knowledge',
        component: Knowledge,
    },
    {
        path: '/main',
        name: 'Main',
        component: Main,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL), // 使用 createWebHistory
    routes
});

export default router;