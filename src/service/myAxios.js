import axios from "axios";
import { getToken } from "@/utils/setToken";
import { Message } from "element-ui";

const myAxios = axios.create({
    baseURL: "/api",
    timeout: 3000,
});

// 请求前拦截器
myAxios.interceptors.request.use(
    (request) => {
        request.headers["token"] = getToken("token");
        // console.log(request)
        return request;
    },
    //请求发送失败或请求拦截器中抛出错误，触发
    (error) => {
        console.error(error)
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
                Message({ message: message || "code:"+code, type: "error" });
            }
        } else {
            Message({ message: "服务器返回数据为空", type: "error" });
        }
        return response;
    },
    (error) => {
        // 服务器返回了非 200 状态码的响应时
        if (error.response) {
            // 服务器返回了错误响应
            const { status, message } = error.response.data || {};
            Message({ message: message || "服务器返回错误", type: "error" });
        } else if (error.request) {
            // 请求已发出但没有收到响应
            Message({ message: "请求超时或网络错误", type: "error" });
        } else {
            // 发生了其他错误
            Message({ message: "请求发生错误", type: "error" });
        }
        return Promise.reject(error);
    }
);

export default myAxios;
