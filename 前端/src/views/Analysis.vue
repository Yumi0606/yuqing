<template>
  <div class="analysis-page">
    <div class="action-bar">
      <button 
        class="btn btn-primary"
        @click="showCollectDialog"
      >
        <i class="fas fa-cloud-download-alt"></i>
        立即搜集
      </button>
      
      <button 
        class="btn btn-secondary"
        @click="refreshData"
      >
        <i class="fas fa-sync"></i>
        刷新数据
      </button>
      
      <div v-if="collectStatus" class="status-indicator">
        <span :class="statusClass">{{ collectStatus }}</span>
        <i v-if="isCollecting" class="fas fa-spinner fa-spin"></i>
      </div>
    </div>

    <div v-if="showDialog" class="collect-dialog">
      <div class="dialog-content">
        <h3>设置收集参数</h3>
        <div class="form-group">
          <label>数据量（条）</label>
          <div class="quick-amount-buttons">
            <button 
              v-for="amount in [500, 1000, 2000]" 
              :key="amount"
              class="btn-quick-amount"
              :class="{ active: collectParams.amount === amount }"
              @click="collectParams.amount = amount"
            >
              {{ amount }}
            </button>
          </div>
          <input 
            v-model.number="collectParams.amount" 
            type="number" 
            min="100" 
            max="10000"
            class="form-control"
          >
        </div>
        <div class="dialog-actions">
          <button class="btn btn-secondary" @click="showDialog = false">取消</button>
          <button class="btn btn-primary" @click="startCollection">开始收集</button>
        </div>
      </div>
    </div>

    <h1 class="page-title">舆情分析</h1>

    <div class="section">
      <h2 class="section-title">数据概览</h2>
      <DataOverview :data="overviewData" />
    </div>

    <div class="grid-layout">
      <div class="grid-item platform-chart">
        <PlatformChart :data="platformData" />
      </div>

      <div class="grid-item brief-report">
        <div class="brief-card">
          <div class="brief-header">
            <h3 class="brief-title">舆情简报</h3>
            <span class="brief-date">{{ currentDate }}</span>
          </div>

          <div class="brief-content">
            <p>
              根据最新监测数据，舆情整体呈现{{
                sentimentTrend
              }}态势。主要关注点集中在{{ focusPoints.join("、") }}等方面。
            </p>
            <div class="keyword-tags">
              <div
                v-for="(tag, index) in topKeywords"
                :key="index"
                class="keyword-tag"
                :style="{
                  backgroundColor: tagColors[index % tagColors.length].bg,
                  color: tagColors[index % tagColors.length].text,
                }"
              >
                {{ tag }}
              </div>
            </div>
          </div>

          <div class="brief-footer">
            <button class="btn-generate">
              <i class="fas fa-file-alt"></i> 生成完整简报
            </button>
          </div>
        </div>
      </div>

      <div class="grid-item emotion-chart">
        <EmotionChart :data="emotionData" />
      </div>

      <div class="grid-item trend-chart">
        <TrendChart :data="trendData" />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref, onMounted, watch, provide } from "vue";
import { useStore } from "vuex";
import DataOverview from "@/components/charts/DataOverview.vue";
import PlatformChart from "@/components/charts/PlatformChart.vue";
import EmotionChart from "@/components/charts/EmotionChart.vue";
import TrendChart from "@/components/charts/TrendChart.vue";
import api from "../service/api";
export default {
  name: "Analysis",
  components: {
    DataOverview,
    PlatformChart,
    EmotionChart,
    TrendChart,
  },
  setup() {
    const store = useStore();
    const loading = ref(false);

    const overviewData = reactive({
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      totalTrend: 0,
      positiveTrend: 0,
      negativeTrend: 0,
      neutralTrend: 0,
    });

    const platformData = ref([]);
    const emotionData = reactive({
      positive: 0,
      negative: 0,
      neutral: 0,
      // unknown: 0
    });

    const currentDate = computed(() => {
      const date = new Date();
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    });

    const sentimentTrend = ref("加载中...");
    const focusPoints = ref([]);
    const topKeywords = ref([]);

    const tagColors = [
      { bg: "rgba(58, 134, 255, 0.1)", text: "#3a86ff" },
      { bg: "rgba(239, 71, 111, 0.1)", text: "#ef476f" },
      { bg: "rgba(6, 214, 160, 0.1)", text: "#06d6a0" },
      { bg: "rgba(255, 190, 11, 0.1)", text: "#ffbe0b" },
      { bg: "rgba(131, 56, 236, 0.1)", text: "#8338ec" },
    ];

    // 获取当前选中的方案
    const currentPlan = computed(() => store.state.currentKeywordPlan);

    // 监听当前方案变化
    watch(currentPlan, () => {
      console.log("当前方案已更改，刷新分析数据");
      getAnalysisData();
    });

    onMounted(() => {
      if (currentPlan.value) {
        getAnalysisData();
      }
    });
    const trendData = ref({});

    const getAnalysisData = async () => {
      // 先检查 currentPlan 是否存在
      if (!currentPlan.value) {
        console.warn('没有选择当前方案，无法获取分析数据');
        return;
      }
      
      emotionData.positive = 0;
      emotionData.negative = 0;
      emotionData.neutral = 0;

      overviewData.total = 0;
      overviewData.positive = 0;
      overviewData.negative = 0;
      overviewData.neutral = 0;
      
      try {
        const response = await api.sentimentAnalysis({
          group_name: currentPlan.value.group_name,
        });

        if (response && response.data) {
          const data = response.data;
          platformData.value = data.platform_res || [];
          
          // 安全地处理情绪数据
          if (data.emotion_res && data.emotion_res.length > 0) {
            emotionData.positive = data.emotion_res[0]?.value || 0;
            emotionData.negative = data.emotion_res[1]?.value || 0;
            emotionData.neutral = data.emotion_res[2]?.value || 0;
          }
          
          trendData.value = data.date_res || {};
          
          // 安全地处理情绪计数数据
          if (data.emotion_res_count && data.emotion_res_count.length > 0) {
            overviewData.total =
              (data.emotion_res_count[0]?.value || 0) +
              (data.emotion_res_count[1]?.value || 0) +
              (data.emotion_res_count[2]?.value || 0);
            overviewData.positive = data.emotion_res_count[0]?.value || 0;
            overviewData.negative = data.emotion_res_count[1]?.value || 0;
            overviewData.neutral = data.emotion_res_count[2]?.value || 0;
          }
        }
      } catch (error) {
        console.error('获取分析数据失败:', error);
      }
    };
    provide("getAnalysisData", getAnalysisData);

    const showDialog = ref(false);
    const isCollecting = ref(false);
    const collectStatus = ref('');
    const collectParams = reactive({
      amount: 1000
    });

    const statusClass = computed(() => ({
      'text-success': collectStatus.value === '完成',
      'text-warning': collectStatus.value === '进行中',
      'text-danger': collectStatus.value === '异常'
    }));

    const showCollectDialog = () => {
      showDialog.value = true;
    };

    const startCollection = async () => {
      showDialog.value = false;
      
      // 检查当前方案是否存在
      if (!currentPlan.value) {
        collectStatus.value = '错误';
        console.error('没有选择当前方案，无法开始收集');
        setTimeout(() => collectStatus.value = '', 3000);
        return;
      }
      
      isCollecting.value = true;
      collectStatus.value = '进行中';
      
      try {
        await api.startCollection({
          group_name: currentPlan.value.group_name,
          amount: collectParams.amount
        });
        collectStatus.value = '完成';
        setTimeout(() => {
          getAnalysisData();
        }, 1000);
      } catch (error) {
        console.error('数据收集失败:', error);
        collectStatus.value = '异常';
      } finally {
        isCollecting.value = false;
        setTimeout(() => collectStatus.value = '', 5000);
      }
    };

    const refreshData = () => {
      getAnalysisData();
    };

    return {
      overviewData,
      platformData,
      emotionData,
      currentDate,
      sentimentTrend,
      focusPoints,
      topKeywords,
      tagColors,
      loading,
      trendData,
      showDialog,
      isCollecting,
      collectStatus,
      collectParams,
      statusClass,
      showCollectDialog,
      startCollection,
      refreshData,
    };
  },
};
</script>

<style scoped>
.analysis-page {
  padding-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
  position: relative;
  padding-left: 15px;
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 70%;
  width: 4px;
  background: var(--primary-color);
  border-radius: 2px;
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto;
  gap: 20px;
}

.grid-item {
  min-height: 400px;
}

.brief-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.brief-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eaedf3;
}

.brief-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.brief-date {
  font-size: 14px;
  color: #8a94a6;
}

.brief-content {
  flex: 1;
  line-height: 1.6;
  color: #555;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
  gap: 10px;
}

.keyword-tag {
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
}

.brief-footer {
  margin-top: 20px;
  text-align: right;
}

.btn-generate {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
}

.btn-generate i {
  margin-right: 8px;
}

.btn-generate:hover {
  background: #2a78ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(58, 134, 255, 0.3);
}

@media (max-width: 991px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}

.action-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.collect-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.quick-amount-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.btn-quick-amount {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-quick-amount:hover,
.btn-quick-amount.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
</style> 