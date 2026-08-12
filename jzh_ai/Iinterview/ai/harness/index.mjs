import OpenAI from 'openai';
import { config } from 'dotenv';
config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.BASE_URL,
});

const askLLM = async (prompt) => {
  const res = await client.chat.completions.create({
    model: process.env.MODEL_NAME,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });
  return res.choices[0].message.content;
}

const generateCandidates = (prompt, n = 3) => {
  const tasks = Array.from({length: n}, () => askLLM(prompt));
  return Promise.all(tasks);
}

async function judge(code) {
  const prompt = `你是一个严格的代码评审，请判断下面代码是否正确实现“数组去重函数”
  要求：
  - 只返回一个数字评分（0-10）
  - 不要解释
  代码：
  ${code}
  `;
  const res = await askLLM(prompt);
  const score = parseFloat(res);// string -> number
  return isNaN(score) ? 0 : score;
}   

async function evaluateAll(candidates) {
  const results = [];
  for(const code of candidates) {
    const score = await judge(code);
    results.push({code, score});
  }
  return results;
}

function pickBest(results) {
  return results.sort((a,b) => b.score - a.score)[0];
}
async function harness(prompt) {
  console.log('生成多个候选者....\n');
  // 候选人
  const candidates = await generateCandidates(prompt, 3);
  console.log('候选结果:');
  candidates.forEach((c, i) => {
    console.log(`\n---- Candidate ${i + 1} ----\n ${c}`)
  });
  // 打分
  console.log(`\n Evaluate Candidates...\n`);
  const evaluated = await evaluateAll(candidates);

  const best = pickBest(evaluated);

  return best.code;
}

const bestCode = await harness("请使用javascript 实现一个数组去重函数");
console.log(bestCode);
