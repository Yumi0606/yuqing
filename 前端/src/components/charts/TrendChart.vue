<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">热度数据日趋势</h3>
      <div class="chart-controls">
        <div class="period-selector">
          <button
            v-for="period in periods"
            :key="period.value"
            class="period-btn"
            :class="{ active: activePeriod === period.value }"
            @click="changePeriod(period.value)"
          >
            {{ period.label }}
          </button>
        </div>
        <button class="refresh-btn" @click="refreshData">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>
    <div class="chart-container" ref="chartContainer"></div>
    <div class="trend-summary">
      <div class="summary-item">
        <div class="summary-label">平均值</div>
        <div class="summary-value">{{ stats.average }}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">最高值</div>
        <div class="summary-value">{{ stats.max }}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">最低值</div>
        <div class="summary-value">{{ stats.min }}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">总量</div>
        <div class="summary-value">{{ stats.total }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  watchEffect,
  inject,
} from "vue";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  LineChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  CanvasRenderer,
]);

export default {
  name: "TrendChart",
  props: {
    data: {
      type: Object,
      default: () => ({
        last_7_days: [],
        last_14_days: [],
        last_30_days: [],
      }),
    },
  },
  setup(props) {
    const chartContainer = ref(null);
    let chart = null;

    const activePeriod = ref("week");

    const periods = [
      { label: "7天", value: "week" },
      { label: "14天", value: "biweek" },
      { label: "30天", value: "month" },
    ];

    const generateRandomData = (days) => {
      const data = [];
      const today = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        data.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          value: Math.floor(Math.random() * 1000) + 500,
        });
      }

      return data;
    };

    const chartData = reactive({
      week: generateRandomData(7),
      biweek: generateRandomData(14),
      month: generateRandomData(30),
    });

    const currentData = computed(() => chartData[activePeriod.value]);

    // const stats = computed(() => {
    //   const values = currentData.value.map(item => item.value);
    //   const max = Math.max(...values);
    //   const min = Math.min(...values);
    //   const total = values.reduce((sum, val) => sum + val, 0);
    //   const average = Math.floor(total / values.length);

    //   return { max, min, total, average };
    // });

    const initChart = () => {
      if (!chartContainer.value) return;

      chart = echarts.init(chartContainer.value);
      updateChart();

      window.addEventListener("resize", resizeChart);
    };
    const stats = ref({
      max: 0,
      min: 0,
      total: 0,
      average: 0,
    });
    const updateChart = () => {
      if (!chart) return;
      const values = [];
      if (activePeriod.value === "week") {
        props.data.last_7_days.map((item) => {
          values.push(item.value);
        });
        stats.value.max = Math.max(...values);
        stats.value.min = Math.min(...values);
        stats.value.total = values.reduce((sum, val) => sum + val, 0);
        stats.value.average = Math.floor(
          stats.value.total / values.length
        );
      }
      if (activePeriod.value === "biweek") {
        props.data.last_14_days.map((item) => {
        
          values.push(item.value);

        });
        stats.value.max = Math.max(...values);
        stats.value.min = Math.min(...values);
        stats.value.total = values.reduce((sum, val) => sum + val, 0);
        stats.value.average = Math.floor(
          stats.value.total / values.length
        );
      }
      if (activePeriod.value === "month") {
        props.data.last_30_days.map((item) => {
        
          values.push(item.value);

        });
        stats.value.max = Math.max(...values);
        stats.value.min = Math.min(...values);
        stats.value.total = values.reduce((sum, val) => sum + val, 0);
        stats.value.average = Math.floor(
          stats.value.total / values.length
        );
      }
      const dates = currentData.value.map(item => item.date);
      const option = {
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            const param = params[0];
            return `${param.name}<br/>${param.marker} 热度: ${param.value}`;
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: dates,
          axisLine: {
            lineStyle: {
              color: "#eaedf3",
            },
          },
          axisLabel: {
            color: "#8a94a6",
          },
        },
        yAxis: {
          type: "value",
          splitLine: {
            lineStyle: {
              color: "#eaedf3",
            },
          },
          axisLabel: {
            color: "#8a94a6",
          },
        },
        series: [
          {
            name: "热度",
            type: "line",
            smooth: true,
            lineStyle: {
              width: 4,
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#3a86ff" },
                  { offset: 1, color: "#8338ec" },
                ],
              },
            },
            areaStyle: {
              opacity: 0.2,
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#3a86ff" },
                  { offset: 1, color: "rgba(131, 56, 236, 0.1)" },
                ],
              },
            },
            emphasis: {
              focus: "series",
            },
            showSymbol: false,
            data: values,
          },
        ],
        animationDuration: 2000,
      };

      chart.setOption(option);
    };

    const changePeriod = (period) => {
      activePeriod.value = period;
      // updateChart();
    };
    const getAnalysisData = inject("getAnalysisData");

    const refreshData = () => {
      getAnalysisData();
      // const days = activePeriod.value === 'week' ? 7 :
      //             activePeriod.value === 'biweek' ? 14 : 30;

      // chartData[activePeriod.value] = generateRandomData(days);
      // updateChart();
    };

    const resizeChart = () => {
      if (chart) chart.resize();
    };

    onMounted(() => {
      if (Object.keys(props.data).length > 0) {
        initChart();
      }
    });
    watchEffect(() => {
      if (Object.keys(props.data).length > 0) {
        initChart();
      }
    });

    onUnmounted(() => {
      if (chart) {
        chart.dispose();
        chart = null;
      }
      window.removeEventListener("resize", resizeChart);
    });

    return {
      chartContainer,
      periods,
      activePeriod,
      stats,
      changePeriod,
      refreshData,
    };
  },
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
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.chart-controls {
  display: flex;
  align-items: center;
}

.period-selector {
  display: flex;
  margin-right: 10px;
  background: #f5f7fb;
  border-radius: 8px;
  padding: 4px;
}

.period-btn {
  background: transparent;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #8a94a6;
  cursor: pointer;
  transition: all 0.3s;
}

.period-btn.active {
  background: #fff;
  color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  height: 300px;
}

.trend-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 15px;
}

.summary-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.summary-label {
  font-size: 12px;
  color: #8a94a6;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

@media (max-width: 576px) {
  .trend-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 