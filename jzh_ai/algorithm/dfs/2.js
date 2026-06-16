//递归的升级
function dfsPreOderIter(root,res = []) {
  if (!root) {
    return [];//递归的退出条件
  }
  const stack = [root];
  const res = [];
  while (stack.length) {
    const node = stack.pop();
    res.push(node.val);
    if (node.right) {
      stack.push(node.right);
    }
    if (node.left) {
      stack.push(node.left);
    }
  }
  return res;//结果
}