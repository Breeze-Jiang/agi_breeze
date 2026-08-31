// node redis 客户端， 驱动
import Redis from 'ioredis';
const redis = new Redis(); // 默认
// hash key 是字符串id ， 值是 note 的序列化字符串
const initialData = {
  "1702459181837": '{"title":"sunt aut","content":"quia et suscipit suscipit recusandae","updateTime":"2023-12-13T09:19:48.837Z"}',
  "1702459182837": '{"title":"qui est","content":"est rerum tempore vitae sequi sint","updateTime":"2023-12-13T09:19:48.837Z"}',
  "1702459188837": '{"title":"ea molestias","content":"et iusto sed quo iure","updateTime":"2023-12-13T09:19:48.837Z"}'
}
export async function getAllNotes() {
  // hash 数据类型
  const data = await redis.hgetall('notes');
  if (Object.keys(data).length === 0) {
    await redis.hset('notes', initialData);
  }
  return await redis.hgetall('notes');
  // - Redis 服务端：Hash 数据 → RESP 文本（序列化）
  // - ioredis 客户端：RESP 文本 → JS 对象（反序列化）
}
// 全局哈希表
// ├── "notes" → 指向 Hash 对象 A（内部表 A）
// ├── "user:1" → 指向 Hash 对象 B（内部表 B）
// └── "post:1" → 指向 Hash 对象 C（内部表 C）

// 内部表 A（Hash "notes"）
// ├── hash("1702459181837") → 下标 6 → value
// ├── hash("1702459182837") → 下标 2 → value
// └── hash("1702459188837") → 下标 4 → value

// 内部表 B（Hash "user:1"）  ← 这是另一个独立表
// ├── hash("name") → 下标 3 → "Tom"      ← 这里也叫 "name"
// ├── hash("age") → 下标 5 → 20           ← 和表 A 互不干扰