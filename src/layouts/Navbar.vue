<template>
  <header class="navbar">
    <div class="navbar-left">
      <button class="toggle-sidebar-btn" @click="toggleSidebar">
        <i :class="sidebarCollapsed ? 'fas fa-bars' : 'fas fa-times'"></i>
      </button>
    </div>
    
    <div class="navbar-middle">
      <div class="nav-links">
        <router-link 
          to="/dashboard/analysis" 
          class="nav-link"
          active-class="active"
        >
          <i class="fas fa-chart-line"></i>
          <span>舆情分析</span>
        </router-link>
        
        <router-link 
          to="/dashboard/view" 
          class="nav-link"
          active-class="active"
        >
          <i class="fas fa-eye"></i>
          <span>舆情查看</span>
        </router-link>
        
        <router-link 
          to="/dashboard/management" 
          class="nav-link"
          active-class="active"
        >
          <i class="fas fa-tasks"></i>
          <span>方案管理</span>
        </router-link>
        
        <router-link 
          to="/dashboard/knowledge" 
          class="nav-link"
          active-class="active"
        >
          <i class="fas fa-book"></i>
          <span>知识科普</span>
        </router-link>
      </div>
    </div>
    
    <div class="navbar-right">
      <div class="user-dropdown">
        <button class="user-btn">
          <i class="fas fa-user-circle"></i>
          <span>管理员</span>
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import gsap from 'gsap';

export default {
  name: 'Navbar',
  setup() {
    const store = useStore();
    
    const sidebarCollapsed = computed(() => store.state.sidebarCollapsed);
    
    const toggleSidebar = () => {
      store.commit('toggleSidebar');
      
      // 添加切换动画
      if (!sidebarCollapsed.value) {
        gsap.to('.nav-link span', {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          stagger: 0.05
        });
      }
    };
    
    return {
      sidebarCollapsed,
      toggleSidebar
    };
  }
}
</script>

<style scoped>
.navbar {
  height: var(--header-height);
  background-color: var(--light-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.toggle-sidebar-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--primary-color);
  transition: background-color 0.3s, color 0.3s;
}

.toggle-sidebar-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.navbar-middle {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-links {
  display: flex;
  gap: 10px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s, transform 0.2s;
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.nav-link.active {
  color: var(--primary-color);
  background-color: rgba(30, 58, 138, 0.1);
}

.nav-link i {
  font-size: 16px;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-color);
  transition: background-color 0.3s;
}

.user-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.user-btn i:first-child {
  font-size: 20px;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .nav-link span {
    display: none;
  }
  
  .user-btn span {
    display: none;
  }
}

@media (max-width: 576px) {
  .navbar {
    padding: 0 10px;
  }
  
  .nav-links {
    gap: 5px;
  }
  
  .nav-link {
    padding: 8px 12px;
  }
}
</style> 