<template>
  <div class="view-page">
    <h1 class="page-title">舆情查看</h1>
    
    <div class="filters-bar">
      <div class="filter-group">
        <label>情感类型</label>
        <div class="btn-group">
          <button 
            v-for="item in sentimentTypes" 
            :key="item.value"
            class="btn-filter"
            :class="{ active: filters.sentiment === item.value }"
            @click="filters.sentiment = item.value"
          >
            <i :class="item.icon"></i>
            {{ item.label }}
          </button>
        </div>
      </div>
      
      <div class="filter-group">
        <label>来源平台</label>
        <select v-model="filters.platform" class="select-filter">
          <option value="">全部平台</option>
          <option v-for="platform in platforms" :key="platform" :value="platform">
            {{ platform }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>时间范围</label>
        <div class="date-range">
          <input type="date" v-model="filters.startDate" class="date-input">
          <span class="date-separator">至</span>
          <input type="date" v-model="filters.endDate" class="date-input">
        </div>
      </div>
    </div>
    
    <div class="stats-cards">
      <div class="stat-card" v-for="(stat, index) in statistics" :key="index">
        <div class="stat-icon" :class="stat.type">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
    
    <div class="data-list-section">
      <div class="section-header">
        <h2 class="section-title">舆情数据列表</h2>
        <div class="section-actions">
          <button class="btn-action">
            <i class="fas fa-download"></i> 导出数据
          </button>
          <button class="btn-action refresh" @click="refreshData">
            <i class="fas fa-sync-alt"></i> 刷新
          </button>
        </div>
      </div>
      
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>标题</th>
              <th>来源</th>
              <th>情感类型</th>
              <th>发布时间</th>
              <th>热度</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dataList" :key="item.id" @click="viewDetail(item)">
              <td>{{ item.id }}</td>
              <td class="title-cell">{{ item.title }}</td>
              <td>{{ item.source }}</td>
              <td>
                <span class="sentiment-tag" :class="item.sentiment">
                  {{ getSentimentLabel(item.sentiment) }}
                </span>
              </td>
              <td>{{ item.publishTime }}</td>
              <td>
                <div class="heat-meter">
                  <div class="heat-bar" :style="{ width: `${item.heat}%`, backgroundColor: getHeatColor(item.heat) }"></div>
                  <span class="heat-value">{{ item.heat }}</span>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-item-action view" @click.stop="viewDetail(item)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-item-action analyze" @click.stop="analyzeItem(item)">
                    <i class="fas fa-chart-line"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination">
        <button class="btn-page" :disabled="currentPage === 1" @click="currentPage--">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="page-indicators">
          <button 
            v-for="page in pages" 
            :key="page" 
            class="btn-page-num"
            :class="{ active: currentPage === page }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </div>
        <button class="btn-page" :disabled="currentPage === totalPages" @click="currentPage++">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';

export default {
  name: 'View',
  setup() {
    const filters = reactive({
      sentiment: '',
      platform: '',
      startDate: '',
      endDate: ''
    });
    
    const sentimentTypes = [
      { label: '全部', value: '', icon: 'fas fa-globe' },
      { label: '积极', value: 'positive', icon: 'fas fa-smile' },
      { label: '消极', value: 'negative', icon: 'fas fa-frown' },
      { label: '中性', value: 'neutral', icon: 'fas fa-meh' }
    ];
    
    const platforms = ['微博', '微信', '新闻网站', '论坛', '抖音'];
    
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const totalItems = 105;
    
    const totalPages = computed(() => Math.ceil(totalItems / itemsPerPage));
    
    const pages = computed(() => {
      const pageArray = [];
      const start = Math.max(1, currentPage.value - 2);
      const end = Math.min(totalPages.value, start + 4);
      
      for (let i = start; i <= end; i++) {
        pageArray.push(i);
      }
      
      return pageArray;
    });
    
    const statistics = [
      { label: '总数据量', value: 2345, type: 'total', icon: 'fas fa-database' },
      { label: '今日新增', value: 145, type: 'new', icon: 'fas fa-plus-circle' },
      { label: '积极信息', value: 986, type: 'positive', icon: 'fas fa-smile' },
      { label: '消极信息', value: 674, type: 'negative', icon: 'fas fa-frown' }
    ];
    
    // 模拟数据列表
    const generateMockData = () => {
      const data = [];
      const sources = ['微博', '微信', '新闻网站', '论坛', '抖音'];
      const sentiments = ['positive', 'negative', 'neutral'];
      
      for (let i = 1; i <= 105; i++) {
        const heat = Math.floor(Math.random() * 90) + 10;
        data.push({
          id: 10000 + i,
          title: `舆情数据标题示例，这是第${i}条数据，用于展示列表效果`,
          source: sources[Math.floor(Math.random() * sources.length)],
          sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
          publishTime: `2023-${Math.ceil(Math.random() * 12)}-${Math.ceil(Math.random() * 28)}`,
          heat: heat,
          content: '这是详细内容，点击查看详情可以看到完整信息。包含更多的文字内容、图片和相关数据分析。'
        });
      }
      
      return data;
    };
    
    const allData = generateMockData();
    
    const dataList = computed(() => {
      // 应用过滤器和分页
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return allData.slice(start, end);
    });
    
    const getSentimentLabel = (sentiment) => {
      const map = {
        positive: '积极',
        negative: '消极',
        neutral: '中性'
      };
      return map[sentiment] || sentiment;
    };
    
    const getHeatColor = (heat) => {
      if (heat > 80) return '#ef476f';
      if (heat > 50) return '#ffc43d';
      return '#06d6a0';
    };
    
    const viewDetail = (item) => {
      console.log('查看详情', item);
      // 实际应用中这里应该跳转到详情页或打开详情模态框
    };
    
    const analyzeItem = (item) => {
      console.log('分析数据', item);
      // 实际应用中这里应该跳转到分析页或打开分析模态框
    };
    
    const refreshData = () => {
      console.log('刷新数据');
      // 实际应用中这里应该重新请求后端数据
    };
    
    return {
      filters,
      sentimentTypes,
      platforms,
      statistics,
      dataList,
      currentPage,
      totalPages,
      pages,
      getSentimentLabel,
      getHeatColor,
      viewDetail,
      analyzeItem,
      refreshData
    };
  }
};
</script>

<style scoped>
.view-page {
  padding-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.filters-bar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.filter-group label {
  font-size: 14px;
  color: #8a94a6;
  margin-bottom: 8px;
}

.btn-group {
  display: flex;
  gap: 10px;
}

.btn-filter {
  background: #f5f7fb;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.btn-filter i {
  margin-right: 5px;
}

.btn-filter.active {
  background: var(--primary-color);
  color: white;
}

.select-filter, .date-input {
  background: #f5f7fb;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #555;
  outline: none;
  transition: all 0.3s;
}

.select-filter:focus, .date-input:focus {
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.2);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-separator {
  font-size: 14px;
  color: #8a94a6;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
}

.stat-icon.total {
  background: rgba(58, 134, 255, 0.1);
  color: var(--primary-color);
}

.stat-icon.new {
  background: rgba(131, 56, 236, 0.1);
  color: var(--secondary-color);
}

.stat-icon.positive {
  background: rgba(6, 214, 160, 0.1);
  color: var(--success-color);
}

.stat-icon.negative {
  background: rgba(239, 71, 111, 0.1);
  color: var(--danger-color);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #8a94a6;
}

.data-list-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.section-actions {
  display: flex;
  gap: 10px;
}

.btn-action {
  background: #f5f7fb;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.btn-action i {
  margin-right: 8px;
}

.btn-action.refresh:hover {
  background: var(--primary-color);
  color: white;
}

.data-table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.data-table th {
  background: #f5f7fb;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #eaedf3;
}

.data-table tr {
  cursor: pointer;
  transition: all 0.2s;
}

.data-table tr:hover {
  background: #f5f7fb;
}

.data-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eaedf3;
  color: #555;
}

.title-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sentiment-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.sentiment-tag.positive {
  background: rgba(6, 214, 160, 0.1);
  color: var(--success-color);
}

.sentiment-tag.negative {
  background: rgba(239, 71, 111, 0.1);
  color: var(--danger-color);
}

.sentiment-tag.neutral {
  background: rgba(17, 138, 178, 0.1);
  color: var(--info-color);
}

.heat-meter {
  display: flex;
  align-items: center;
  width: 100%;
}

.heat-bar {
  height: 4px;
  border-radius: 2px;
  margin-right: 10px;
  flex: 1;
}

.heat-value {
  font-size: 12px;
  font-weight: 600;
  color: #555;
  min-width: 30px;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.btn-item-action {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: #f5f7fb;
  color: #8a94a6;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-item-action.view:hover {
  background: rgba(58, 134, 255, 0.1);
  color: var(--primary-color);
}

.btn-item-action.analyze:hover {
  background: rgba(131, 56, 236, 0.1);
  color: var(--secondary-color);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 10px;
  align-items: center;
}

.btn-page {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: #f5f7fb;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-page:not(:disabled):hover {
  background: #eaedf3;
}

.page-indicators {
  display: flex;
  gap: 5px;
}

.btn-page-num {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: #f5f7fb;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page-num.active {
  background: var(--primary-color);
  color: white;
}

.btn-page-num:not(.active):hover {
  background: #eaedf3;
}

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style> 