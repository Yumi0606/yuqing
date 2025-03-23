<template>
  <div class="sidebar">
    <button @click="createNewPlan">新建舆情方案</button>
    <div v-for="(plan, index) in plans" :key="index" class="plan">
      <div class="plan-title" @click="goToPlan(plan.id)">
        {{ plan.name }}
        <i class="arrow down"></i>
      </div>
      <div v-if="plan.showDropdown" class="dropdown">
        <button @click="editPlan(plan.id)">编辑</button>
        <button @click="deletePlan(index)">删除</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      plans: [
        { id: 2, name: '方案二', showDropdown: true },
        { id: 3, name: '方案三', showDropdown: true },
        { id: 1, name: '方案一', showDropdown: true },
      ],
    };
  },
  methods: {
    createNewPlan() {
      // 创建新方案的逻辑
      console.log('创建新方案');
    },
    goToPlan(planId) {
      // 跳转到方案页面的逻辑
      console.log(`跳转到方案 ${planId}`);
    },
    editPlan(planId) {
      // 编辑方案的逻辑
      console.log(`编辑方案 ${planId}`);
    },
    deletePlan(index) {
      // 删除方案的逻辑
      this.plans.splice(index, 1);
    },
    toggleDropdown(index) {
      this.plans[index].showDropdown = !this.plans[index].showDropdown;
    },
  },
};
</script>

<style scoped lang="scss">
.sidebar {
  width: 200px;
  background-color: #f4f4f4;
  padding: 10px;
}

button {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.plan {
  margin-bottom: 10px;
  background-color: white;
  padding: 10px;
  border: 1px solid #ddd;
  cursor: pointer;
}

.plan-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.dropdown button {
  padding: 5px;
  margin-bottom: 5px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.arrow {
  font-size: 12px;
}
</style>