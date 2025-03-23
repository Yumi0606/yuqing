//引入mock，mock不仅可以拦截请求还可以模拟数据
import Mock from 'mockjs'

//返回一个对象，其中的方法会作为mock拦截成功要调用的方法，并把方法返回值作为请求返回值
export default {
    getMenu: config => {
        //方法会接收到请求的参数，从中取出username, password
        // console.log(config)
        const { username, password } = JSON.parse(config.body)

        // 判断账号和密码是否对应
        //这里我们可以通过多个if判断，来添加多个用户，我们这里用两个if判断代表两个用户，每个用户返回的数据都不同，因为后面我们要做一个权限校验，不同用户渲染不同的菜单
        if (username === 'admin' && password === 'admin123456') {
            //返回一个对象其中有code,data和token(我们使用Mock.Random.guid()来模拟随机的全局唯一标识符),message: '获取成功'
            return {
                code: 200,
                data: {
                    menu: [
                        {
                            path: 'home',
                            name: 'home',
                            label: '首页',
                            icon: 'house',
                            url: 'home/index.vue'
                        },
                        {
                            path: 'user',
                            name: 'user',
                            label: '用户管理',
                            icon: 'user',
                            url: 'user/index.vue'
                        },
                        {
                            label: '其他',
                            icon: 'location',
                            children: [
                                {
                                    path: 'page1',
                                    name: 'page1',
                                    label: '页面1',
                                    icon: 'setting',
                                    url: 'page1/index.vue'
                                },
                                {
                                    path: 'page2',
                                    name: 'page2',
                                    label: '页面2',
                                    icon: 'setting',
                                    url: 'page2/index.vue'
                                }
                            ]
                        }
                    ],
                    token: Mock.Random.guid(),
                    message: '获取成功'
                }
            }
        } else if (username === 'xiaoxiao' && password === 'xiaoxiao') {
            return {
                code: 200,
                data: {
                    menu: [
                        {
                            path: 'home',
                            name: 'home',
                            label: '首页',
                            icon: 's-home',
                            url: 'home/index.vue'
                        }
                    ],
                    token: Mock.Random.guid(),
                    message: '获取成功'
                }
            }
        } else {
            return {
                code: -999,
                data: {
                },
                message: '密码错误'
            }
        }

    }
}
