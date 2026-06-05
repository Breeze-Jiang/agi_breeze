function varTest(){
  var x = 1;
  if(true){
    let x = 2;
    console.log(x);
  }
  console.log(x);
}
varTest();
// 外层的x是1 在变量环境中
// 内层的x是2 在词法环境中
// 查找变量时，先在词法环境中查找，再在变量环境中查找