<template>
  <div class="login">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>通用后台管理系统</span>
      </div>
      <!--使用elementui中的el-form组件，model绑定的是表单数据对象-->
      <!-- 
:rules: 动态绑定表单验证规则，用于定义表单字段的验证条件和提示信息。
:model: 双向绑定表单数据模型，将表单数据与 Vue 实例中的数据对象绑定。
ref: 为组件注册一个引用名，方便在 Vue 实例中通过 this.$refs 访问该组件。
slot: 定义插槽内容，用于自定义组件的特定部分。
v-model: 双向绑定输入框的值到指定的数据模型。
@click: 监听按钮点击事件，触发指定的方法。
v-: 表示这是一个 Vue.js 的指令，用于实现特定的功能。
: (冒号): 表示动态绑定，将属性的值绑定到一个 JavaScript 表达式。
以下是element-ui特性：
prop: 绑定到表单验证规则的字段名，对应 rules 中的字段。
label：Element UI 中 el-form-item 的属性，用于设置表单项的标签文字。
rules：Element UI 中 el-form 的属性，用于定义表单验证规则
-->
      <el-form label-width="80px" :rules="rules" :model="form" ref="form">
        <el-form-item label="用户名" prop="username">
          <el-input
            type="input"
            placeholder="请输入账号"
            v-model="form.username"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            placeholder="请输入密码"
            v-model="form.password"
          ></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="login('form')">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import { nameRule, passwordRule } from "@/utils/validate";
import { setToken } from "@/utils/setToken";
import router from "@/router";

export default {
  data() {
    return {
      // 定义响应式数据
      form: {
        username: "",
        password: "",
      },
      rules: {
        username: [{ validator: nameRule, trigger: "change" }],
        password: [{ validator: passwordRule, trigger: "change" }],
      },
    };
  },
  methods: {
    async login() {
      try {
        await this.$refs.form.validate();

        const res = await this.service.post("/login", this.form);
        this.$store.commit("setMenu", res.data.menu);
        await router.push("/home");
      } catch (error) {
        if (error.name !== "ValidationError") {
          console.error("登录失败:", error);
          this.$message.error("用户名或密码错误");
        }
      }
    },
  },
};
</script>
<style lang="scss">
.login {
  width: 100%;
  height: 100%;
  position: absolute;
  background: #3ba8f4;

  .box-card {
    width: 450px;
    margin: 200px auto;
  }
}
</style>
