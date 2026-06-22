//f(n) 自顶向下思考
//树状结构
//相同的问题，递归公式
//退出条件 清晰的
function climbStairs(n) {
    if(n == 1){
        return 1;
    }
    if(n == 2){
        return 2;
    }
    return climbStairs(n-1) + climbStairs(n-2);
}
console.log(climbStairs(3))