import { createStore } from 'vuex';

// 创建 Vuex Store 实例
export default createStore({
    state: {
        sidebarCollapsed: false,
        currentKeywordPlan: null,
        keywordPlans: [],
        loading: false,
        notifications: []
    },
    mutations: {
        toggleSidebar(state) {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        },
        setSidebarState(state, collapsed) {
            state.sidebarCollapsed = collapsed;
        },
        setCurrentKeywordPlan(state, plan) {
            state.currentKeywordPlan = plan;
        },
        setKeywordPlans(state, plans) {
            state.keywordPlans = plans;
        },
        addKeywordPlan(state, plan) {
            state.keywordPlans.push(plan);
        },
        updateKeywordPlan(state, { id, data }) {
            const index = state.keywordPlans.findIndex(plan => plan.keyid === id);
            if (index !== -1) {
                state.keywordPlans[index] = { ...state.keywordPlans[index], ...data };
            }
        },
        removeKeywordPlan(state, id) {
            state.keywordPlans = state.keywordPlans.filter(plan => plan.keyid !== id);
        },
        setLoading(state, status) {
            state.loading = status;
        },
        addNotification(state, notification) {
            state.notifications.push({
                id: Date.now(),
                ...notification
            });
        },
        removeNotification(state, id) {
            state.notifications = state.notifications.filter(n => n.id !== id);
        }
    },
    actions: {
        async fetchKeywordPlans({ commit }) {
            commit('setLoading', true);
            try {
                // 模拟API请求
                const response = await new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            data: [
                                { keyid: 1, keyword: '新冠疫情', active: true },
                                { keyid: 2, keyword: '经济政策', active: true },
                                { keyid: 3, keyword: '社会热点', active: false },
                                { keyid: 4, keyword: '科技创新', active: true },
                                { keyid: 5, keyword: '教育改革', active: false }
                            ]
                        });
                    }, 500);
                });
                commit('setKeywordPlans', response.data);
            } catch (error) {
                commit('addNotification', { 
                    type: 'error', 
                    title: '加载失败', 
                    message: '无法加载舆情关键词方案' 
                });
                console.error(error);
            } finally {
                commit('setLoading', false);
            }
        },
        async createKeywordPlan({ commit }, plan) {
            commit('setLoading', true);
            try {
                // 模拟API请求
                const response = await new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            data: { 
                                keyid: Date.now(), 
                                keyword: plan.keyword, 
                                active: true,
                                ...plan
                            }
                        });
                    }, 500);
                });
                commit('addKeywordPlan', response.data);
                commit('addNotification', { 
                    type: 'success', 
                    title: '创建成功', 
                    message: '舆情关键词方案创建成功' 
                });
                return response.data;
            } catch (error) {
                commit('addNotification', { 
                    type: 'error', 
                    title: '创建失败', 
                    message: '无法创建舆情关键词方案' 
                });
                console.error(error);
                throw error;
            } finally {
                commit('setLoading', false);
            }
        }
    },
    getters: {
        activeKeywordPlans(state) {
            return state.keywordPlans.filter(plan => plan.active);
        }
    }
});