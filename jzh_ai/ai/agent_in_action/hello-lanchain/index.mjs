import { chatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';
dotenv.config();
const model = new chatOpenAI({
  modelName: 'deepseek-v4-flash',
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
  },
}  
);

const response = await model.invoke('你好');
console.log(response.content);