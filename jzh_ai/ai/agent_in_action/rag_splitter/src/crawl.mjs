// 网页爬虫，并解析其中指定的部分，css选择器
import axios from "axios" //标准http 请求库
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
// esm export default 一个 ，export 很多
// * as 都引入 
import * as cheerio from "cheerio" //解析html字符串为DOM对象

const targetUrl = "https://juejin.cn/post/7662576341775745058"

export async function crawlPage(){
  try {
    // const res = await axios.get(targetUrl)
    const {data : html} = await axios.get(targetUrl) //等价于：const response = await axios.get(targetUrl) const html = response.data
    const $ = cheerio.load(html)//dom 对象
// 1。html 字符串在命令行，内存中虚拟化一个dom对象 出来
//都是树状结构 进程 ，申请分配 内存
//2. css 
// cheerio 可以让js 开发者，以前端思维，简单高效完成指定 url ，指定部分的爬取工作，不需要用正则
    const pageContent = $(".main-area p").text()
    return pageContent
  } catch (error) {
    console.error("爬取网页失败:", error)
    throw error
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  crawlPage().then(console.log).catch(() => {
    process.exitCode = 1
  })
}
// 向url 发送http请求 ，html字符串
// text / html 的html document 文本
// 去拿其中的一部分，cherrio适合的
// 在内存中，把html字符串解析为DOM对象
// DOM 关键？关键 
// html 字符串 -》 DOM 对象 -》 css 选择器 入参 -》 树的遍历 -》 节点返回
