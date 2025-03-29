<template>
  <header class="main-header">
    <div class="left-section">
      <button class="menu-toggle" @click="toggleSidebar">
        <i class="fas" :class="sidebarCollapsed ? 'fa-bars' : 'fa-times'"></i>
      </button>
    </div>
    
    <nav class="main-nav">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path" 
        :to="item.path" 
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <i :class="`fas ${item.icon}`"></i>
        <span>{{ item.title }}</span>
      </router-link>
    </nav>
    
    <div class="right-section">
      <div class="header-icon notifications">
        <i class="fas fa-bell"></i>
        <span class="badge" v-if="hasNotifications">{{ notificationCount }}</span>
      </div>
      <div class="header-icon user-menu">
        <i class="fas fa-user-circle"></i>
      </div>
    </div>
  </header>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

export default {
  name: 'Header',
  setup() {
    const store = useStore();
    const route = useRoute();
    
    const sidebarCollapsed = computed(() => store.state.sidebarCollapsed);
    const notifications = computed(() => store.state.notifications);
    const hasNotifications = computed(() => notifications.value.length > 0);
    const notificationCount = computed(() => notifications.value.length);
    
    const menuItems = [
      { 
        title: '舆情分析', 
        path: '/dashboard/analysis',
        icon: 'fa-chart-pie'
      },
      { 
        title: '舆情查看', 
        path: '/dashboard/view',
        icon: 'fa-eye'
      },
      { 
        title: '方案管理', 
        path: '/dashboard/management',
        icon: 'fa-tasks'
      },
      { 
        title: '知识科普', 
        path: '/dashboard/knowledge',
        icon: 'fa-book'
      }
    ];
    
    const toggleSidebar = () => {
      store.commit('toggleSidebar');
    };
    
    const isActive = (path) => {
      return route.path === path;
    };
    
    return {
      sidebarCollapsed,
      menuItems,
      hasNotifications,
      notificationCount,
      toggleSidebar,
      isActive
    };
  }
};
</script>

<style scoped>
.main-header {
  height: var(--header-height);
  background: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #eaedf3;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.left-section {
  display: flex;
  align-items: center;
}

.menu-toggle {
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #555;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-toggle:hover {
  background: #f5f5f5;
  color: var(--primary-color);
}

.main-nav {
  display: flex;
  align-items: center;
  margin-left: 30px;
  flex: 1;
}

.nav-item {
  padding: 8px 20px;
  margin-right: 15px;
  color: #555;
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.nav-item i {
  margin-right: 10px;
  font-size: 16px;
}

.nav-item:hover {
  background: #f5f5f5;
  color: var(--primary-color);
}

.nav-item.active {
  background: var(--primary-color);
  color: white;
}

.right-section {
  display: flex;
  align-items: center;
}

.header-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #555;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  margin-left: 10px;
  transition: all 0.3s;
}

.header-icon:hover {
  background: #f5f5f5;
  color: var(--primary-color);
}

.notifications .badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--danger-color);
  color: white;
  font-size: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-menu {
  font-size: 22px;
}

@media (max-width: 991px) {
  .main-nav {
    display: none;
  }
  
  .main-header {
    justify-content: space-between;
  }
}

@media (max-width: 576px) {
  .menu-toggle {
    width: 36px;
    height: 36px;
  }
  
  .header-icon {
    width: 36px;
    height: 36px;
  }
}
</style> 