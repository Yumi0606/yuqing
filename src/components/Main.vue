<template>
  <div class="main-container">
    <aside class="sidebar">
      <h2>网络舆情监测系统</h2>
      <input type="text" v-model="searchQuery" placeholder="搜索关键词..." @input="filterKeywords" />
      <button @click="createNewKeyword">新建舆情关键词方案</button>
      <ul>
        <li v-for="keyword in filteredKeywords" :key="keyword.keyid">
          <span>{{ keyword.keyword }}</span>
          <button @click="editKeyword(keyword.keyid)">编辑</button>
          <button @click="confirmDelete(keyword.keyid)">删除</button>
        </li>
      </ul>
    </aside>
    <div class="content">
      <header class="navbar">
        <button @click="toggleSidebar">折叠</button>
        <nav>
          <div @click="navigateTo('analysis')">舆情分析</div>
          <div @click="navigateTo('view')">舆情查看</div>
          <div @click="navigateTo('management')">方案管理</div>
          <div @click="navigateTo('knowledge')">知识科普</div>
        </nav>
      </header>
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Main',
  data() {
    return {
      searchQuery: '',
      keywords: [], // 这里将从后端获取关键词列表
      filteredKeywords: [],
    };
  },
  methods: {
    filterKeywords() {
      this.filteredKeywords = this.keywords.filter(keyword => 
        keyword.keyword.includes(this.searchQuery)
      );
    },
    createNewKeyword() {
      // 跳转到新建关键词方案页面
    },
    editKeyword(keyid) {
      // 跳转到编辑页面
    },
    confirmDelete(keyid) {
      // 确认删除操作
    },
    toggleSidebar() {
      // 切换边栏显示
    },
    navigateTo(page) {
      this.$router.push(`/${page}`);
    },
  },
  mounted() {
    // 从后端获取关键词列表
    // this.keywords = await fetchKeywords();
    this.filteredKeywords = this.keywords; // 初始化显示所有关键词
  },
}
</script>

<style scoped>
.main-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #001f3f;
  color: white;
  padding: 20px;
}

.content {
  flex: 1;
  background-color: #f4f4f4;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #007bff;
  padding: 10px;
  display: flex;
  justify-content: space-between;
}

.main-content {
  flex: 1;
  padding: 20px;
}
</style> 