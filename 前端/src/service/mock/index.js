import Mock from "mockjs";
import permissionApi from "./permission";
import homeApi from "./home";
// 其他mock数据导入...

// 保持原有mock配置不变
Mock.mock(/api\/login/,"post",permissionApi.getMenu);
Mock.mock(/home\/getTableData/,homeApi.getTableData);
// 其他mock配置... 