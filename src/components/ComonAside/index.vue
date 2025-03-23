<template>
  <!-- 模板部分保持不变 -->
  <el-aside :width="$store.state.isCollapse ? '64px' : '180px'">
    <el-menu class="el-menu-vertical-demo" :collapse="$store.state.isCollapse" background-color="#545c64">
      <h3 v-show="!$store.state.isCollapse">后台管理</h3>
      <h3 v-show="$store.state.isCollapse">后台</h3>

      <!-- 无子菜单的项 -->
      <el-menu-item
          :index="item.name"
          v-for="item in noChildren"
          :key="item.path"
          @click="cilckmenu(item)"
      >
        <component class="icons" :is="item.icon"></component>
        <span>{{ item.label }}</span>
      </el-menu-item>

      <!-- 有子菜单的项 -->
      <el-submenu v-for="(item, index) in hasChildren" :index="item.label" :key="index">
        <template slot="title">
          <el-icon>
            <component class="icons" :is="item.icon"></component>
          </el-icon>
          <span>{{ item.label }}</span>
        </template>

        <el-menu-item-group>
          <el-menu-item
              :index="subItem.name"
              v-for="(subItem, subIndex) in item.children"
              :key="subIndex"
              @click="cilckmenu(subItem)"
          >
            <component class="icons" :is="subItem.icon"></component>
            <span>{{ subItem.name }}</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  data() {
    return {
      // 初始化为空数组，避免undefined
      asyncList: [],
      menuData: []
    };
  },
  created() {
    // 在组件创建时从store获取数据
    this.asyncList = this.$store.state.menu || [];
    this.menuData = this.asyncList;
  },
  computed: {
    // 添加空值检查
    noChildren() {
      return this.asyncList ? this.asyncList.filter((item) => !item.children) : [];
    },
    hasChildren() {
      return this.asyncList ? this.asyncList.filter((item) => item.children) : [];
    },
  },
  methods: {
    cilckmenu(item) {
      this.$router.push({
        path: item.path,
      });
    },
  },
  // 监听store中menu的变化
  watch: {
    '$store.state.menu': {
      handler(newVal) {
        this.asyncList = newVal || [];
        this.menuData = this.asyncList;
      },
      immediate: true
    }
  }
};
</script>

<style lang="less" scoped>
/* 样式部分保持不变 */
.icons {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}
.el-menu {
  h3 {
    text-align: center;
    color: white;
    line-height: 36px;
  }
}
.el-menu-vertical-demo {
  border-right: 0;
}
.el-menu-item,
.el-sub-menu__title * {
  color: white;
}
</style>
