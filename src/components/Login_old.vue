<template>
  <div class="login">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>通用后台管理系统</span>
      </div>

      <el-form label-width="80px" :model="form" ref="form">
        <el-form-item
          label="用户名"
          prop="username"
          :rules="[
            { required: true, message: '请输入用户名!', trigger: 'blur' },
            {
              min: 4,
              max: 10,
              message: '长度要在4-10字符之间',
              trigger: 'blur',
            },
          ]"
        >
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
          :rules="[
            { required: true, message: '请输入用户名!', trigger: 'blur' },
            {
              min: 8,
              max: 20,
              message: '长度要在8-20字符之间',
              trigger: 'change',
            },
            {
              pattern:/^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$)([^\u4e00-\u9fa5\s]){8,20}$/,
              message: '字母、数字和标点符号至少包含两种',
              trigger: 'change',
            }
          ]"
        >
          <el-input type="password" v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="login('form')">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      form: {
        username: "",
        password: "",
      },
    };
  },
  methods:{
  login(form) {
    this.$refs[form].validate((valid) => {
      if (valid) {
       //还没有服务器验证语句,先直接把form数据存到localStorage中
       //  this.axios.post('https://rapserver.sunmi.com/app/mock/340/login',this.form)
        localStorage.setItem('username',this.form.username)
        this.$message({message:"登陆成功!",type:'success'})
        this.$router.push('/home')
      } else {
        console.error(this.form);
        return false;
      }
    });
  },
  }
};
</script>
<style lang="scss">
.login {
  width: 100%;
  height: 100%;
  position: absolute;
  background: purple;

  .box-card {
    width: 450px;
    margin: 200px auto;
  }
}
</style>
