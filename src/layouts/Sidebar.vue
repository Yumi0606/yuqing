<template>
  <div class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
    <div class="sidebar-header">
      <div class="logo-container">
        <i class="fas fa-chart-bar logo-icon"></i>
        <span class="logo-text" v-show="!sidebarCollapsed">网络舆情监测系统</span>
      </div>
    </div>
    
    <div class="sidebar-search" v-show="!sidebarCollapsed">
      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          placeholder="搜索舆情方案..." 
          v-model="searchQuery"
          @input="filterKeywordPlans"
        >
      </div>
    </div>
    
    <button class="btn-create" @click="createNewPlan">
      <i class="fas fa-plus"></i>
      <span v-show="!sidebarCollapsed">新建舆情方案</span>
    </button>
    
    <div class="sidebar-menu">
      <ul class="plan-list">
        <li 
          v-for="plan in filteredPlans" 
          :key="plan.keyid"
          class="plan-item"
          :class="{ 'active': currentPlanId === plan.keyid }"
          @click="selectPlan(plan)"
        >
          <div class="plan-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="plan-info" v-show="!sidebarCollapsed">
            <div class="plan-name">{{ plan.keyword }}</div>
          </div>
          <div class="plan-actions" v-show="!sidebarCollapsed">
            <button 
              class="plan-status" 
              :class="{ 'active': plan.active }"
              @click.stop="togglePlanStatus(plan)"
            >
              <i :class="plan.active ? 'fas fa-check-circle' : 'far fa-circle'"></i>
            </button>
            <button class="plan-edit" @click.stop="editPlan(plan)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="plan-delete" @click.stop="confirmDeletePlan(plan)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import gsap from 'gsap';

export default {
  name: 'Sidebar',
  setup() {
    const store = useStore();
    const router = useRouter();
    const searchQuery = ref('');
    const currentPlanId = ref(null);
    
    const sidebarCollapsed = computed(() => store.state.sidebarCollapsed);
    const keywordPlans = computed(() => store.state.keywordPlans);
    
    const filteredPlans = ref([]);
    
    onMounted(() => {
      store.dispatch('fetchKeywordPlans');
      // 初始加载时设置筛选后的方案列表
      filteredPlans.value = keywordPlans.value;
      
      // 添加动画效果
      animateSidebar();
    });
    
    const animateSidebar = () => {
      gsap.from('.sidebar', { 
        x: -50, 
        opacity: 0, 
        duration: 0.5,
        ease: 'power2.out' 
      });
      
      gsap.from('.plan-item', { 
        y: 20, 
        opacity: 0, 
        duration: 0.5,
        stagger: 0.1,
        delay: 0.3,
        ease: 'power2.out' 
      });
    };
    
    const filterKeywordPlans = () => {
      if (searchQuery.value.trim() === '') {
        filteredPlans.value = keywordPlans.value;
      } else {
        filteredPlans.value = keywordPlans.value.filter(plan => 
          plan.keyword.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }
    };
    
    const createNewPlan = () => {
      router.push('/dashboard/management');
      // 可以添加新建方案的逻辑
    };
    
    const selectPlan = (plan) => {
      currentPlanId.value = plan.keyid;
      store.commit('setCurrentKeywordPlan', plan);
    };
    
    const togglePlanStatus = (plan) => {
      store.commit('updateKeywordPlan', { 
        id: plan.keyid, 
        data: { active: !plan.active } 
      });
    };
    
    const editPlan = (plan) => {
      // 设置当前方案并跳转到编辑页面
      store.commit('setCurrentKeywordPlan', plan);
      router.push('/dashboard/management');
    };
    
    const confirmDeletePlan = (plan) => {
      if (confirm(`确定要删除方案 "${plan.keyword}" 吗？`)) {
        store.commit('removeKeywordPlan', plan.keyid);
      }
    };
    
    return {
      sidebarCollapsed,
      searchQuery,
      filteredPlans,
      currentPlanId,
      filterKeywordPlans,
      createNewPlan,
      selectPlan,
      togglePlanStatus,
      editPlan,
      confirmDeletePlan
    };
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--sidebar-width);
  background-color: var(--primary-color);
  color: var(--light-text);
  z-index: 100;
  transition: width var(--transition-duration), transform var(--transition-duration);
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  padding: 15px;
  height: var(--header-height);
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
  color: var(--accent-color);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.sidebar-search {
  padding: 15px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.sidebar-search input {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border-radius: 8px;
  border: none;
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--light-text);
  outline: none;
  transition: background-color 0.3s;
}

.sidebar-search input:focus {
  background-color: rgba(255, 255, 255, 0.2);
}

.sidebar-search input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.btn-create {
  margin: 0 15px 15px;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background-color: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn-create:hover {
  background-color: #0c93d4;
  transform: translateY(-2px);
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 0 15px;
}

.plan-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-item {
  display: flex;
  align-items: center;
  padding: 12px 10px;
  border-radius: 8px;
  margin-bottom: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.plan-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.plan-item.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.plan-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: var(--accent-color);
}

.plan-info {
  flex: 1;
  min-width: 0;
}

.plan-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plan-status,
.plan-edit,
.plan-delete {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 4px;
  transition: color 0.3s, background-color 0.3s;
}

.plan-status:hover,
.plan-edit:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.plan-delete:hover {
  color: var(--danger-color);
  background-color: rgba(255, 255, 255, 0.1);
}

.plan-status.active {
  color: var(--success-color);
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
}
</style> 