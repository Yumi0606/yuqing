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
            <p>根据最新监测数据，舆情整体呈现{{ sentimentTrend }}态势。主要关注点集中在{{ focusPoints.join('、') }}等方面。</p>
            <div class="keyword-tags">
              <div 
                v-for="(tag, index) in topKeywords" 
                :key="index" 
                class="keyword-tag"
                :style="{ 
                  backgroundColor: tagColors[index % tagColors.length].bg,
                  color: tagColors[index % tagColors.length].text
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
        <TrendChart />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, reactive } from 'vue';
import DataOverview from '@/components/charts/DataOverview.vue';
import PlatformChart from '@/components/charts/PlatformChart.vue';
import EmotionChart from '@/components/charts/EmotionChart.vue';
import TrendChart from '@/components/charts/TrendChart.vue';

export default {
  name: 'Analysis',
  components: {
    DataOverview,
    PlatformChart,
    EmotionChart,
    TrendChart
  },
  setup() {
    const overviewData = reactive({
      total: 12580,
      positive: 5210,
      negative: 3420,
      neutral: 3950,
      totalTrend: 12.5,
      positiveTrend: 15.2,
      negativeTrend: -5.8,
      neutralTrend: 8.3
    });
    
    const platformData = [
      { name: '微博', value: 35 },
      { name: '微信', value: 28 },
      { name: '新闻网站', value: 16 },
      { name: '论坛', value: 12 },
      { name: '抖音', value: 9 }
    ];
    
    const emotionData = {
      positive: 42,
      negative: 27,
      neutral: 23,
      unknown: 8
    };
    
    const currentDate = computed(() => {
      const date = new Date();
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    });
    
    const sentimentTrend = '稳定正面';
    
    const focusPoints = ['公共服务', '政策解读', '民生关切'];
    
    const topKeywords = ['政策执行', '民生保障', '公共服务', '教育改革', '医疗资源'];
    
    const tagColors = [
      { bg: 'rgba(58, 134, 255, 0.1)', text: '#3a86ff' },
      { bg: 'rgba(239, 71, 111, 0.1)', text: '#ef476f' },
      { bg: 'rgba(6, 214, 160, 0.1)', text: '#06d6a0' },
      { bg: 'rgba(255, 190, 11, 0.1)', text: '#ffbe0b' },
      { bg: 'rgba(131, 56, 236, 0.1)', text: '#8338ec' }
    ];
    
    return {
      overviewData,
      platformData,
      emotionData,
      currentDate,
      sentimentTrend,
      focusPoints,
      topKeywords,
      tagColors
    };
  }
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
  content: '';
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