import axios from "axios";
import { getToken } from "@/utils/setToken";

// 创建自定义错误提示函数（不依赖Element UI）
const showErrorMessage = (message) => {
    console.error(message);
    // 如果需要UI反馈，可以使用store存储错误消息
    store.commit('addNotification', { type: 'error', message });
};

const myAxios = axios.create({
    baseURL: "/api",
    timeout: 3000,
});

// 请求前拦截器
myAxios.interceptors.request.use(
    (request) => {
        request.headers["token"] = getToken("token");
        return request;
    },
    (error) => {
        console.error(error);
        return Promise.reject(error);
    }
);

// 响应拦截器
myAxios.interceptors.response.use(
    (response) => {
        // 检查 response.data 是否存在
        if (response.data) {
            const { code, message } = response.data;
            if (code !== 200) {
                showErrorMessage(message || "code:" + code);
            }
        } else {
            showErrorMessage("服务器返回数据为空");
        }
        return response;
    },
    (error) => {
        // 服务器返回了非 200 状态码的响应时
        if (error.response) {
            // 服务器返回了错误响应
            const { status, message } = error.response.data || {};
            showErrorMessage(message || "服务器返回错误");
        } else if (error.request) {
            // 请求已发出但没有收到响应
            showErrorMessage("请求超时或网络错误");
        } else {
            // 发生了其他错误
            showErrorMessage("请求发生错误");
        }
        return Promise.reject(error);
    }
);

export default myAxios; 