const encoder = new TextEncoder();
// 字符串转Uint8Array二进制
const bytes = encoder.encode("你好");
console.log(bytes);
// 0-255 编码 
const decoder = new TextDecoder();
// 二进制流服务 解码器
const str = decoder.decode(bytes);
console.log(str);