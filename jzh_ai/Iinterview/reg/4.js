const res = "hello-world".replace(
  /-(\w)/, 
  (_, c)=>{  
    // console.log(args);
    return c.toUpperCase();
  }
)
console.log(res);