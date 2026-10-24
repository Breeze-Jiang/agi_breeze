//记忆函数
function Add() {
  let num = 0
  return function foo() {
    console.log(++num)
  }
}

const res = Add()
res()
res()