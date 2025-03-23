<template>
  <!--页面采用el-row和el-col布局-->
  <el-row
      class="home"
      :gutter="20"
  >
    <!--这一个el-col是第一列的内容-->
    <el-col
        :span="6"
        style="margin-top:20px"
    >
      <!--第一列有两个卡片，这个是第一个-->
      <el-card shadow="hover">
        <div class="user">
          <!--img的图片在资源中-->
          <img
              src="../../assets/img/user.jpg"
              alt=""
          >
          <div class="userinfo">
            <p class="name">Admin</p>
            <p class="role">超级管理员</p>
          </div>
        </div>

        <div class="login-info">
          <p>上次登录时间：<span>2022-7-11</span></p>
          <p>上次登录地点：<span>北京</span> </p>
        </div>
      </el-card>
      <!--第二个卡片中有一个表格-->
      <el-card
          style="margin-top:20px"
          shadow="hover"
          height="500px"
      >
        <!--表格的数据和列的数据，等下定义-->
        <el-table :data="tableData">
          <el-table-column
              v-for="(item,key) in tableLabel"
              :key="item"
              :prop="key"
              :label="item"
          >
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>

    <!--第二列-->
    <el-col
        :span="18"
        style="margin-top: 20px"
        class="main"
    >
      <!--订单销售情况-->
      <div class="num">
        <!--会有多个el-card，countData等下定义-->
        <el-card
            :body-style="{display:'flex',padding:0}"
            v-for="item in countData"
            :key="item.name"
        >
          <component
              class="icons"
              :is="item.icon"
              :style="{'background-color':item.color}"
          ></component>
          <div class="details">
            <p class="num">￥{{item.value }}</p>
            <p class="txt">{{item.name }}</p>
          </div>
        </el-card>
      </div>
      <!--下面是图表数据，每一个el-card都代表一个图表-->
      <el-card style="height:280px">
        <div
            ref="echart"
            style="height: 280px;;"
        >
        </div>
      </el-card>

      <div class="graph">
        <el-card style="height: 260px">
          <div
              ref="userechart"
              style="height: 240px"
          ></div>
        </el-card>
        <el-card style="height: 260px">
          <div
              ref="videoechart"
              style="height: 240px"
          ></div>
        </el-card>
      </div>
    </el-col>
  </el-row>

</template>

