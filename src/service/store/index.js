import { createStore } from 'vuex';
import api from '../api/index';

// 创建 Vuex Store 实例
export default createStore({
    state: {
        // 确保所有状态都有初始值
        sidebarCollapsed: false,
        currentKeywordPlan: null,
        keywordPlans: [],  // 初始化空数组
        loading: false,
        notifications: [],
        
        // 方案表单相关状态
        showPlanForm: false,
        planFormMode: 'create', // 'create' 或 'edit'
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
        },
        setShowPlanForm(state, show) {
            state.showPlanForm = show;
        },
        setPlanFormMode(state, mode) {
            state.planFormMode = mode;
        }
    },
    actions: {
        async fetchKeywordPlans({ commit }) {
            commit('setLoading', true);
            try {
                const response = await api.getAllKeywordPlans();
                if (response.data && response.data.code === 200) {
                    commit('setKeywordPlans', response.data.data);
                    
                    // 查找当前选中的方案
                    const currentPlan = response.data.data.find(plan => plan.isCurrent);
                    if (currentPlan) {
                        commit('setCurrentKeywordPlan', currentPlan);
                    } else if (response.data.data.length > 0) {
                        // 如果没有当前选中的方案，选择第一个方案
                        commit('setCurrentKeywordPlan', response.data.data[0]);
                    }
                }
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
        
        async setCurrentPlan({ commit, state }, id) {
            commit('setLoading', true);
            try {
                const response = await api.setCurrentPlan(id);
                if (response.data && response.data.code === 200) {
                    // 获取计划列表的副本
                    const updatedPlans = [...state.keywordPlans];
                    
                    // 更新所有方案的isCurrent状态
                    updatedPlans.forEach(plan => {
                        plan.isCurrent = plan.keyid === parseInt(id);
                    });
                    
                    // 更新方案列表
                    commit('setKeywordPlans', updatedPlans);
                    
                    // 设置当前方案（从当前列表中找到它）
                    const currentPlan = updatedPlans.find(plan => plan.keyid === parseInt(id));
                    if (currentPlan) {
                        commit('setCurrentKeywordPlan', currentPlan);
                    }
                }
            } catch (error) {
                commit('addNotification', { 
                    type: 'error', 
                    title: '操作失败', 
                    message: '无法设置当前方案' 
                });
                console.error(error);
            } finally {
                commit('setLoading', false);
            }
        },
        
        async togglePlanStatus({ commit }, id) {
            commit('setLoading', true);
            try {
                const response = await api.togglePlanStatus(id);
                if (response.data && response.data.code === 200) {
                    commit('updateKeywordPlan', { 
                        id, 
                        data: { isEnabled: response.data.data.isEnabled } 
                    });
                }
            } catch (error) {
                commit('addNotification', { 
                    type: 'error', 
                    title: '操作失败', 
                    message: '无法更新方案状态' 
                });
                console.error(error);
            } finally {
                commit('setLoading', false);
            }
        },
        
        async fetchPlanDetail({ commit }, id) {
            commit('setLoading', true);
            try {
                const response = await api.getPlanDetailById(id);
                if (response.data && response.data.code === 200) {
                    return response.data.data;
                }
                return null;
            } catch (error) {
                commit('addNotification', { 
                    type: 'error', 
                    title: '加载失败', 
                    message: '无法加载方案详情' 
                });
                console.error(error);
                return null;
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
                                isEnabled: true,
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
        },

        /**
         * 获取舆情分析数据
         * @param {Object} context - Vuex context对象
         * @returns {Promise} 包含舆情分析数据的Promise
         */
        async getAnalysisData({ commit }) {
            commit('setLoading', true);
            try {
                const response = await api.getAnalysisData();
                if (response.data && response.data.code === 200) {
                    commit('setLoading', false);
                    return response.data;
                }
                return null;
            } catch (error) {
                commit('addNotification', { 
                    type: 'error', 
                    title: '加载失败', 
                    message: '无法加载舆情分析数据' 
                });
                console.error(error);
                return null;
            } finally {
                commit('setLoading', false);
            }
        },

        /**
         * 设置当前查看的文章
         * @param {Object} context - Vuex context对象
         * @param {Object} article - 文章对象
         */
        setCurrentArticle({ commit }, article) {
            commit('setCurrentArticle', article);
        },

        /**
         * 获取所有方案信息
         * @param {Object} context Vuex context
         */
        async fetchAllPlanInfo({ commit }) {
            commit('setLoading', true);
            try {
                const response = await api.getAllPlanInfo();
                if (response.data && response.data.code === 200) {
                    // 存储方案信息
                    return response.data.data;
                }
                return [];
            } catch (error) {
                commit('addNotification', { 
                    type: 'error', 
                    title: '加载失败', 
                    message: '无法加载方案信息' 
                });
                console.error(error);
                return [];
            } finally {
                commit('setLoading', false);
            }
        },
        
        /**
         * 获取单个方案信息
         * @param {Object} context Vuex context
         * @param {number} id 方案ID
         */
        async fetchPlanInfo({ commit }, id) {
            commit('setLoading', true);
            try {
                const response = await api.getPlanInfoById(id);
                if (response.data && response.data.code === 200) {
                    return response.data.data;
                }
                return null;
            } catch (error) {
                commit('addNotification', { 
                    type: 'error', 
                    title: '加载失败', 
                    message: '无法加载方案信息' 
                });
                console.error(error);
                return null;
            } finally {
                commit('setLoading', false);
            }
        },
        
        /**
         * 获取方案舆情数据
         * @param {Object} context Vuex context
         * @param {number} id 方案ID
         */
        async fetchSentimentData({ commit }, id) {
            commit('setLoading', true);
            try {
                const response = await api.getSentimentDataByPlanId(id);
                if (response.data && response.data.code === 200) {
                    return response.data.data;
                }
                return null;
            } catch (error) {
                commit('addNotification', { 
                    type: 'error', 
                    title: '加载失败', 
                    message: '无法加载舆情数据' 
                });
                console.error(error);
                return null;
            } finally {
                commit('setLoading', false);
            }
        },
        
        /**
         * 获取过滤后的舆情数据
         * @param {Object} context Vuex context
         * @param {Object} params 包含id和filters的参数对象
         */
        async filterSentimentData({ commit }, { id, filters }) {
            commit('setLoading', true);
            try {
                const response = await api.getFilteredSentimentData(id, filters);
                if (response.data && response.data.code === 200) {
                    return response.data.data;
                }
                return null;
            } catch (error) {
                commit('addNotification', { 
                    type: 'error', 
                    title: '加载失败', 
                    message: '无法加载过滤数据' 
                });
                console.error(error);
                return null;
            } finally {
                commit('setLoading', false);
            }
        },

        async savePlan({ commit, dispatch }, planData) {
            commit('setLoading', true);
            try {
                if (planData.keyid) {
                    // 更新现有方案
                    const response = await api.updatePlanInfo(planData.keyid, planData);
                    if (response.data && response.data.code === 200) {
                        commit('updateKeywordPlan', { 
                            id: planData.keyid, 
                            data: planData 
                        });
                        commit('addNotification', {
                            type: 'success',
                            title: '更新成功',
                            message: '方案已成功更新'
                        });
                        return true;
                    }
                } else {
                    // 创建新方案
                    // 模拟创建新方案的API调用
                    const newPlan = {
                        ...planData,
                        keyid: Date.now(), // 使用时间戳作为临时ID
                        createDate: new Date().toISOString().split('T')[0]
                    };
                    commit('addKeywordPlan', newPlan);
                    commit('addNotification', {
                        type: 'success',
                        title: '创建成功',
                        message: '新方案已创建'
                    });
                    return true;
                }
                return false;
            } catch (error) {
                commit('addNotification', {
                    type: 'error',
                    title: '操作失败',
                    message: planData.keyid ? '无法更新方案' : '无法创建方案'
                });
                console.error(error);
                return false;
            } finally {
                commit('setLoading', false);
            }
        }
    },
    getters: {
        activeKeywordPlans(state) {
            return state.keywordPlans.filter(plan => plan.isEnabled);
        }
    }
}); 