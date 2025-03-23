<template>
  <div class="data-overview">
    <div class="overview-grid">
      <div class="overview-card total" @mouseover="animate('total')" ref="totalCard">
        <div class="icon-box">
          <i class="fas fa-database"></i>
        </div>
        <div class="content">
          <div class="title">总数据量</div>
          <div class="value">{{ formatNumber(data.total) }}</div>
          <div class="trend" :class="getTrendClass(data.totalTrend)">
            <i :class="getTrendIcon(data.totalTrend)"></i>
            <span>{{ data.totalTrend }}%</span>
          </div>
        </div>
      </div>
      
      <div class="overview-card positive" @mouseover="animate('positive')" ref="positiveCard">
        <div class="icon-box">
          <i class="fas fa-smile"></i>
        </div>
        <div class="content">
          <div class="title">积极信息</div>
          <div class="value">{{ formatNumber(data.positive) }}</div>
          <div class="trend" :class="getTrendClass(data.positiveTrend)">
            <i :class="getTrendIcon(data.positiveTrend)"></i>
            <span>{{ data.positiveTrend }}%</span>
          </div>
        </div>
      </div>
      
      <div class="overview-card negative" @mouseover="animate('negative')" ref="negativeCard">
        <div class="icon-box">
          <i class="fas fa-frown"></i>
        </div>
        <div class="content">
          <div class="title">消极信息</div>
          <div class="value">{{ formatNumber(data.negative) }}</div>
          <div class="trend" :class="getTrendClass(data.negativeTrend)">
            <i :class="getTrendIcon(data.negativeTrend)"></i>
            <span>{{ data.negativeTrend }}%</span>
          </div>
        </div>
      </div>
      
      <div class="overview-card neutral" @mouseover="animate('neutral')" ref="neutralCard">
        <div class="icon-box">
          <i class="fas fa-meh"></i>
        </div>
        <div class="content">
          <div class="title">中性信息</div>
          <div class="value">{{ formatNumber(data.neutral) }}</div>
          <div class="trend" :class="getTrendClass(data.neutralTrend)">
            <i :class="getTrendIcon(data.neutralTrend)"></i>
            <span>{{ data.neutralTrend }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import gsap from 'gsap';

export default {
  name: 'DataOverview',
  props: {
    data: {
      type: Object,
      default: () => ({
        total: 12580,
        positive: 5210,
        negative: 3420,
        neutral: 3950,
        totalTrend: 12.5,
        positiveTrend: 15.2,
        negativeTrend: -5.8,
        neutralTrend: 8.3
      })
    }
  },
  setup() {
    const totalCard = ref(null);
    const positiveCard = ref(null);
    const negativeCard = ref(null);
    const neutralCard = ref(null);
    
    const formatNumber = (num) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    
    const getTrendClass = (trend) => {
      if (trend > 0) return 'up';
      if (trend < 0) return 'down';
      return 'neutral';
    };
    
    const getTrendIcon = (trend) => {
      if (trend > 0) return 'fas fa-arrow-up';
      if (trend < 0) return 'fas fa-arrow-down';
      return 'fas fa-minus';
    };
    
    const animate = (type) => {
      let target;
      
      switch(type) {
        case 'total':
          target = totalCard.value;
          break;
        case 'positive':
          target = positiveCard.value;
          break;
        case 'negative':
          target = negativeCard.value;
          break;
        case 'neutral':
          target = neutralCard.value;
          break;
      }
      
      if (target) {
        gsap.to(target, {
          y: -10,
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
          duration: 0.3,
          onComplete: () => {
            gsap.to(target, {
              y: 0,
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
              duration: 0.5,
              delay: 0.5
            });
          }
        });
      }
    };
    
    onMounted(() => {
      // 初始动画，依次显示卡片
      const cards = [totalCard.value, positiveCard.value, negativeCard.value, neutralCard.value];
      
      cards.forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 30,
          duration: 0.5,
          delay: index * 0.15
        });
      });
    });
    
    return {
      totalCard,
      positiveCard,
      negativeCard,
      neutralCard,
      formatNumber,
      getTrendClass,
      getTrendIcon,
      animate
    };
  }
};
</script>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.icon-box {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  flex-shrink: 0;
}

.total .icon-box {
  background: rgba(58, 134, 255, 0.1);
  color: var(--primary-color);
}

.positive .icon-box {
  background: rgba(6, 214, 160, 0.1);
  color: var(--success-color);
}

.negative .icon-box {
  background: rgba(239, 71, 111, 0.1);
  color: var(--danger-color);
}

.neutral .icon-box {
  background: rgba(255, 190, 11, 0.1);
  color: var(--warning-color);
}

.content {
  flex: 1;
}

.title {
  font-size: 14px;
  color: #8a94a6;
  margin-bottom: 8px;
}

.value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.trend {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.trend i {
  margin-right: 5px;
}

.trend.up {
  color: var(--success-color);
}

.trend.down {
  color: var(--danger-color);
}

.trend.neutral {
  color: var(--warning-color);
}

@media (max-width: 768px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style> 