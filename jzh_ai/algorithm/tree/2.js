const tree={
    val:'A',
    left:{
        val:'B',
        left:{
            val:'D',
            left:null,
            right:null
        },
        right:{
            val:'E',
            left:null,
            right:null
        }
    },
    right:{
        val:'C',
        left:{
            val:'f',
            left:null,
            right:null
        },
        right:{
            val:'G',
            left:null,
            right:null
        }
    }
}

function preOrder(tree){
    // 递归遍历
    if(!tree){
        return
    }
    // 前序遍历
   
        console.log('当前节点',tree.val)
        preOrder(tree.left)
        preOrder(tree.right)
}
function inOrder(tree){
    // 递归遍历
    if(!tree){
        return
    }
    // 中序遍历
   
        preOrder(tree.left)
        console.log('当前节点',tree.val) //根节点先
        preOrder(tree.right)
}
function postOrder(tree){
    // 递归遍历
    if(!tree){
        return
    }
    // 后序遍历
   preOrder(tree.left)
        preOrder(tree.right)
        console.log('当前节点',tree.val) //根节点最后
       
}
function levelOrder(tree){
    const queue=[]; //队列实现
    const result=[]; //结果数组
    if(!tree) {return result;}
    queue.push(tree);
    while(queue.length){
        const node=queue.shift();
        result.push(node.val);
        if(node.left){
            queue.push(node.left);
        }
        if(node.right){
            queue.push(node.right);
        }
    }
    return result;
}
preOrder(tree)
console.log('-----------------')
inOrder(tree)
console.log('-----------------')
postOrder(tree)
console.log('-----------------')
console.log(levelOrder(tree))
