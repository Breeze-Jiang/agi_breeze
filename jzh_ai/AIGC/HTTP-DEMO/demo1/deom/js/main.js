// url method http 版本号 请求行
const endpoint = 'https://api.deepseek.com/chat/completions';
//headers 请求头
const headers = {
    'Content-Type': 'application/json',
    //api key 通过
    'Authorization': `Bearer sk-d8cb3a10062d4476980b9ab6cc23bdb8`
};

// 请求体
const body = {
    model: 'deepseek-v4-flash',
    messages: [
        {
            role: 'system',
            content: '你是一个专业的助手',
        },
        {
            role: 'user',
            content: '你好',
        },
    ]
};

try{
    const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        //http 请求里面 传输的不可以是对象，必须是字符串格式
        // 所以这里需要使用 JSON.stringify(body) 来将对象转换为字符串
        body: JSON.stringify(body),
    });//发送请求
    const data = await response.json();//将响应体转换为 JSON 格式
    // 所以这里需要使用 await 关键字来等待响应体转换完成
    console.log(data);
    // 从响应体中提取回复内容
    // 回复内容在 data.choices[0].message.content 中
    document.getElementById('reply').innerHTML = data.choices[0].message.content;//将回复内容显示在页面上
} catch (error) {
    console.log(error.message);
}