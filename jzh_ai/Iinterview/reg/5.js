let template = `我是{{name}}, 年龄{{age}}， 性别{{sex}}`;
let person = {
  name: '赖庆庆',
  age: 17,
  sex: '男'
}
function render(template, data) {
  const reg = /\{\{(\w+)\}\}/ // {} 长度
  if (reg.test(template)) {
    const name = reg.exec(template)[1];
    template = template.replace(reg, data[name])
    return render(template, data);
  }
  return template;
}
console.log(render(template, person));