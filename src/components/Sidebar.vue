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
          @input="searchPlans"
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
      <div class="plan-list" v-if="filteredPlans.length">
        <transition-group name="plan-list" tag="ul">
          <li v-for="plan in filteredPlans" :key="plan.keyid" class="plan-item">
            <div class="plan-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="plan-name">{{ plan.keyword }}</div>
            <div class="plan-actions">
              <div 
                class="plan-status" 
                :class="{ 'active': plan.active }" 
                @click="togglePlanStatus(plan)"
                :title="plan.active ? '已启用' : '已禁用'"
              >
                <i class="fas" :class="plan.active ? 'fa-check-circle' : 'fa-times-circle'"></i>
              </div>
              <button class="btn-edit" @click="editPlan(plan)" title="编辑方案">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-delete" @click="deletePlan(plan)" title="删除方案">
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
import { useRouter } from 'vue-router';

export default {
  name: 'Sidebar',
  setup() {
    const store = useStore();
    const router = useRouter();
    const searchKeyword = ref('');

    const sidebarCollapsed = computed(() => store.state.sidebarCollapsed);
    const allKeywordPlans = computed(() => store.state.keywordPlans);
    
    const filteredPlans = computed(() => {
      if (!searchKeyword.value) return allKeywordPlans.value;
      const keyword = searchKeyword.value.toLowerCase();
      return allKeywordPlans.value.filter(plan => 
        plan.keyword.toLowerCase().includes(keyword)
      );
    });

    onMounted(() => {
      store.dispatch('fetchKeywordPlans');
    });

    const searchPlans = () => {
      // 搜索时无需执行任何操作，因为已经通过 computed 属性实现了过滤
    };

    const clearSearch = () => {
      searchKeyword.value = '';
    };

    const createNewPlan = () => {
      router.push('/dashboard/management');
    };

    const togglePlanStatus = (plan) => {
      store.commit('updateKeywordPlan', { 
        id: plan.keyid, 
        data: { active: !plan.active } 
      });
    };

    const editPlan = (plan) => {
      store.commit('setCurrentKeywordPlan', plan);
      router.push('/dashboard/management');
    };

    const deletePlan = (plan) => {
      if (confirm(`确定要删除"${plan.keyword}"方案吗？`)) {
        store.commit('removeKeywordPlan', plan.keyid);
      }
    };

    return {
      sidebarCollapsed,
      searchKeyword,
      filteredPlans,
      searchPlans,
      clearSearch,
      createNewPlan,
      togglePlanStatus,
      editPlan,
      deletePlan
    };
  }
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: linear-gradient(180deg, #1a2980 0%, #26d0ce 100%);
  color: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-speed);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  height: var(--header-height);
  padding: 0 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
}

.logo-icon {
  font-size: 24px;
  margin-right: 15px;
  min-width: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  transition: opacity var(--transition-speed);
}

.sidebar.collapsed .logo-text {
  opacity: 0;
  width: 0;
}

.sidebar-search {
  padding: 20px;
}

.search-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: 8px 15px;
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
  color: rgba(255, 255, 255, 0.7);
}

.clear-search {
  cursor: pointer;
  margin-left: 10px;
  margin-right: 0 !important;
}

.sidebar.collapsed .sidebar-search {
  display: none;
}

.sidebar-action {
  padding: 0 20px 20px;
}

.btn-create {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-create:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.btn-create i {
  margin-right: 10px;
  font-size: 14px;
}

.sidebar.collapsed .btn-create span {
  display: none;
}

.sidebar.collapsed .sidebar-action {
  padding: 10px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 20px;
}

.plan-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-item {
  background: rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.plan-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.plan-icon {
  margin-right: 15px;
  color: rgba(255, 255, 255, 0.8);
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
}

.plan-status {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.plan-status.active {
  color: var(--success-color);
}

.plan-status:not(.active) {
  color: rgba(255, 255, 255, 0.5);
}

.btn-edit, .btn-delete {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit:hover {
  color: white;
}

.btn-delete:hover {
  color: var(--danger-color);
}

.sidebar.collapsed .plan-name,
.sidebar.collapsed .plan-actions {
  display: none;
}

.sidebar.collapsed .plan-item {
  justify-content: center;
  padding: 15px 0;
}

.sidebar.collapsed .plan-icon {
  margin-right: 0;
}

.no-plans-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 0 20px;
}

.no-plans-message i {
  font-size: 32px;
  margin-bottom: 15px;
}

/* 动画 */
.plan-list-enter-active,
.plan-list-leave-active {
  transition: all 0.3s;
}

.plan-list-enter-from,
.plan-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
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
</style> 