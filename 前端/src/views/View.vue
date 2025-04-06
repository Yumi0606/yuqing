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
            :class="{ active: filters.emotion_type === item.label }"
            @click="changeSentiment(item.label)"
          >
            <i :class="item.icon"></i>
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <label>来源平台</label>
        <select
          v-model="filters.platform"
          class="select-filter"
          @change="changePlatform"
        >
          <option value="">全部平台</option>
          <option
            v-for="platform in platforms"
            :key="platform"
            :value="platform.value"
          >
            {{ platform.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>时间范围</label>
        <div class="date-range">
          <input
            type="date"
            v-model="filters.start_time"
            class="date-input"
            @change="changeDate($event, 'start')"
          />
          <span class="date-separator">至</span>
          <input
            type="date"
            v-model="filters.end_time"
            class="date-input"
            @change="changeDate($event, 'start')"
          />
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
            <tr
              v-for="item in dataList"
              :key="item.id"
              @click="viewDetail(item)"
            >
              <td>{{ item.id }}</td>
              <td class="title-cell">{{ item.title }}</td>
              <td>{{ item.platform }}</td>
              <td>
                <span class="sentiment-tag" :class="item.emotion">
                  {{ getSentimentLabel(item.emotion) }}
                </span>
              </td>
              <td>{{ item.time }}</td>
              <td>
                <div class="heat-meter">
                  <div
                    class="heat-bar"
                    :style="{
                      width: `${item.hot}%`,
                      backgroundColor: getHeatColor(item.hot),
                    }"
                  ></div>
                  <span class="heat-value">{{ item.hot }}</span>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    class="btn-item-action view"
                    @click.stop="viewDetail(item)"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    class="btn-item-action analyze"
                    @click.stop="analyzeItem(item)"
                  >
                    <i class="fas fa-chart-line"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- <div class="pagination">
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
      </div> -->
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import api from "../service/api";

export default {
  name: "View",
  setup() {
    const store = useStore();
    const loading = ref(false);
    const dataList = ref([]);
    const totalItems = ref(0);

    // 获取当前选中的方案
    const currentPlan = computed(() => store.state.currentKeywordPlan);
    console.log("currentPlan:", currentPlan.value);

    // 过滤条件
    const filters = reactive({
      emotion_type: "全部",
      platform: "bilibili",
      start_time: "",
      end_time: "",
    });

    const sentimentTypes = [
      { label: "全部", value: "", icon: "fas fa-globe" },
      { label: "积极", value: "positive", icon: "fas fa-smile" },
      { label: "消极", value: "negative", icon: "fas fa-frown" },
      { label: "中性", value: "neutral", icon: "fas fa-meh" },
    ];

    // const platforms = ['微博', '微信', '新闻网站', '论坛', '抖音'];
    const platforms = [{ name: "哔哩哔哩", value: "bilibili" }];

    // 分页
    const currentPage = ref(1);
    const itemsPerPage = 10;

    const totalPages = computed(() =>
      Math.ceil(totalItems.value / itemsPerPage)
    );

    const pages = computed(() => {
      const pageArray = [];
      const start = Math.max(1, currentPage.value - 2);
      const end = Math.min(totalPages.value, start + 4);

      for (let i = start; i <= end; i++) {
        pageArray.push(i);
      }

      return pageArray;
    });

    // 统计数据
    const statistics = ref([
      { label: "总数据量", value: 0, type: "total", icon: "fas fa-database" },
      { label: "今日新增", value: 0, type: "new", icon: "fas fa-plus-circle" },
      { label: "积极信息", value: 0, type: "positive", icon: "fas fa-smile" },
      { label: "消极信息", value: 0, type: "negative", icon: "fas fa-frown" },
    ]);

    // 监听当前选中方案的变化，重新获取数据
    watch(currentPlan, () => {
      if (currentPlan.value) {
        getSentimentData();
      }
    });

    const changeSentiment = (label) => {
      filters.emotion_type = label;
      getSentimentData();
    };
    const changePlatform = (event) => {
      console.log(event.target.value);

      filters.platform = event.target.value;
      getSentimentData();
    };

    const changeDate = (event, type) => {
      if (type === "start") {
        filters.start_time = event.target.value;
      } else {
        filters.end_time = event.target.value;
      }
      getSentimentData();
    };

    // 获取舆情数据
    const getSentimentData = async () => {
      if (!currentPlan.value) return;
      loading.value = true;

      try {
        // console.log("发送请求参数:", {
        //   group_name: currentPlan.value.group_name,
        //   ...filters,
        // });
        
        const response = await api.sentimentView({
          group_name: currentPlan.value.group_name,
          ...filters,
        });
        
        // console.log("API返回的完整响应:", response);
        
        if (response) {
          // console.log("响应数据:", response.data);
          
          // 更新统计信息
          statistics.value[0].value = response.data.total_data_count || 0;
          statistics.value[1].value = response.data.today_new_count || 0;
          statistics.value[2].value = response.data.positive_count || 0;
          statistics.value[3].value = response.data.negative_count || 0;
          
          // 检查过滤后的数据
          console.log("过滤后的数据:", response.data.filtered_data);
          
          if (Array.isArray(response.data.filtered_data) && response.data.filtered_data.length > 0) {
            // console.log("数据示例:", response.data.filtered_data[0]);
            
            // 数据映射：将后端数据格式转换为前端表格所需的格式
            const mappedData = response.data.filtered_data.map(item => {
              const result = {
                id: item.comment_id?.toString() || '',
                title: item.content || '',
                platform: 'BiliBili',  // 根据bvid确定平台
                emotion: item.emotion || 'neutral',
                time: item.time || '',
                hot: item.likes || 0,  // 热度使用点赞数
                url: item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : '#',
                // 保存原始数据，方便调试
                original: item
              };
              
              // console.log("映射后的数据项:", result);
              return result;
            });
            
            dataList.value = mappedData;
            console.log("最终数据列表:", dataList.value);
          } else {
            console.warn("过滤后的数据为空或不是数组");
            dataList.value = [];
          }
        } else {
          console.warn("API响应为空");
        }
      } catch (error) {
        console.error("获取数据失败:", error);
        dataList.value = [];
      } finally {
        loading.value = false;
        console.log("当前数据列表状态:", {
          length: dataList.value.length,
          isEmpty: dataList.value.length === 0,
          isArray: Array.isArray(dataList.value)
        });
      }
    };

    const fetchData = async () => {
      if (!currentPlan.value) return;
      c;

      loading.value = true;
      try {
        // 如果有过滤条件，使用过滤API
        if (hasFilters()) {
          const response = await store.dispatch("filterSentimentData", {
            id: currentPlan.value.keyid,
            filters: filters,
          });

          if (response) {
            updateData(response);
          }
        } else {
          // 否则获取全部数据
          const response = await store.dispatch(
            "fetchSentimentData",
            currentPlan.value.keyid
          );
          if (response) {
            updateData(response);
          }
        }
      } catch (error) {
        console.error("获取数据失败:", error);
      } finally {
        loading.value = false;
      }
    };

    // 判断是否有过滤条件
    const hasFilters = () => {
      return (
        filters.sentiment ||
        filters.platform ||
        (filters.start_time && filters.end_time)
      );
    };

    // 更新数据和统计信息
    const updateData = (data) => {
      if (data && data.articles) {
        dataList.value = data.articles;
        totalItems.value = data.articles.length;

        // 更新统计信息
        if (data.overview) {
          statistics.value[0].value = data.overview.total || 0;
          statistics.value[1].value = data.overview.newToday || 0;
          statistics.value[2].value = data.overview.positive || 0;
          statistics.value[3].value = data.overview.negative || 0;
        }
      } else {
        dataList.value = [];
        totalItems.value = 0;
      }
    };

    onMounted(() => {
      // 页面加载时，如果有当前方案则获取数据
      if (currentPlan.value) {
        getSentimentData();
      }
    });

    const getSentimentLabel = (emotion_type) => {
      const map = {
        positive: "积极",
        negative: "消极",
        neutral: "中性",
      };
      return map[emotion_type] || emotion_type;
    };

    const getHeatColor = (heat) => {
      if (heat > 80) return "#ef476f";
      if (heat > 50) return "#ffc43d";
      return "#06d6a0";
    };

    const viewDetail = (item) => {
      console.log("查看详情", item);
      // 在新标签页打开URL
      if (item.url) {
        window.open(item.url, "_blank");
      }
    };

    const analyzeItem = (item) => {
      console.log("分析数据", item);
      // 跳转到分析页
      store.commit("setCurrentArticle", item);
    };

    const refreshData = () => {
      getSentimentData();
    };

    const applyFilters = () => {
      currentPage.value = 1; // 重置到第一页
      getSentimentData();
    };

    const resetFilters = () => {
      filters.emotion_type = "";
      filters.platform = "";
      filters.start_time = "";
      filters.end_time = "";
      applyFilters();
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
      loading,
      changePlatform,
      changeDate,
      changeSentiment,
      getSentimentLabel,
      getHeatColor,
      viewDetail,
      analyzeItem,
      refreshData,
      applyFilters,
      resetFilters,
    };
  },
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

.select-filter,
.date-input {
  background: #f5f7fb;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #555;
  outline: none;
  transition: all 0.3s;
}

.select-filter:focus,
.date-input:focus {
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