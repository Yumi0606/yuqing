import { createRouter, createWebHistory } from 'vue-router';

// 路由懒加载
const Home = () => import('../views/Home.vue');
const MainLayout = () => import('../layouts/MainLayout.vue');
const Analysis = () => import('../views/Analysis.vue');
const View = () => import('../views/View.vue');
const Management = () => import('../views/Management.vue');
const Knowledge = () => import('../views/Knowledge.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dashboard',
    component: MainLayout,
    children: [
      {
        path: 'analysis',
        name: 'Analysis',
        component: Analysis
      },
      {
        path: 'view',
        name: 'View',
        component: View
      },
      {
        path: 'management',
        name: 'Management',
        component: Management
      },
      {
        path: 'knowledge',
        name: 'Knowledge',
        component: Knowledge
      },
      {
        path: '',
        redirect: '/dashboard/analysis'
      }
    ]
  },
  // 重定向没有匹配到的路由到首页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // 始终滚动到顶部
    return { top: 0 }
  },
});

export default router;