function foo(){
  var myName = '极客时间'
  let test1 = 1
  const test2 = 2
  
  var innerBar = {
    getName:function(){
      console.log(test1)
      return myName
    },
    setmyName:function(newName){
      myName = newName
    }
  }

  return innerBar
}

var bar = foo()
bar.setmyName('极客邦')
console.log(bar.getName())