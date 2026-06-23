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
    if(!tree){ return }
    inOrder(tree.left)                // ✅ 应该递归调用 inOrder
    console.log('当前节点',tree.val)
    inOrder(tree.right)
}
function postOrder(tree){
    if(!tree){ return }
    postOrder(tree.left)              // ✅ 应该递归调用 postOrder
    postOrder(tree.right)
    console.log('当前节点',tree.val)
}
function levelOrder(tree){
    const queue=[];    // 队列：存储待访问的节点
    const result=[];   // 结果数组：按层序顺序收集节点值
    if(!tree) {return result;}  // 空树直接返回空数组
    
    queue.push(tree);  // 1️⃣ 根节点入队
    
    while(queue.length){  // 2️⃣ 队列非空时循环
        const node=queue.shift();  // ⚡ 出队：取队首节点
        result.push(node.val);     // ✅ 访问：记录当前节点值
        
        if(node.left){             // 3️⃣ 左子节点入队
            queue.push(node.left);
        }
        if(node.right){            // 4️⃣ 右子节点入队
            queue.push(node.right);
        }
    }
    return result;  // 返回层序遍历结果
}
preOrder(tree)
console.log('-----------------')
inOrder(tree)
console.log('-----------------')
postOrder(tree)
console.log('-----------------')
console.log(levelOrder(tree))
