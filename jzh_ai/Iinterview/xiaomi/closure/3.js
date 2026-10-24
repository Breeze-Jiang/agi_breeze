function bar(){
  console.log(myName)
}

function foo(){
  var myName = 'jikeban'
  bar()
}

var myName = 'xiaomi'
foo()