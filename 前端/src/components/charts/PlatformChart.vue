<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">平台占比</h3>
      <div class="chart-actions">
        <button class="refresh-btn" @click="refreshData">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>
    <div class="chart-container" ref="chartContainer"></div>
    <div class="chart-legend">
      <div 
        v-for="(item, index) in chartData" 
        :key="index" 
        class="legend-item"
        @mouseover="highlightItem(index)"
        @mouseout="resetHighlight"
      >
        <span class="legend-color" :style="{ background: colors[index % colors.length] }"></span>
        <span class="legend-label">{{ item.name }}</span>
        <span class="legend-value">{{ formatPercent(item.value) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted,watchEffect,inject } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

export default {
  name: 'PlatformChart',
  props: {
    data: {
      type: Array,
      default: () => [
        // { name: '微博', value: 35 },
        // { name: '微信', value: 28 },
        // { name: '新闻网站', value: 16 },
        // { name: '论坛', value: 12 },
        // { name: '抖音', value: 9 }
      ]
    }
  },
  setup(props) {
    const chartContainer = ref(null);
    let chart = null;
    
    const colors = [
      '#3a86ff', '#8338ec', '#ff006e', '#fb5607', '#ffbe0b',
      '#06d6a0', '#118ab2', '#ef476f', '#073b4c', '#ffd166'
    ];
    
    const chartData = ref([]);
    
    const formatPercent = (value) => {
      return `${value}%`;
    };
    
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
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: {
              show: false
            },
            data: chartData.value.map((item, index) => ({
              ...item,
              itemStyle: {
                color: colors[index % colors.length]
              }
            }))
          }
        ],
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
          return Math.random() * 200;
        }
      };
      
      chart.setOption(option);
      
      window.addEventListener('resize', resizeChart);
    };
    
    const highlightItem = (index) => {
      if (!chart) return;
      
      chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: index
      });
    };
    
    const resetHighlight = () => {
      if (!chart) return;
      
      chart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0
      });
    };
    const getAnalysisData = inject('getAnalysisData');
    
    const refreshData = () => {
      getAnalysisData();
      // // 模拟数据刷新
      // const newData = chartData.value.map(item => ({
      //   name: item.name,
      //   value: Math.floor(Math.random() * 30) + 5
      // }));
      
      // chartData.value = newData;
      
      // if (chart) {
      //   chart.setOption({
      //     series: [
      //       {
      //         data: newData.map((item, index) => ({
      //           ...item,
      //           itemStyle: {
      //             color: colors[index % colors.length]
      //           }
      //         }))
      //       }
      //     ]
      //   });
      // }
    };
    
    const resizeChart = () => {
      if (chart) chart.resize();
    };
    
    onMounted(() => {
      if(props.data){
        chartData.value = props.data;
        initChart();
      }
        
    });
    watchEffect(() => {
      if(props.data){
        chartData.value = props.data;
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
      chartData,
      colors,
      formatPercent,
      highlightItem,
      resetHighlight,
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

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  margin-top: 15px;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 50px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
}

.legend-item:hover {
  background: #eaecef;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.legend-label {
  font-size: 12px;
  color: #555;
  margin-right: 5px;
}

.legend-value {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}
</style> 