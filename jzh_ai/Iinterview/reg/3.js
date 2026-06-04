//干掉w 改成W 大写
const str='hello-world';
//() 分组 不匹配(),但是可以提取

const reg=/-(\w)/g;
console.log(str.match(reg));
const res=str.replace(reg,(_,c)=>{
    console.log(_,c);
    return c.toUpperCase();
})
console.log(res);