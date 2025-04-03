<template>
  <div class="management-page">
    <h1 class="page-title">方案管理</h1>
    
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-header">
          <h3>舆情方案总数</h3>
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="stat-value">{{ plans.length }}</div>
        <div class="stat-footer">全部方案总计</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <h3>活跃方案数</h3>
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-value">{{ activePlans.length }}</div>
        <div class="stat-footer">当前启用的方案</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <h3>预警触发总数</h3>
          <i class="fas fa-bell"></i>
        </div>
        <div class="stat-value">{{ totalAlerts }}</div>
        <div class="stat-footer">全部方案预警累计</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <h3>数据总量</h3>
          <i class="fas fa-database"></i>
        </div>
        <div class="stat-value">{{ totalData }}</div>
        <div class="stat-footer">全部方案舆情数据</div>
      </div>
    </div>
    
    <div class="content-section">
      <div class="section-header">
        <h2>关键词方案列表</h2>
        <button class="btn-create" @click="openCreateForm">
          <i class="fas fa-plus"></i> 新建方案
        </button>
      </div>
      
      <div class="plans-table-container">
        <table class="plans-table" v-if="plans.length > 0">
          <thead>
            <tr>
              <th>方案名称</th>
              <th>创建日期</th>
              <th>关键词</th>
              <th>预警次数</th>
              <th>数据量</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plan in plans" :key="plan.group_name">
              <td>{{ plan.group_name }}</td>
              <td>{{ plan.created_at }}</td>
              <td>
                <div class="keywords-container">
                  <span 
                    v-for="(keyword, idx) in getKeywords(plan)" 
                    :key="idx" 
                    class="keyword-tag"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </td>
              <td>{{ plan.warning_count || 0 }}</td>
              <td>{{ formatNumber(plan.data_count) }}</td>
              <td>
                <span 
                  class="status-badge" 
                  :class="{ active: plan.is_collecting }"
                >
                  {{ plan.is_collecting ? '启用中' : '已停用' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="editPlan(plan)" class="btn-action edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="togglePlanStatus(plan)" class="btn-action toggle">
                    <i class="fas" :class="plan.is_collecting ? 'fa-pause-circle' : 'fa-play-circle'"></i>
                  </button>
                  <button @click="deletePlan(plan)" class="btn-action delete">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else class="empty-state">
          <i class="fas fa-folder-open"></i>
          <p>暂无舆情关键词方案</p>
          <button @click="openCreateForm" class="btn-create-empty">
            <i class="fas fa-plus"></i> 创建第一个方案
          </button>
        </div>
      </div>
    </div>
    
    <!-- 方案表单弹窗 -->
    <div class="plan-form-overlay" v-if="showPlanForm" @click.self="cancelForm">
      <div class="plan-form-container">
        <div class="plan-form-header">
          <h3>{{ formMode === 'create' ? '创建新方案' : '编辑方案' }}</h3>
          <button class="btn-close" @click="cancelForm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="plan-form-body">
          <div class="form-group">
            <label>方案名称</label>
            <input 
              type="text" 
              :disabled="formMode === 'edit'"
              v-model="formData.group_name" 
              placeholder="请输入方案名称"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label>关键词列表</label>
            <div class="keywords-input-container">
              <div v-for="(keyword, index) in formData.keywords" :key="index" class="keyword-item">
                <span>{{ keyword }}</span>
                <button @click="removeKeyword(index)" class="btn-remove-keyword">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <input 
                type="text" 
                v-model="newKeyword" 
                @keydown.enter.prevent="addKeyword"
                placeholder="输入关键词并按Enter添加"
                class="keyword-input"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label>状态</label>
            <div class="form-check form-switch">
              <input 
                type="checkbox" 
                v-model="formData.is_collecting"
                class="form-check-input" 
                role="switch"
                :true-value="true"
                :false-value="false"
              >
              <span class="form-check-label">
                {{ formData.is_collecting ? '启用中' : '已停用' }}
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label>立即开始收集</label>
            <div class="form-check form-switch">
              <input 
                type="checkbox" 
                v-model="formData.immediate_collect"
                class="form-check-input" 
                role="switch"
                :true-value="true"
                :false-value="false"
              >
              <span class="form-check-label">
                {{ formData.immediate_collect ? '开启' : '关闭' }}
              </span>
            </div>
          </div>
          
          <div class="form-group" v-if="formData.immediate_collect">
            <label>收集频率（小时）</label>
            <input
              v-model="formData.collection_frequency"
              type="number"
              class="form-input"
              min="1"
              max="24"
              placeholder="请输入1-24之间的数字"
            >
          </div>
        </div>
        
        <div class="plan-form-footer">
          <button class="btn-cancel" @click="cancelForm">取消</button>
          <button 
            class="btn-save" 
            @click="savePlan" 
            :disabled="!isFormValid || submitting"
          >
            {{ submitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import api from '../service/api';
export default {
  name: 'Management',
  setup() {
    const store = useStore();
    const loading = computed(() => store.state.loading);
    const newKeyword = ref('');
    const submitting = ref(false);
    
    // 从store获取表单相关状态
    const showPlanForm = computed(() => store.state.showPlanForm);
    const formMode = computed(() => store.state.planFormMode);
    const currentPlan = computed(() => store.state.currentKeywordPlan);
    
    // 获取所有方案
    const plans = computed(() => store.state.keywordPlans || []);
    const activePlans = computed(() => plans.value.filter(plan => plan.is_collecting));
    
    // 计算统计数据
    const totalAlerts = computed(() => store.state.totalAlerts);
    
    const totalData = computed(() =>  store.state.totalData);
    
    // 表单数据
    const formData = ref({
      group_name: "",
      keywords: [],
      is_collecting: true,
      immediate_collect: false,
      collection_frequency: 4,
    });
    
    // 表单验证
    const isFormValid = computed(() => {
      
      return (formData.value.group_name || '').trim() !== '' && formData.value.group_name.length > 0;
    });
    
    // 监听currentPlan变化，更新表单数据
    watch([currentPlan, formMode], ([newPlan, mode]) => {
      if (newPlan && mode === 'edit') {
        formData.value = {
          group_name: newPlan.group_name,
          keywords: Array.isArray(newPlan.keywords) ? [...newPlan.keywords] : [],
          is_collecting: newPlan.is_collecting,
          immediate_collect: newPlan.immediate_collect,
          collection_frequency: newPlan.collection_frequency,
        };
      } else {
        resetForm();
      }
    });
    
    // 监听formMode变化，如果是create则重置表单
    watch(formMode, (newValue) => {
      if (newValue === 'create') {
        resetForm();
      }
    });
    
    onMounted(() => {
      store.dispatch('fetchKeywordPlans');
    });
    
    // 工具函数：格式化数字
    const formatNumber = (num) => {
      if (!num) return '0';
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
      }
      return num.toString();
    };
    
    // 获取关键词列表
    const getKeywords = (plan) => {
      if (!plan.keywords) return [];
      if (Array.isArray(plan.keywords)) return plan.keywords;
      return [];
    };
    
    // 打开创建表单
    const openCreateForm = () => {
      store.commit('setShowPlanForm', true);
      store.commit('setPlanFormMode', 'create');
      store.commit('setCurrentKeywordPlan', null);
    };
    
    // 打开编辑表单
    const editPlan = (plan) => {
      store.commit('setCurrentKeywordPlan', plan);
      store.commit('setShowPlanForm', true);
      store.commit('setPlanFormMode', 'edit');
    };
    
    // 重置表单数据
    const resetForm = () => {
      formData.value = {
        group_name: "",
        keywords: [],
        is_collecting: true,
        immediate_collect: false,
        collection_frequency: 4
      };
      newKeyword.value = '';
    };
    
    // 添加关键词
    const addKeyword = () => {
      if (newKeyword.value.trim() !== '') {
        if (!formData.value.keywords.includes(newKeyword.value.trim())) {
          formData.value.keywords.push(newKeyword.value.trim());
        }
        newKeyword.value = '';
      }
    };
    
    // 移除关键词
    const removeKeyword = (index) => {
      formData.value.keywords.splice(index, 1);
    };
    
    // 切换方案状态
    const togglePlanStatus = (plan) => {
      formData.value = {
        group_name: plan.group_name,
        keywords: plan.keywords,
        is_collecting: !plan.is_collecting,
        immediate_collect: plan.immediate_collect,
        collection_frequency: plan.collection_frequency,
      };
      editform();
    };
    
    // 删除方案
    const deletePlan = (plan) => {
      if (confirm(`确定要删除"${plan.group_name}"方案吗？`)) {
        // store.dispatch('deleteKeywordPlan', plan.group_name);
        api.deleteKeyword({
          group_name: plan.group_name
        }).then((res) => {
          if(res.status === 200){
            store.dispatch('fetchKeywordPlans');
          }
        });
      }
    };
    
    // 保存表单
    const savePlan = async () => {
      if (!isFormValid.value) return;
      submitting.value = true;
      try {
        if(formMode.value === 'create'){
          submit();
        }else{
          editform();
        }
      } finally {
        submitting.value = false;
      }
    };
    const submit = () => {
      api.createKeyword(formData.value).then((res) => {
          if(res.status === 200){
            store.commit('setShowPlanForm', false);
            store.dispatch('fetchKeywordPlans');
          }
        });
    };
    const editform = () =>{
      api.updateKeyword(formData.value).then((res) => {
          if(res.status === 200){
            store.commit('setShowPlanForm', false);
            store.dispatch('fetchKeywordPlans');
          }
        });
    }
    
    // 取消表单
    const cancelForm = () => {
      store.commit('setShowPlanForm', false);
    };
    
    return {
      plans,
      activePlans,
      totalAlerts,
      totalData,
      loading,
      showPlanForm,
      formMode,
      formData,
      newKeyword,
      isFormValid,
      submitting,
      formatNumber,
      getKeywords,
      openCreateForm,
      editPlan,
      togglePlanStatus,
      deletePlan,
      addKeyword,
      removeKeyword,
      savePlan,
      cancelForm
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
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stat-header h3 {
  font-size: 16px;
  font-weight: 500;
  color: #555;
  margin: 0;
}

.stat-header i {
  font-size: 20px;
  color: var(--primary-color);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.stat-footer {
  font-size: 13px;
  color: #888;
}

.content-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.btn-create {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.btn-create:hover {
  background: #3a7bd5;
}

.btn-create i {
  margin-right: 8px;
}

.plans-table-container {
  overflow-x: auto;
}

.plans-table {
  width: 100%;
  border-collapse: collapse;
}

.plans-table th,
.plans-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.plans-table th {
  font-weight: 600;
  color: #555;
  background: #f9fafb;
}

.plans-table tbody tr {
  transition: background 0.2s;
}

.plans-table tbody tr:hover {
  background: #f5f7fa;
}

.keywords-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.keyword-tag {
  background: #f0f4ff;
  color: var(--primary-color);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #f1f1f1;
  color: #888;
}

.status-badge.active {
  background: #e1f5e9;
  color: #06d6a0;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-action.edit {
  color: var(--primary-color);
}

.btn-action.toggle {
  color: #6c757d;
}

.btn-action.delete {
  color: #ff4d6d;
}

.btn-action:hover {
  background: #eaedf3;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state i {
  font-size: 40px;
  color: #ccc;
  margin-bottom: 15px;
}

.empty-state p {
  font-size: 16px;
  color: #888;
  margin-bottom: 20px;
}

.btn-create-empty {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.btn-create-empty i {
  margin-right: 8px;
  color: white;
  font-size: 14px;
  margin-bottom: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.plan-form-overlay {
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
  overflow: hidden;
}

.plan-form-container {
  background: white;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.plan-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.plan-form-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.btn-close {
  background: transparent;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
}

.plan-form-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-input::-webkit-inner-spin-button,
.form-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-input[type=number] {
  -moz-appearance: textfield;
}

.keywords-input-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 120px;
}

.keyword-item {
  display: flex;
  align-items: center;
  background: #f0f4ff;
  color: var(--primary-color);
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 13px;
}

.btn-remove-keyword {
  background: transparent;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  margin-left: 5px;
  padding: 0;
  font-size: 12px;
}

.keyword-input {
  flex: 1;
  min-width: 120px;
  border: none;
  padding: 4px;
  font-size: 14px;
}

.keyword-input:focus {
  outline: none;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;
}

.form-check-input {
  width: 40px;
  height: 20px;
  margin-top: 0;
  background-color: rgba(0, 0, 0, 0.25);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
  background-position: left center;
  border-radius: 20px;
  transition: background-position .15s ease-in-out;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: var(--primary-color);
  background-position: right center;
}

.form-check-label {
  font-size: 14px;
  color: #666;
  user-select: none;
}

.toggle-container,
.toggle,
.toggle-slider,
.toggle-label {
  display: none;
}

.plan-form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
  flex-shrink: 0;
}

.btn-cancel {
  min-width: 80px;
  height: 36px;
  background: white;
  border: 1px solid #ddd;
  color: #666;
  padding: 0 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.btn-save {
  min-width: 80px;
  height: 36px;
  background: var(--primary-color);
  border: none;
  color: white;
  padding: 0 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #2a78ff;
  transform: translateY(-1px);
}

.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 991px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .btn-create {
    width: 100%;
    justify-content: center;
  }
}
</style> 