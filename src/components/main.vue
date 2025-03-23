<template>
  <div class="common-layout">
    <!--使用elementui中的el-container布局-->
    <el-container>
      <!--我们会把菜单封装为一个组件comon-aside-->
      <comon-aside></comon-aside>

      <el-container>
        <!--头部导航页也是封装一下，注意这个组件需要被el-header包裹-->
        <el-header>
          <comon-header></comon-header>
        </el-header>

        <el-main>
          <!--el-main包裹的就是内容区，也就是路由出口-->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>

  </div>


</template>

<script setup>
//引入组件
import ComonHeader from "../components/ComonHeader/index.vue"
import ComonAside from "../components/ComonAside/index.vue"


</script>

<style lang="less" scoped>
.el-header{
  padding: 0;
}
.common-layout{
  height: 100%;
  & > .el-container{
    height: 100%;
    & > .el-aside{
      background-color: #545c64;
    }
  }
}

</style>
