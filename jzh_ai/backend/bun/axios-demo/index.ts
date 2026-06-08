//http 请求接口
//bun 代替npm做包管理器
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function chat() {
  //llm 可能出错，异常
  //比如请求超时，llm忙，apikey错误
  try {
    //get 请求有上限
    //apikey存在 GET 请求不安全 明文传输
    // 图片 上传 post 请求体 可以
    //请求行 url ，method，http version
    //请求头 headers ，content-type,accept,authorization
    //请求体 body ，json 格式
    // fetch http 请求api
    //axios http 请求的框架，封装了fetch，企业级的http请求库
    const res = await axios.post(`${process.env.DEEPSEEK_API_BASE_URL}/chat/completions`, {
      model: "deepseek-v4-flash",
      messages: [
        {
          role: "user",
          content: "你好,介绍一下bun"
        }
      ]
    }
      , {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    )
    // axios 默认会在响应前面带上data
    console.log(res.data.choices[0].message.content);
  } catch (error:any) {
    console.log(error.message);
  }
}
chat();
