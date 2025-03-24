import { createStore } from 'vuex';

// 创建 Vuex Store 实例
export default createStore({
    state: {
        // 确保所有状态都有初始值
        sidebarCollapsed: false,
        currentKeywordPlan: null,
        keywordPlans: [],  // 初始化空数组
        loading: false,
        notifications: []
    },
    mutations: {/* 保持原有mutations内容不变 */},
    actions: {
        async fetchKeywordPlans({ commit }) {
            // 原有action实现
        },
        // 其他actions
    },
    getters: {
        activeKeywordPlans(state) {
            return state.keywordPlans.filter(plan => plan.active);
        }
    }
}); 