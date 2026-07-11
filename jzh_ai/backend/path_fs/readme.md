- path.join & path.resolve
  都可以拼接路径
  区别：
  - path.resolve 将多个路径拼成一个绝对路径，返回一个**解析后**的绝对路径
    如果传入了相对路径，会根据当前工作目录为基准，计算绝对路径，如果传入了绝对路径，就以传入的绝对路径为准

  当第一个参数都是绝对路径时，resolve 和 join 会返回相同的路径
  如果是相对路径，resolve 会以当前工作目录为基准，计算绝对路径，join会直接拼接路径
  工程化思维 根目录 / ，开发代码目录src


- path.dirname
  返回路径的目录名
  例如：/a/b/c/123.js -> /a/b/c

- path.basename
  返回路径的文件名，并可选的去除给定的文件扩展名
  例如：
  console.log(path.basename('/a/b/c.js'))         -> c.js
  console.log(path.basename('/a/b/c.js','.js'))   -> c
  console.log(path.basename('/a/b/c.js','js'))    -> c.
  console.log(path.basename('/a/b/c.js','s'))     -> c.j

- path.normalize
  返回路径的标准化版本
  例如：
  console.log(path.normalize('a/b//c/d/e/..')) -> a/b/c/d/e

- path.extname
  返回路径的文件扩展名
  例如：
  console.log(path.extname('/a/b/c.js')) -> .js

- path.parse
  解析路径，返回一个对象
  例如：
  console.log(path.parse('/home/user/dir/file.text'))
  -> {
    root: '/home/',
    dir: '/home/user/dir',
    base: 'file.text',
    ext: '.text',
    name: 'file'
  }
