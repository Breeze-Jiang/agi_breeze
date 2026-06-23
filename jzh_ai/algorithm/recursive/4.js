const flatten = (arr) => {
  let result = [];
  arr.forEach((item)=>{
    if(Array.isArray(item)){
      result = result.concat(flatten(item));
    }else{
      result.push(item);
    }
  })
  return result;
}
console.log(flatten([1,[2,[3,4,5]]]));