function add(a:number,b:number) :number {
    return a+b; // + 是加法也是字符串拼接
}
let a = 1;
let b = '2';
//add(a,parseInt(b));// api parseInt 转换为数字
let c = add(a,Number(b));//强制类型转换
//add(a,+b);//隐式类型转换