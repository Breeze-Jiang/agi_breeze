export const USERS = Object.freeze({
  '001': Object.freeze({ id: '001', name: 'jzh', email: 'zh@qq.com', role: 'admin' }),
  '002': Object.freeze({ id: '002', name: 'guangguang', email: 'guangguang@qq.com', role: 'user' }),
  '003': Object.freeze({ id: '003', name: 'li', email: 'li@qq.com', role: 'user' }),
})

export const GUIDE_URI = 'docs:/guide'
export const GUIDE_TEXT = `MCP Server 使用指南
功能：提供用户查询等工具。
使用：MCP Client 可以发现 query_user 工具并按用户 ID 查询示例数据。`

export function queryUser(userId) {
  const user = USERS[userId]
  if (!user) {
    return {
      found: false,
      text: `用户ID${userId}不存在.可用id:${Object.keys(USERS).join(',')}`,
    }
  }
  return {
    found: true,
    text: `用户ID${userId}的详细信息为:姓名${user.name},邮箱${user.email},角色${user.role}`,
  }
}
