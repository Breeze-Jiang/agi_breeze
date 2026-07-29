// 返回jsx的函数就是组件
// 函数接受参数，复用组件时，进度，文件，大小不一样
// 组建的属性 html 属性的方式传过来 的props
// 一个组件可以以自定义标签的方式，类html 插入
// 开关标签的xml
const Progress = ({text,percentage,total}) => {
  // console.log(text,percentage,total)
  // es6+ 新增的语法，判断percentage 是否为 undefined 或 null
  // 如果是，就赋值为 0
  percentage ??= 0
  return ( 
    <div className="w-full bg-gray-100 text-left rounded-lg overflow-hidden mb-0.5">
      <div 
        style={{width: `${percentage}%`}} //js运行区域 返回 style 返回一个行内样式的key:value 对象
        className="bg-blue-400 whitespace-nowrap px-1 text-sm">
        {text}
        {percentage.toFixed(2)}%
        {isNaN(total) ? '' : `of ${formatBytes(total)}`}
        
      </div>
    </div>
  )
}
function formatBytes(size) {
  // 计算应该用哪个单位（0=B, 1=kB, 2=MB...），size为0时直接用B
  // 几次方 
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (
    // 1024 的 i次方
    // 把字节数除以对应单位量级，保留两位小数后转回数字
    +(size / Math.pow(1024, i)).toFixed(2) * 1 +
    // 拼接上对应的单位字符串
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}
export default Progress