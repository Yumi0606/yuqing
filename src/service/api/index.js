import request from './myAxios';

export default {
    login(params) {
        return request({
            url: '/permission/getMenu',
            method: 'post',
            data: params
        });
    },
    getTableData(params) {
        return request({
            url: "/home/getTableData",
            method: "get",
            data: params,
        });
    },
    // 其他API方法保持原样...
}; 