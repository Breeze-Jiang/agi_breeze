// prompt(文本输入) -> tokens(编码器) -> 向量化(embedding 语义) -> llm(transform) -> tokens(解码器) -> output(文本输出)
import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,//阿里百炼
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
})
//llm 向量化的封装函数
async function getEmbedding(text){
  //文本 数学 高纬度 向量化 
  const response = await client.embeddings.create({
    //嵌入模型 embedding
    model: 'text-embedding-v4',
    input: text,
    dimension: 1024 //维度
  })
  return response.data[0].embedding;
}

//余弦相似度计算
function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] ** 2;
    magB += vecB[i] ** 2;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
async function run (){
  // 语义相似
  // 文本匹配绝对不一致 
  //embedding 语义 1024 维度向量化-1 到 1 之间数字表达
  const text = "Andrej Karpathy LLM Tokenization 分词原理"
  const text2 = "karpathy 讲解大模型BPE字词分词"
  const text3 = "今天天气很好"
  const embedding = await getEmbedding(text)
  const embedding2 = await getEmbedding(text2)
  const embedding3 = await getEmbedding(text3)
  console.log(embedding,embedding.length)
  console.log(embedding2,embedding2.length)
  console.log(embedding3,embedding3.length)
  //余弦相似度计算
  const similarity = cosineSimilarity(embedding, embedding2)
  const similarity3 = cosineSimilarity(embedding, embedding3)
  console.log(similarity,similarity3)
}



run()