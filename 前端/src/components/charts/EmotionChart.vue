<template>
  <div class="chart-card" >
    <div class="chart-header">
      <h3 class="chart-title">情绪成分分布</h3>
      <div class="chart-actions">
        <button class="refresh-btn" @click="refreshData">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>
    <div class="chart-container" ref="chartContainer"></div>
    <div class="emotion-summary">
      <div class="emotion-item" v-for="(item, index) in emotions" :key="index">
        <div class="emotion-icon" :class="item.type">
          <i :class="item.icon"></i>
        </div>
        <div class="emotion-info">
          <div class="emotion-name">{{ item.name }}</div>
          <div class="emotion-value">{{ item.percent }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted,watchEffect,inject } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

export default {
  name: 'EmotionChart',
  props: {
    data: {
      type: Object,
      default: () => ({
        positive: 0,
        negative: 0,
        neutral: 0,
        // unknown: 8
      })
    }
  },
  setup(props) {
    const chartContainer = ref(null);
    let chart = null;
    
    const emotionData = ref({});
    
    const emotions = computed(() => [
      {
        name: '积极',
        type: 'positive',
        percent: emotionData.value.positive,
        icon: 'fas fa-smile',
        color: '#06d6a0'
      },
      {
        name: '消极',
        type: 'negative',
        percent: emotionData.value.negative,
        icon: 'fas fa-frown',
        color: '#ef476f'
      },
      {
        name: '中性',
        type: 'neutral',
        percent: emotionData.value.neutral,
        icon: 'fas fa-meh',
        color: '#118ab2'
      },
      // {
      //   name: '未知',
      //   type: 'unknown',
      //   percent: emotionData.value.unknown,
      //   icon: 'fas fa-question-circle',
      //   color: '#8a94a6'
      // }
    ]);
    
    const initChart = () => {
      if (!chartContainer.value) return;
      
      chart = echarts.init(chartContainer.value);
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}% ({d}%)'
        },
        series: [
          {
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              position: 'inside',
              formatter: '{d}%',
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff',
              textShadowBlur: 5,
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffsetX: 1,
              textShadowOffsetY: 1
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            data: [
              { value: emotionData.value.positive, name: '积极', itemStyle: { color: '#06d6a0' } },
              { value: emotionData.value.negative, name: '消极', itemStyle: { color: '#ef476f' } },
              { value: emotionData.value.neutral, name: '中性', itemStyle: { color: '#118ab2' } },
            ]
          }
        ],
        animationType: 'scale',
        animationEasing: 'elasticOut'
      };
      
      chart.setOption(option);
      
      window.addEventListener('resize', resizeChart);
    };
    const getAnalysisData = inject('getAnalysisData');
    const refreshData = () => {
      getAnalysisData();
    };
    
    const resizeChart = () => {
      if (chart) chart.resize();
    };
    
    onMounted(() => {
      if (props.data) {
        emotionData.value = props.data;
        initChart();

      }
    });
    watchEffect(() => {
      if (props.data) {
        emotionData.value = props.data;
        initChart();

      }
        
    });
    onUnmounted(() => {
      if (chart) {
        chart.dispose();
        chart = null;
      }
      window.removeEventListener('resize', resizeChart);
    });
    
    return {
      chartContainer,
      emotions,
      refreshData
    };
  }
};
</script>

<style scoped>
.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.refresh-btn {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #8a94a6;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover {
  background: #f5f5f5;
  color: var(--primary-color);
}

.chart-container {
  flex: 1;
  height: 250px;
}

.emotion-summary {
  display: flex;
  flex-wrap: wrap;
  margin-top: 15px;
  gap: 10px;
}

.emotion-item {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 10px;
  min-width: 140px;
}

.emotion-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.emotion-icon.positive {
  background: rgba(6, 214, 160, 0.1);
  color: #06d6a0;
}

.emotion-icon.negative {
  background: rgba(239, 71, 111, 0.1);
  color: #ef476f;
}

.emotion-icon.neutral {
  background: rgba(17, 138, 178, 0.1);
  color: #118ab2;
}

.emotion-icon.unknown {
  background: rgba(138, 148, 166, 0.1);
  color: #8a94a6;
}

.emotion-info {
  flex: 1;
}

.emotion-name {
  font-size: 12px;
  color: #8a94a6;
  margin-bottom: 4px;
}

.emotion-value {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

@media (max-width: 768px) {
  .emotion-summary {
    flex-direction: column;
  }
  
  .emotion-item {
    width: 100%;
  }
}
</style> 