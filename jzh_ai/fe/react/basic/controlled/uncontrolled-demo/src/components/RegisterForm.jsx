import { useState } from 'react';



function RegisterForm() {
  // 注册表单
  // 再vue 里面ref 简单数据类型， reactive 复杂数据类型 对象
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }
  const handleSubmit = () => {
    console.log(form);
  }
  return (
    <div>
      Register Form
      <input name="username" value={form.username} onChange={handleChange} placeholder="请输入用户名" />
      <input name="password" value={form.password} onChange={handleChange} placeholder="请输入密码" />
      <button type="submit" onClick={handleSubmit}>提交</button>
    </div>
  );
}
export default RegisterForm;