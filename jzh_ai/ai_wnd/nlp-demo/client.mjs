//llm client 对象
import Openai from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const client = new Openai({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_BASE_URL,
  model: process.env.MODEL
});

// export const a= 2;//  直接导出a变量，其他模块可以引入a变量  随机暴露
// export const b= 3;
export default client;// 默认导出 client对象,默认暴露client对象，其他模块可以直接引入client对象