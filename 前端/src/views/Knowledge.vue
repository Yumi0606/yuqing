<template>
  <div class="knowledge-page">
    <h1 class="page-title">舆情知识科普</h1>
    
    <div class="search-box">
      <i class="fas fa-search"></i>
      <input 
        type="text" 
        v-model="searchTerm" 
        placeholder="搜索舆情知识..." 
        @input="searchArticles"
      >
      <i v-if="searchTerm" class="fas fa-times clear-search" @click="clearSearch"></i>
    </div>
    
    <div class="category-tabs">
      <button 
        v-for="category in categories" 
        :key="category.id"
        class="category-tab"
        :class="{ active: activeCategory === category.id }"
        @click="activeCategory = category.id"
      >
        <i :class="category.icon"></i>
        {{ category.name }}
      </button>
    </div>
    
    <div class="articles-container">
      <div class="article-card" v-for="article in filteredArticles" :key="article.id" @click="viewArticle(article)">
        <div class="article-image" :style="{ backgroundImage: `url(${article.image})` }">
          <div class="article-category">{{ getCategoryName(article.category) }}</div>
        </div>
        <div class="article-content">
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-excerpt">{{ article.excerpt }}</p>
          <div class="article-meta">
            <div class="article-date">
              <i class="fas fa-calendar"></i> {{ article.date }}
            </div>
            <div class="article-views">
              <i class="fas fa-eye"></i> {{ article.views }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 文章详情模态框 -->
    <div class="modal-overlay" v-if="selectedArticle" @click.self="selectedArticle = null">
      <div class="article-modal">
        <div class="article-modal-header">
          <h2 class="article-modal-title">{{ selectedArticle?.title }}</h2>
          <button class="modal-close" @click="selectedArticle = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="article-modal-meta">
          <span class="article-modal-category">{{ getCategoryName(selectedArticle?.category) }}</span>
          <span class="article-modal-date">
            <i class="fas fa-calendar"></i> {{ selectedArticle?.date }}
          </span>
        </div>
        
        <div class="article-modal-image" v-if="selectedArticle?.image">
          <img :src="selectedArticle?.image" :alt="selectedArticle?.title">
        </div>
        
        <div class="article-modal-content" v-html="selectedArticle?.content"></div>
        
        <div class="article-modal-footer">
          <div class="article-tags">
            <div class="tag" v-for="(tag, index) in selectedArticle?.tags" :key="index">
              {{ tag }}
            </div>
          </div>
          
          <button class="btn-share">
            <i class="fas fa-share-alt"></i> 分享
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'Knowledge',
  setup() {
    const searchTerm = ref('');
    const activeCategory = ref('all');
    const selectedArticle = ref(null);
    
    const categories = [
      { id: 'all', name: '全部', icon: 'fas fa-th-large' },
      { id: 'basic', name: '基础知识', icon: 'fas fa-book' },
      { id: 'analysis', name: '分析方法', icon: 'fas fa-chart-pie' },
      { id: 'crisis', name: '危机公关', icon: 'fas fa-exclamation-triangle' },
      { id: 'case', name: '案例研究', icon: 'fas fa-search' }
    ];
    
    // 模拟文章数据
    const articles = [
      {
        id: 1,
        title: '舆情监测基础知识：什么是舆情？',
        excerpt: '舆情是指在一定的社会空间内，围绕中介性社会事件的发生、发展及其处理...',
        content: `
          <p>舆情是指在一定的社会空间内，围绕中介性社会事件的发生、发展及其处理，民众对社会管理者及其管理行为所持有的各种态度、意见和观点的总和。舆情是社情民意的一种反映形式，是公众对社会热点、焦点和难点问题的关注和反应。</p>
          <h3>舆情的特点</h3>
          <ul>
            <li>真实性：舆情是公众真实想法的直接表达</li>
            <li>广泛性：舆情反映的问题往往具有广泛的社会基础</li>
            <li>多样性：舆情的表达形式和渠道多种多样</li>
            <li>及时性：网络时代的舆情反应速度极快</li>
          </ul>
          <h3>为什么需要监测舆情？</h3>
          <p>舆情监测是了解社会动态、把握民心向背的重要手段。通过舆情监测，可以及时发现潜在的社会问题，防范风险，引导舆论，维护社会稳定。同时，舆情监测也是政府部门、企事业单位改进工作、提高服务质量的重要参考。</p>
        `,
        category: 'basic',
        date: '2023-05-15',
        views: 3256,
        tags: ['舆情基础', '概念解析', '特点分析'],
        image: 'https://via.placeholder.com/800x400?text=舆情监测基础'
      },
      {
        id: 2,
        title: '舆情分析方法：情感分析技术详解',
        excerpt: '情感分析是舆情监测中的关键技术，通过机器学习和自然语言处理技术...',
        content: `
          <p>情感分析（Sentiment Analysis）是通过自然语言处理、文本分析和计算语言学等方法来识别、提取和研究文本中的主观信息的过程。在舆情监测中，情感分析可以帮助我们快速判断大量文本的情感倾向，分为积极、消极和中性。</p>
          <h3>情感分析的主要方法</h3>
          <ol>
            <li><strong>基于词典的方法</strong>：利用情感词典判断文本的情感极性</li>
            <li><strong>基于机器学习的方法</strong>：通过训练模型来自动识别文本情感</li>
            <li><strong>深度学习方法</strong>：使用神经网络等深度学习技术进行更精准的情感分析</li>
          </ol>
          <h3>情感分析的应用场景</h3>
          <p>情感分析可广泛应用于品牌监测、市场调研、政策评估、危机预警等多个领域。通过情感分析，可以了解公众对特定事件、产品或政策的真实态度，为决策提供数据支持。</p>
          <p>随着技术的发展，情感分析已经能够识别更为细微的情感变化，如愤怒、恐惧、惊讶、高兴等，为舆情分析提供更为精准的技术支持。</p>
        `,
        category: 'analysis',
        date: '2023-06-22',
        views: 2187,
        tags: ['情感分析', '自然语言处理', '机器学习'],
        image: 'https://via.placeholder.com/800x400?text=情感分析技术'
      },
      {
        id: 3,
        title: '舆情危机处理：企业公关策略与案例',
        excerpt: '面对舆情危机，企业如何快速反应，有效沟通，最大程度减少负面影响...',
        content: `
          <p>舆情危机是指由于某一事件或话题在网络空间引发大量关注和讨论，形成较大范围的负面舆论，可能对企业或组织的声誉、业务和利益造成严重损害的情况。</p>
          <h3>危机公关的核心原则</h3>
          <ul>
            <li>及时性：在危机初期就迅速反应，避免事态扩大</li>
            <li>透明性：坦诚沟通，不隐瞒事实</li>
            <li>一致性：对内对外信息保持一致</li>
            <li>负责任：承担责任，给出解决方案</li>
          </ul>
          <h3>危机公关步骤</h3>
          <ol>
            <li>第一时间响应，控制信息源</li>
            <li>全面了解事情真相，收集相关信息</li>
            <li>制定沟通策略，准备应对方案</li>
            <li>及时发布官方声明，引导舆论走向</li>
            <li>追踪舆情发展，及时调整策略</li>
          </ol>
          <p>成功的危机公关不仅能够化解危机，还能在处理过程中树立良好的企业形象，将危机转化为提升品牌价值的机会。</p>
        `,
        category: 'crisis',
        date: '2023-07-30',
        views: 4328,
        tags: ['危机公关', '舆情应对', '企业形象'],
        image: 'https://via.placeholder.com/800x400?text=危机公关'
      },
      {
        id: 4,
        title: '经典舆情案例分析：如何从危机中转危为机',
        excerpt: '通过分析经典舆情案例，学习成功的危机处理策略和方法...',
        content: `
          <p>危机处理得当，往往能够将危机转化为提升企业形象、增强品牌价值的机会。本文通过分析几个典型案例，总结成功的危机管理经验。</p>
          <h3>案例一：星巴克人种歧视事件</h3>
          <p>2018年，美国费城一家星巴克门店员工因种族问题报警逮捕两名非裔美国人，引发了全美范围内的抗议。星巴克迅速做出回应：CEO公开道歉、暂时关闭全美8000多家门店进行反种族歧视培训、制定新政策等。这一系列举措获得了公众的认可，最终成功化解了危机。</p>
          <h3>案例二：辉瑞新冠疫苗副作用争议</h3>
          <p>辉瑞新冠疫苗在上市后，网络上出现了关于其可能导致严重副作用的负面信息。辉瑞采取了透明的信息公开策略，及时发布科学数据，邀请医学专家解释，并与各国监管机构保持密切沟通。这种基于科学和透明度的应对方式，有效降低了公众恐慌，保障了疫苗接种进程。</p>
          <h3>成功案例的共同点</h3>
          <ul>
            <li>快速反应：第一时间回应，不让谣言扩散</li>
            <li>真诚道歉：需要时勇于承认错误并道歉</li>
            <li>实质行动：采取具体措施解决问题</li>
            <li>持续沟通：保持与公众的沟通，及时通报进展</li>
          </ul>
        `,
        category: 'case',
        date: '2023-08-15',
        views: 3689,
        tags: ['案例研究', '危机管理', '成功经验'],
        image: 'https://via.placeholder.com/800x400?text=舆情案例分析'
      },
      {
        id: 5,
        title: '网络舆情监测技术发展趋势',
        excerpt: '随着技术的进步，舆情监测的方法也在不断创新，本文将介绍最新的技术发展趋势...',
        content: `
          <p>随着人工智能、大数据等技术的发展，舆情监测技术也在快速迭代更新。当前舆情监测技术正朝着更智能、更精准、更高效的方向发展。</p>
          <h3>人工智能在舆情监测中的应用</h3>
          <p>自然语言处理(NLP)技术的突破，使得机器能够更好地理解人类语言，分析文本情感、提取关键信息。深度学习算法可以自动学习特征，提高分析准确率，减少人工干预。</p>
          <h3>多模态分析技术</h3>
          <p>舆情监测不再局限于文本分析，图像识别、语音识别、视频分析等技术的融合应用，使得舆情监测可以覆盖更多媒介形式，全方位捕捉网络舆情信息。</p>
          <h3>实时预警与趋势预测</h3>
          <p>基于大数据技术和机器学习算法，舆情监测系统能够在海量数据中快速发现异常波动，实时预警潜在风险。通过历史数据分析和模式识别，可以预测舆情发展趋势，提前做好应对准备。</p>
          <h3>个性化舆情服务</h3>
          <p>未来的舆情监测将更加注重个性化需求，为不同行业、不同企业提供定制化的解决方案，帮助用户从自身角度出发，更准确地把握舆情脉搏。</p>
        `,
        category: 'analysis',
        date: '2023-09-10',
        views: 1865,
        tags: ['技术趋势', '人工智能', '多模态分析'],
        image: 'https://via.placeholder.com/800x400?text=技术发展趋势'
      }
    ];
    
    const filteredArticles = computed(() => {
      let result = articles;
      
      // 按分类筛选
      if (activeCategory.value !== 'all') {
        result = result.filter(article => article.category === activeCategory.value);
      }
      
      // 按关键词搜索
      if (searchTerm.value) {
        const searchLower = searchTerm.value.toLowerCase();
        result = result.filter(article => 
          article.title.toLowerCase().includes(searchLower) ||
          article.excerpt.toLowerCase().includes(searchLower) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return result;
    });
    
    const getCategoryName = (categoryId) => {
      const category = categories.find(cat => cat.id === categoryId);
      return category ? category.name : '';
    };
    
    const searchArticles = () => {
      // 搜索逻辑在 computed 属性中实现
    };
    
    const clearSearch = () => {
      searchTerm.value = '';
    };
    
    const viewArticle = (article) => {
      selectedArticle.value = article;
    };
    
    return {
      searchTerm,
      activeCategory,
      categories,
      selectedArticle,
      filteredArticles,
      getCategoryName,
      searchArticles,
      clearSearch,
      viewArticle
    };
  }
};
</script>

<style scoped>
.knowledge-page {
  padding-bottom: 40px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 30px;
}

.search-box {
  position: relative;
  margin-bottom: 25px;
  max-width: 600px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #8a94a6;
}

.search-box input {
  width: 100%;
  padding: 12px 40px 12px 45px;
  border: 1px solid #eaedf3;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.search-box input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.2);
}

.clear-search {
  right: 15px !important;
  left: auto !important;
  cursor: pointer;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.category-tab {
  padding: 10px 20px;
  border: none;
  border-radius: 50px;
  background: #f5f7fb;
  color: #555;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.category-tab i {
  margin-right: 8px;
}

.category-tab:hover {
  background: #eaedf3;
}

.category-tab.active {
  background: var(--primary-color);
  color: white;
}

.articles-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.article-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.article-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.article-category {
  position: absolute;
  bottom: 15px;
  left: 15px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
}

.article-content {
  padding: 20px;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
}

.article-excerpt {
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  color: #8a94a6;
  font-size: 13px;
}

.article-date, .article-views {
  display: flex;
  align-items: center;
}

.article-date i, .article-views i {
  margin-right: 5px;
}

/* 文章详情模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 30px;
}

.article-modal {
  background: white;
  border-radius: 12px;
  width: 800px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.article-modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eaedf3;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #8a94a6;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-close:hover {
  background: #f5f7fb;
  color: #333;
}

.article-modal-meta {
  padding: 15px 25px;
  display: flex;
  gap: 20px;
  color: #8a94a6;
  font-size: 14px;
}

.article-modal-category {
  padding: 4px 12px;
  background: #f5f7fb;
  border-radius: 50px;
  font-weight: 500;
}

.article-modal-date {
  display: flex;
  align-items: center;
}

.article-modal-date i {
  margin-right: 5px;
}

.article-modal-image {
  width: 100%;
}

.article-modal-image img {
  width: 100%;
  display: block;
}

.article-modal-content {
  padding: 25px;
  line-height: 1.8;
  color: #333;
}

.article-modal-content h3 {
  font-size: 20px;
  font-weight: 600;
  margin-top: 25px;
  margin-bottom: 15px;
  color: #333;
}

.article-modal-content p, .article-modal-content ul, .article-modal-content ol {
  margin-bottom: 15px;
}

.article-modal-content li {
  margin-bottom: 10px;
}

.article-modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #eaedf3;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  padding: 5px 12px;
  background: #f5f7fb;
  border-radius: 50px;
  font-size: 12px;
  color: #555;
}

.btn-share {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.btn-share i {
  margin-right: 8px;
}

.btn-share:hover {
  background: #2a78ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(58, 134, 255, 0.3);
}

@media (max-width: 768px) {
  .articles-container {
    grid-template-columns: 1fr;
  }
  
  .article-modal-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .article-modal-footer {
    flex-direction: column;
    gap: 15px;
  }
  
  .article-tags {
    width: 100%;
  }
  
  .btn-share {
    width: 100%;
    justify-content: center;
  }
}
</style> 