module.exports = {
    root: true,
    env: {
        node: true,
        es6: true,
    },
    extends: [
        
    ],
    parserOptions: {
        parser: '@babel/eslint-parser',
        sourceType: 'module',
        requireConfigFile: false // 允许不使用 Babel 配置文件
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
};
