
function partition(nums, left, right) {
  let i = left;
 let j = right;
//检查一遍数组
while (i < j) {
  //第一项作为基准值
  //不开销新的空间 原地排序
  while(i<j&&nums[j]>nums[left]){
    //右侧比基准值大的数 放到右边的数组
    j--;//退出的时候是找到了第一个比基准值小的数
  }
  while(i<j&&nums[i]<=nums[left]){
    //左侧比基准值小的数 放到左边的数组
    i++;//退出的时候是找到了第一个比基准值大的数
  }
  //元素交换
  [nums[i],nums[j]]=[nums[j],nums[i]]
 }
//基准值放到正确的位置
[nums[left],nums[i]]=[nums[i],nums[left]]
return i;//返回基准值的位置索引，作为分界线的索引
}
function quickSort(nums, left, right) {
 if(left >= right){
  return;
 }
 //基准值的索引
 const pivot = partition(nums,left,right);
 //递归排序
 quickSort(nums,left,pivot-1);
 quickSort(nums,pivot+1,right);
}

const arr = [10,5,2,3,7,6,4,8,9];
quickSort(arr,0,arr.length-1);
console.log(arr);