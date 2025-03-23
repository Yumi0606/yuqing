<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
//@是一个别名路径，@通常被配置为指向项目的src目录（或者是一个特定的目录，具体取决于项目的配置）
import HelloWorld from './components/HelloWorld.vue'
import Login from "./components/login.vue";
import main from "@/components/main.vue";
import TodoList from './components/TodoList.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
    Login,
    main,
    TodoList
  }
}
</script>

<!--style lang 是vue特有属性-->
<style lang="scss">
@import url('./assets/css/reset.css');

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  //margin-top: 60px;
}
</style>
