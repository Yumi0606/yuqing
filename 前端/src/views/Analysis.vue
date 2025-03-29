<template>
  <div class="analysis-page">
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
      emotionData.positive = 0;
      emotionData.negative = 0;
      emotionData.neutral = 0;

      overviewData.total=0;
      overviewData.positive=0;
      overviewData.negative=0;
      overviewData.neutral=0;
      
      const response = await api.sentimentAnalysis({
        group_name: currentPlan.value.group_name,
      });

      if (response && response.data) {
        const data = response.data;
        platformData.value = data.platform_res;
        if (data.emotion_res.length > 0) {
          emotionData.positive = data.emotion_res[0].value;
          emotionData.negative = data.emotion_res[1].value;
          emotionData.neutral = data.emotion_res[2].value;
        }
        trendData.value = data.date_res;
        if (data.emotion_res_count.length > 0) {
          overviewData.total =
            data.emotion_res_count[0]?.value +
            data.emotion_res_count[1]?.value +
            data.emotion_res_count[2]?.value;
          overviewData.positive = data.emotion_res_count[0]?.value;
          overviewData.negative = data.emotion_res_count[1]?.value;
          overviewData.neutral = data.emotion_res_count[2]?.value;
        }
      }
    };
    provide("getAnalysisData", getAnalysisData);

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
</style> 