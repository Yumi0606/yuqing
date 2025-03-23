<template>
  <div class="home-page">
    <div class="overlay"></div>
    <div class="content">
      <div class="logo-container">
        <i class="fas fa-chart-line"></i>
        <h1 class="title">网络舆情监测系统</h1>
      </div>
      
      <div class="description">
        <p>
          我们的舆情监测系统使用先进的数据分析技术，帮助您实时跟踪、分析和管理网络舆情。
          通过精准的情感分析和热点趋势预测，为您的决策提供可靠支持。
        </p>
      </div>
      
      <div class="features">
        <div class="feature-item">
          <i class="fas fa-search"></i>
          <h3>全网监测</h3>
          <p>覆盖主流社交媒体、新闻网站和论坛平台</p>
        </div>
        <div class="feature-item">
          <i class="fas fa-chart-bar"></i>
          <h3>数据分析</h3>
          <p>多维度数据分析，直观展示舆情态势</p>
        </div>
        <div class="feature-item">
          <i class="fas fa-bell"></i>
          <h3>预警机制</h3>
          <p>敏感事件实时预警，及时应对舆情风险</p>
        </div>
        <div class="feature-item">
          <i class="fas fa-file-alt"></i>
          <h3>报告生成</h3>
          <p>一键生成专业舆情分析报告</p>
        </div>
      </div>
      
      <div class="navigation-buttons">
        <router-link to="/dashboard/analysis" class="nav-btn analysis">
          <i class="fas fa-chart-pie"></i>
          <span>舆情分析</span>
        </router-link>
        
        <router-link to="/dashboard/view" class="nav-btn view">
          <i class="fas fa-eye"></i>
          <span>舆情查看</span>
        </router-link>
        
        <router-link to="/dashboard/management" class="nav-btn management">
          <i class="fas fa-tasks"></i>
          <span>方案管理</span>
        </router-link>
        
        <router-link to="/dashboard/knowledge" class="nav-btn knowledge">
          <i class="fas fa-book"></i>
          <span>知识科普</span>
        </router-link>
      </div>
      
      <router-link to="/dashboard" class="btn btn-enter">
        <span>进入系统</span>
        <i class="fas fa-arrow-right"></i>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home-page {
  width: 100%;
  position: relative;
  display: block;
  background: linear-gradient(135deg, #1a63ff 0%, #38c8d2 100%);
  color: white;
  padding: 40px 0;
  overflow-y: auto;
  background-attachment: fixed;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(26, 41, 128, 0.9) 0%, rgba(38, 208, 206, 0.8) 100%);
  z-index: 0;
  pointer-events: none;
}

.content {
  position: relative;
  z-index: 2;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px;
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-container {
  margin-bottom: 30px;
  animation: fadeInDown 1s ease-out;
}

.logo-container i {
  font-size: 60px;
  margin-bottom: 20px;
  color: white;
}

.title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.description {
  max-width: 800px;
  margin: 0 auto 50px;
  font-size: 1.2rem;
  line-height: 1.6;
  animation: fadeIn 1.5s ease-out;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
  animation: fadeInUp 2s ease-out;
}

.feature-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 30px 20px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s, background 0.3s;
}

.feature-item:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.2);
}

.feature-item i {
  font-size: 40px;
  margin-bottom: 20px;
}

.feature-item h3 {
  font-size: 1.4rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.feature-item p {
  font-size: 1rem;
  opacity: 0.9;
}

/* 新增：导航按钮样式 */
.navigation-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 40px;
  animation: fadeInUp 2.5s ease-out;
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}

.nav-btn i {
  font-size: 28px;
  margin-bottom: 12px;
}

.nav-btn span {
  font-size: 16px;
  font-weight: 500;
}

.nav-btn:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.nav-btn.analysis {
  border-bottom: 3px solid #FF6B6B;
}

.nav-btn.view {
  border-bottom: 3px solid #4ECDC4;
}

.nav-btn.management {
  border-bottom: 3px solid #FFD166;
}

.nav-btn.knowledge {
  border-bottom: 3px solid #6A0572;
}

.btn-enter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 15px 40px;
  background: white;
  color: var(--primary-color);
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
}

.btn-enter:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.btn-enter i {
  margin-left: 10px;
  transition: transform 0.3s;
}

.btn-enter:hover i {
  transform: translateX(5px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  
  .description {
    font-size: 1rem;
  }
  
  .features {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .navigation-buttons {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .navigation-buttons {
    grid-template-columns: 1fr;
  }
}
</style> 