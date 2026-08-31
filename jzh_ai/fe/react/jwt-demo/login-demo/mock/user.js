import jwt from 'jsonwebtoken';
const secret = 'secret819!$'
export default [
  {
    // 401
    url: '/api/repo',
    method: 'get',
    response: req => {
      // Bearer XXXX
      const token = req.headers['authorization'].split(' ')[1];
      console.log(token);
      try {
        let decoded = jwt.verify(token, secret);
        console.log(decoded);
        return {
          code: 0,
          data: decoded.user
        }
      } catch(err) {
        return {
          code: 401,
          msg: 'Invalid token'
        }
      }
      return {
        code: 0,
        token
      }
    }
  },
  {
    url: '/api/login',
    method: 'post', 
    timeout: 2000,
    response: (req, res) => {
      const body = req.body;
      console.log(body);
      if (body.username !== 'admin' || body.password !== '123456') {
        return {
          code: -1,
          message: 'username or password 错误'
        }
      }
      // 服务器端 给用户颁发token 
      // user json 放入   J
      // Web  StateLess  W
      // Token 加密算法 颁发的令牌 加盐 秘密的key
      const token = jwt.sign(
        { 
          user: body.username,
          role: 'admin'
        },
        secret,
        {
          expiresIn: 86400
        }
      )
      return {
        code: 0,  // 未有错误
        user: {
          username: body.username
        },
        token: token
      }
    }
  }
]