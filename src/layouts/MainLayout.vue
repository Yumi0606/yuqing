<template>
  <div class="main-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <Sidebar />
    <div class="main-content">
      <Header />
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';

export default {
  name: 'MainLayout',
  components: {
    Sidebar,
    Header
  },
  setup() {
    const store = useStore();
    const sidebarCollapsed = computed(() => store.state.sidebarCollapsed);

    return {
      sidebarCollapsed
    };
  }
};
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left var(--transition-speed);
  width: calc(100% - var(--sidebar-width));
  margin-left: var(--sidebar-width);
}

.main-layout.sidebar-collapsed .main-content {
  margin-left: var(--sidebar-collapsed-width);
  width: calc(100% - var(--sidebar-collapsed-width));
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fb;
}

@media (max-width: 991px) {
  .main-content {
    width: 100%;
    margin-left: 0;
  }

  .main-layout.sidebar-collapsed .main-content {
    margin-left: 0;
    width: 100%;
  }
}
</style> 