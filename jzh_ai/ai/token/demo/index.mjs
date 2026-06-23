import {getEncoding} from 'js-tiktoken'
//decode 解码
//gpt 官方的token编码器 cl100k_base
//utf-8 编码器
const enc = getEncoding('cl100k_base')
const text = "hello tiktoken!你好！"//utf-8 编码
//llm encode 编码器 
const tokens = enc.encode(text)
console.log(tokens,tokens.length)
const decodeText = enc.decode(tokens)
console.log(decodeText)