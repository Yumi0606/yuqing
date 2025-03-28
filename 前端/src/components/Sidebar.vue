<template>
  <div class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
    <div class="sidebar-header">
      <div class="logo-container">
        <i class="fas fa-chart-line logo-icon"></i>
        <span class="logo-text">网络舆情监测系统</span>
      </div>
    </div>
    
    <div class="sidebar-search">
      <div class="search-container">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索关键词方案..." 
          @keydown.enter="searchPlans"
        >
        <i v-if="searchKeyword" class="fas fa-times clear-search" @click="clearSearch"></i>
      </div>
    </div>

    <div class="sidebar-action">
      <button class="btn btn-create" @click="createNewPlan">
        <i class="fas fa-plus"></i>
        <span>新建舆情关键词方案</span>
      </button>
    </div>
    <div class="sidebar-content">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div class="plan-list" v-else-if="filteredPlans.length">
        <transition-group name="plan-list" tag="ul">
          <li v-for="plan in filteredPlans" 
              :key="plan.group_name" 
              class="plan-item"
              :data-group_name="plan.group_name"
              :class="{'active': isActivePlan(plan)}"
              @click="selectPlan(plan)">
            <div class="plan-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="plan-name">{{ plan.group_name }}</div>
            <div class="plan-actions">
              <div 
                class="plan-status" 
                :class="{ 'active': plan.is_collecting }" 
                @click.stop="togglePlanStatus(plan)"
                :title="plan.is_collecting ? '已启用' : '已禁用'"
              >
                <i class="fas" :class="plan.is_collecting ? 'fa-check-circle' : 'fa-times-circle'"></i>
              </div>
              <button class="btn-edit" @click.stop="editPlan(plan)" title="编辑方案">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-delete" @click.stop="deletePlan(plan)" title="删除方案">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </li>
        </transition-group>
      </div>
      <div v-else class="no-plans-message">
        <i class="fas fa-search"></i>
        <p>{{ searchKeyword ? '未找到匹配的方案' : '暂无关键词方案' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import api from '../service/api'
export default {
  name: 'Sidebar',
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const searchKeyword = ref(null);
    const loading = computed(() => store.state.loading);

    const sidebarCollapsed = computed(() => store.state.sidebarCollapsed);
    const allKeywordPlans = computed(() => store.state.keywordPlans);
    const currentPlan = computed(() => store.state.currentKeywordPlan);
    
    const filteredPlans = computed(() => {
      return store.state.keywordPlans || [];
      // const plans = store.state.keywordPlans || [];
      // if (!searchKeyword.value) return plans;
      // const keyword = searchKeyword.value.toLowerCase();
      // return plans.filter(plan => 
      //   plan.keyword.toLowerCase().includes(keyword)
      // );
    });
    onMounted(() => {
      store.dispatch('fetchKeywordPlans',searchKeyword.value);
    });


    const searchPlans = () => {
      // 搜索时无需执行任何操作，因为已经通过 computed 属性实现了过滤
      store.dispatch('fetchKeywordPlans',searchKeyword.value);
    };

    const clearSearch = () => {
      searchKeyword.value = '';
      store.dispatch('fetchKeywordPlans',searchKeyword.value);

    };

    const createNewPlan = () => {
      router.push('/dashboard/management');
      // 触发Vuex action打开创建方案表单
      store.commit('setShowPlanForm', true);
      store.commit('setPlanFormMode', 'create');
      // store.commit('setCurrentKeywordPlan', null);
    };

    const togglePlanStatus = (plan) => {
      api.updateKeyword({
        group_name: plan.group_name,
        keywords: plan.keywords,
        is_collecting: !plan.is_collecting
      }).then((res) => {
          if(res.status === 200){
            store.dispatch('fetchKeywordPlans');
          }
        });
    };

    const editPlan = (plan) => {
      // 设置当前方案，并跳转到方案管理页
      store.commit('setCurrentKeywordPlan', plan);
      router.push('/dashboard/management');
      
      // 打开编辑表单
      store.commit('setShowPlanForm', true);
      store.commit('setPlanFormMode', 'edit');
    };

    const deletePlan = (plan) => {
      if (confirm(`确定要删除"${plan.group_name}"方案吗？`)) {
        api.deleteKeyword({
          group_name: plan.group_name
        }).then((res) => {
          if(res.status === 200){
            store.dispatch('fetchKeywordPlans');
          }
        });
      }
    };
    
    const selectPlan = (plan) => {
      // 添加点击反馈效果
      const element = document.querySelector(`.plan-item[data-group_name="${plan.group_name}"]`);
      if (element) {
        element.classList.add('click-effect');
        setTimeout(() => {
          element.classList.remove('click-effect');
        }, 300);
      }
      
      // 设置当前选中的方案
      store.commit('setCurrentKeywordPlan', plan);
      // store.dispatch('setCurrentPlan', plan.group_name);
      
      // 如果当前不在dashboard路径下，则跳转到view页面
      // 否则保持当前页面，只更新方案
      if (!route.path.startsWith('/dashboard/')) {
        router.push('/dashboard/view');
      }
    };
    
    const isActivePlan = (plan) => {
      return currentPlan.value && plan.group_name === currentPlan.value.group_name;
    };

   

    return {
      sidebarCollapsed,
      searchKeyword,
      filteredPlans,
      loading,
      searchPlans,
      clearSearch,
      createNewPlan,
      togglePlanStatus,
      editPlan,
      deletePlan,
      selectPlan,
      isActivePlan
    };
  }
};
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background: linear-gradient(to bottom, #3a86ff, #5e60ce);
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: 0;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  margin-bottom: 20px;
}

.logo-container {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.logo-icon {
  font-size: 24px;
  margin-right: 10px;
  color: white;
}

.sidebar-search {
  padding: 0 20px;
  margin-bottom: 20px;
}

.search-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.search-container:hover,
.search-container:focus-within {
  background: rgba(255, 255, 255, 0.2);
}

.search-container i {
  margin-right: 10px;
  color: rgba(255, 255, 255, 0.7);
}

.search-container input {
  background: transparent;
  border: none;
  color: white;
  outline: none;
  width: 100%;
  font-size: 14px;
}

.search-container input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-search {
  cursor: pointer;
  margin-left: 5px !important;
  margin-right: 0 !important;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.clear-search:hover {
  opacity: 1;
}

.sidebar-action {
  padding: 0 20px 20px 20px; /* 与列表左对齐 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-create {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  padding: 12px 15px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create:hover {
  background: rgba(255, 255, 255, 0.25);
}

.btn-create i {
  margin-right: 8px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0; /* 完全移除内边距 */
}

.plan-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%; /* 确保列表宽度占满 */
}

/* 直接针对ul标签 */
.plan-list > ul {
  list-style: none;
  padding: 0 !important;
  margin: 0 !important;
  width: 100%;
}

.plan-item {
  display: flex;
  align-items: center;
  padding: 12px 20px 12px 16px; /* 调整左内边距，为active状态的border-left留出空间 */
  border-radius: 0;
  margin: 0;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease-out;
}

.plan-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.plan-item.active {
  background: rgba(255, 255, 255, 0.2);
  border-left: 4px solid white;
  padding-left: 12px; /* 当有左边框时减少左内边距以保持内容对齐 */
}

.plan-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  margin-right: 12px;
}

.plan-name {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-actions {
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.plan-item:hover .plan-actions {
  opacity: 1;
}

.plan-status {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 5px;
  color: rgba(255, 255, 255, 0.5);
}

.plan-status.active {
  color: #06d6a0;
}

.btn-edit, .btn-delete {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-edit:hover, .btn-delete:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-delete {
  color: #ff8fa3;
}

.no-plans-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.no-plans-message i {
  font-size: 30px;
  margin-bottom: 15px;
}

.plan-list-enter-from, 
.plan-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.plan-list-enter-active, 
.plan-list-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.plan-list-move {
  transition: transform 0.4s;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 991px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: none;
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  }
}

.click-effect {
  animation: click-pulse 0.3s;
}

@keyframes click-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); }
}
</style> 