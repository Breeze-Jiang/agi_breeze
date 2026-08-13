export default [
  {
    url:'/api/todos',
    method:'get',
    timeout:2000,
    response:(req,res) => {
      return {
        code:0,
        todos:[
          {
            id:1,
            title:'学习react',
            completed:false
          },
          {
            id:2,
            title:'学习vue',
            completed:false
          }
        ]
      }

    }
    
  }
]