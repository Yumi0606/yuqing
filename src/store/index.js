import { createStore } from 'vuex';

// 创建 Vuex Store 实例
export default createStore({
    state: {
        isCollapse: false
    },
    mutations: {
        updateIsCollapse(state, value) {
            state.isCollapse = value;
        }
    }
});