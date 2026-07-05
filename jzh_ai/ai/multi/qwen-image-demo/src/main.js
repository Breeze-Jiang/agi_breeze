
// console.log(import.meta.env.VITE_QWEN_API_KEY);//前端叫meta.env 后端叫process.env
const apiKey = import.meta.env.VITE_QWEN_API_KEY;
const root = document.querySelector('#app');

const generateImage = async() => {
  const res = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
  {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${apiKey}`
    },
    //请求体传输过程中 二进制字符
    //json字符串序列化
    body:JSON.stringify({
      'model':'qwen-image-2.0-pro',
      'input':{
        'messages':[
          {'role':'user','content':[
              {
                "image": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/thtclx/input1.png"
              },
              {
                "image": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/iclsnx/input2.png"
              },
              {
                "image": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/gborgw/input3.png"
              },
            {text:"图一的女生穿着图二中的黑色裙子按图三的姿势坐下"}
          ]}
        ]
      },
      'parameters':{
        'n':1,
        'size':'1024*1536'
      }
    })
  })
  const data = await res.json();
  console.log(data);
  return data.output.choices[0].image_url;
}
const renderImage = (imageurl) => {
  root.innerHTML = `<img src="${imageurl}" alt="" >`;
}

const main = async() => {
  const imageurl = await generateImage();
  renderImage(imageurl);
}
main();
