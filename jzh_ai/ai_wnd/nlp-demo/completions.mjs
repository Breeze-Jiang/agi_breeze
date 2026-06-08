import client from './client.mjs';

export async function getCompletion(prompt) {
  const response = await client.chat.completions.create({
    model: process.env.MODEL,
    messages: [
      { role: "user", content: prompt },
    ],
  });
  return response.choices[0].message.content;
}
export async function getImage(prompt) {
  const response = await client.images.create({
    prompt: prompt,
    n: 1,
  });
  return response.data[0].url;
}