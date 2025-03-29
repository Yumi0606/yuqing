export function nameRule(rule, value, callback) {
  let reg = /(^[a-zA-Z0-9]{4,10}$)/;
  if (value === "") {
    callback(new Error("请输入用户名"));
  } else if (!reg.test(value)) {
    callback(new Error("请输入4-10位用户名"));
  } else {
    callback();
  }
}

export function passwordRule(rule, value, callback) {
  let reg =
    /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$)([^\u4e00-\u9fa5\s]){8,20}$/;
  if (value === "") {
    callback(new Error("请输入密码"));
  } else if (!reg.test(value)) {
    callback(new Error("字母、数字和标点符号至少包含两种,8-20个字符"));
  } else {
    callback();
  }
}
