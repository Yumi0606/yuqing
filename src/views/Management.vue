<template>
  <div class="management-page">
    <h1 class="page-title">方案管理</h1>
    
    <div class="create-plan-section">
      <div class="create-banner">
        <div class="banner-content">
          <h2 class="banner-title">创建监测方案</h2>
          <p class="banner-text">通过设置关键词、选择分类，快速创建舆情监测方案，实时掌握网络动态</p>
        </div>
        <button class="btn-create" @click="showCreateModal = true">
          <i class="fas fa-plus"></i> 创建新方案
        </button>
      </div>
    </div>
    
    <div class="plan-filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索方案名称或关键词" 
          @input="filterPlans"
        >
        <i v-if="searchKeyword" class="fas fa-times clear-search" @click="clearSearch"></i>
      </div>
      
      <div class="filter-tabs">
        <button 
          v-for="tab in filterTabs" 
          :key="tab.value"
          class="tab-btn"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span class="tab-count">{{ getTabCount(tab.value) }}</span>
        </button>
      </div>
    </div>
    
    <div class="plan-grid">
      <div class="plan-card" v-for="plan in filteredPlans" :key="plan.id">
        <div class="plan-header">
          <div class="plan-status" :class="{ active: plan.active }">
            {{ plan.active ? '已启用' : '已禁用' }}
          </div>
          <div class="plan-date">创建于 {{ plan.createDate }}</div>
        </div>
        
        <h3 class="plan-name">{{ plan.name }}</h3>
        
        <div class="plan-keywords">
          <div class="keyword-tag" v-for="(keyword, index) in plan.keywords" :key="index">
            {{ keyword }}
          </div>
        </div>
        
        <div class="plan-stats">
          <div class="stat-item">
            <div class="stat-value">{{ plan.dataCount }}</div>
            <div class="stat-label">数据量</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ plan.alertCount }}</div>
            <div class="stat-label">预警次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ getDaysActive(plan.createDate) }}</div>
            <div class="stat-label">运行天数</div>
          </div>
        </div>
        
        <div class="plan-actions">
          <button class="btn-plan-action edit" @click="editPlan(plan)">
            <i class="fas fa-edit"></i> 编辑
          </button>
          <button class="btn-plan-action" :class="plan.active ? 'disable' : 'enable'" @click="togglePlanStatus(plan)">
            <i :class="plan.active ? 'fas fa-pause' : 'fas fa-play'"></i>
            {{ plan.active ? '禁用' : '启用' }}
          </button>
          <button class="btn-plan-action delete" @click="deletePlan(plan)">
            <i class="fas fa-trash-alt"></i> 删除
          </button>
        </div>
      </div>
    </div>
    
    <!-- 创建方案模态框 -->
    <div class="modal-overlay" v-if="showCreateModal" @click.self="showCreateModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">创建监测方案</h2>
          <button class="modal-close" @click="showCreateModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>方案名称</label>
            <input 
              type="text" 
              v-model="newPlan.name" 
              placeholder="请输入方案名称"
              class="form-control"
            >
          </div>
          
          <div class="form-group">
            <label>所属分类</label>
            <select v-model="newPlan.category" class="form-control">
              <option value="">请选择分类</option>
              <option value="policy">政策类</option>
              <option value="public">公共服务类</option>
              <option value="emergency">突发事件类</option>
              <option value="business">商业舆情类</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>关键词</label>
            <div class="keywords-input">
              <div class="keywords-list">
                <div class="keyword-item" v-for="(keyword, index) in newPlan.keywords" :key="index">
                  <span>{{ keyword }}</span>
                  <button class="btn-remove-keyword" @click="removeKeyword(index)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div class="keyword-add">
                <input 
                  type="text" 
                  v-model="keywordInput" 
                  placeholder="添加关键词"
                  class="form-control"
                  @keyup.enter="addKeyword"
                >
                <button class="btn-add-keyword" @click="addKeyword">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <div class="switch-container">
              <label>启用预警</label>
              <label class="switch">
                <input type="checkbox" v-model="newPlan.enableAlert">
                <span class="slider"></span>
              </label>
            </div>
            <div class="help-text">开启后，当监测到异常数据时会向您发送预警通知</div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-cancel" @click="showCreateModal = false">取消</button>
          <button class="btn-submit" @click="createPlan">创建方案</button>
        </div>
      </div>
    </div>
    
    <!-- 成功创建模态框 -->
    <div class="modal-overlay" v-if="showSuccessModal" @click.self="showSuccessModal = false">
      <div class="success-modal">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3 class="success-title">方案创建成功</h3>
        <p class="success-message">您的舆情监测方案已成功创建，系统已开始监测数据</p>
        <button class="btn-confirm" @click="confirmSuccess">确认</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'Management',
  setup() {
    const router = useRouter();
    const showCreateModal = ref(false);
    const showSuccessModal = ref(false);
    const searchKeyword = ref('');
    const activeTab = ref('all');
    const keywordInput = ref('');
    
    const newPlan = reactive({
      name: '',
      category: '',
      keywords: [],
      enableAlert: true
    });
    
    const filterTabs = [
      { label: '全部方案', value: 'all' },
      { label: '正在监测', value: 'active' },
      { label: '已停用', value: 'inactive' }
    ];
    
    // 模拟方案数据
    const plans = reactive([
      {
        id: 1,
        name: '政策实施效果监测',
        keywords: ['政策效果', '民生改善', '政策执行'],
        category: 'policy',
        active: true,
        createDate: '2023-06-15',
        dataCount: 3425,
        alertCount: 5
      },
      {
        id: 2,
        name: '突发事件舆情监测',
        keywords: ['应急处置', '灾情', '突发事故'],
        category: 'emergency',
        active: true,
        createDate: '2023-08-02',
        dataCount: 1872,
        alertCount: 12
      },
      {
        id: 3,
        name: '教育改革反馈监测',
        keywords: ['教育改革', '课程调整', '校园环境'],
        category: 'public',
        active: false,
        createDate: '2023-07-10',
        dataCount: 2156,
        alertCount: 3
      },
      {
        id: 4,
        name: '产品市场反应监测',
        keywords: ['用户反馈', '产品评价', '市场反应'],
        category: 'business',
        active: true,
        createDate: '2023-09-05',
        dataCount: 987,
        alertCount: 2
      }
    ]);
    
    const filteredPlans = computed(() => {
      let result = plans;
      
      // 按状态筛选
      if (activeTab.value === 'active') {
        result = result.filter(plan => plan.active);
      } else if (activeTab.value === 'inactive') {
        result = result.filter(plan => !plan.active);
      }
      
      // 按关键词筛选
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(plan => {
          return plan.name.toLowerCase().includes(keyword) || 
                 plan.keywords.some(kw => kw.toLowerCase().includes(keyword));
        });
      }
      
      return result;
    });
    
    const getTabCount = (tab) => {
      if (tab === 'all') return plans.length;
      if (tab === 'active') return plans.filter(p => p.active).length;
      if (tab === 'inactive') return plans.filter(p => !p.active).length;
      return 0;
    };
    
    const getDaysActive = (dateStr) => {
      const createDate = new Date(dateStr);
      const today = new Date();
      const diffTime = Math.abs(today - createDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };
    
    const clearSearch = () => {
      searchKeyword.value = '';
    };
    
    const filterPlans = () => {
      // 实时筛选由 computed 处理
    };
    
    const addKeyword = () => {
      if (keywordInput.value.trim()) {
        newPlan.keywords.push(keywordInput.value.trim());
        keywordInput.value = '';
      }
    };
    
    const removeKeyword = (index) => {
      newPlan.keywords.splice(index, 1);
    };
    
    const createPlan = () => {
      if (!newPlan.name || !newPlan.category || newPlan.keywords.length === 0) {
        alert('请填写完整的方案信息');
        return;
      }
      
      const plan = {
        id: plans.length + 1,
        name: newPlan.name,
        keywords: [...newPlan.keywords],
        category: newPlan.category,
        active: true,
        createDate: new Date().toISOString().split('T')[0],
        dataCount: 0,
        alertCount: 0
      };
      
      plans.push(plan);
      
      showCreateModal.value = false;
      showSuccessModal.value = true;
      
      // 重置表单
      newPlan.name = '';
      newPlan.category = '';
      newPlan.keywords = [];
      newPlan.enableAlert = true;
    };
    
    const confirmSuccess = () => {
      showSuccessModal.value = false;
      router.push('/dashboard/view');
    };
    
    const editPlan = (plan) => {
      alert(`编辑方案: ${plan.name}`);
    };
    
    const togglePlanStatus = (plan) => {
      plan.active = !plan.active;
    };
    
    const deletePlan = (plan) => {
      if (confirm(`确定要删除方案: ${plan.name} 吗？`)) {
        const index = plans.findIndex(p => p.id === plan.id);
        if (index !== -1) {
          plans.splice(index, 1);
        }
      }
    };
    
    return {
      showCreateModal,
      showSuccessModal,
      searchKeyword,
      activeTab,
      keywordInput,
      newPlan,
      filterTabs,
      filteredPlans,
      getTabCount,
      getDaysActive,
      clearSearch,
      filterPlans,
      addKeyword,
      removeKeyword,
      createPlan,
      confirmSuccess,
      editPlan,
      togglePlanStatus,
      deletePlan
    };
  }
};
</script>

<style scoped>
.management-page {
  padding-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.create-plan-section {
  margin-bottom: 30px;
}

.create-banner {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 15px;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.banner-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
}

.banner-text {
  font-size: 16px;
  max-width: 600px;
  line-height: 1.5;
  opacity: 0.9;
}

.btn-create {
  background: white;
  color: var(--primary-color);
  border: none;
  padding: 12px 25px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn-create i {
  margin-right: 8px;
}

.btn-create:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.plan-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  width: 300px;
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
  padding: 12px 40px;
  border: 1px solid #e0e4ec;
  border-radius: 50px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
}

.clear-search {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #8a94a6;
  cursor: pointer;
}

.filter-tabs {
  display: flex;
  background: #f5f7fb;
  border-radius: 50px;
  padding: 5px;
}

.tab-btn {
  border: none;
  background: transparent;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.tab-btn.active {
  background: white;
  color: var(--primary-color);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.tab-count {
  background: #e0e4ec;
  color: #555;
  font-size: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  transition: all 0.3s;
}

.tab-btn.active .tab-count {
  background: var(--primary-color);
  color: white;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.plan-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.plan-status {
  padding: 5px 10px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
  background: #f5f7fb;
  color: #8a94a6;
}

.plan-status.active {
  background: rgba(6, 214, 160, 0.1);
  color: var(--success-color);
}

.plan-date {
  font-size: 12px;
  color: #8a94a6;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.plan-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.keyword-tag {
  padding: 5px 10px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
  background: #f5f7fb;
  color: #555;
}

.plan-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px 0;
  border-top: 1px solid #eaedf3;
  border-bottom: 1px solid #eaedf3;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #8a94a6;
  margin-top: 5px;
}

.plan-actions {
  display: flex;
  gap: 10px;
}

.btn-plan-action {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-plan-action i {
  margin-right: 5px;
}

.btn-plan-action.edit {
  background: rgba(58, 134, 255, 0.1);
  color: var(--primary-color);
}

.btn-plan-action.edit:hover {
  background: var(--primary-color);
  color: white;
}

.btn-plan-action.enable {
  background: rgba(6, 214, 160, 0.1);
  color: var(--success-color);
}

.btn-plan-action.enable:hover {
  background: var(--success-color);
  color: white;
}

.btn-plan-action.disable {
  background: rgba(255, 190, 11, 0.1);
  color: var(--warning-color);
}

.btn-plan-action.disable:hover {
  background: var(--warning-color);
  color: white;
}

.btn-plan-action.delete {
  background: rgba(239, 71, 111, 0.1);
  color: var(--danger-color);
}

.btn-plan-action.delete:hover {
  background: var(--danger-color);
  color: white;
}

/* 模态框样式 */
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
  backdrop-filter: blur(5px);
}

.modal-container {
  background: white;
  border-radius: 15px;
  width: 600px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eaedf3;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 18px;
  color: #8a94a6;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.modal-close:hover {
  background: #f5f7fb;
  color: var(--danger-color);
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e4ec;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
}

.keywords-input {
  border: 1px solid #e0e4ec;
  border-radius: 8px;
  overflow: hidden;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
}

.keyword-item {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 50px;
  background: #f5f7fb;
  font-size: 12px;
  color: #555;
}

.btn-remove-keyword {
  background: transparent;
  border: none;
  color: #8a94a6;
  margin-left: 5px;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove-keyword:hover {
  color: var(--danger-color);
}

.keyword-add {
  display: flex;
  border-top: 1px solid #e0e4ec;
}

.keyword-add .form-control {
  border: none;
  border-radius: 0;
}

.btn-add-keyword {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0 15px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-keyword:hover {
  background: #2a78ff;
}

.switch-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e0e4ec;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.help-text {
  font-size: 12px;
  color: #8a94a6;
  margin-top: 5px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eaedf3;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn-cancel {
  background: #f5f7fb;
  color: #555;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: #eaedf3;
}

.btn-submit {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit:hover {
  background: #2a78ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(58, 134, 255, 0.3);
}

/* 成功模态框 */
.success-modal {
  background: white;
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  width: 400px;
  max-width: 95%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.success-icon {
  font-size: 60px;
  color: var(--success-color);
  margin-bottom: 20px;
}

.success-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.success-message {
  font-size: 16px;
  color: #555;
  margin-bottom: 30px;
  line-height: 1.5;
}

.btn-confirm {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-confirm:hover {
  background: #2a78ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(58, 134, 255, 0.3);
}

@media (max-width: 768px) {
  .create-banner {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .btn-create {
    margin-top: 20px;
  }
  
  .plan-filters {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-box {
    width: 100%;
    margin-bottom: 15px;
  }
  
  .plan-grid {
    grid-template-columns: 1fr;
  }
}
</style> 