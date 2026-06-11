let arr = [10, 2, 32, 5];
// 一定要传函数,否则按ASCII码排序
arr.sort((a, b) => a - b);
console.log(arr); 