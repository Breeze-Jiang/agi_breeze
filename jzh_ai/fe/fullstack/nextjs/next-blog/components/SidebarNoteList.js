import SidebarNoteItem from '@/components/SidebarNoteItem';

// SidebarNoteList(RSC SEO ) -> SidebarNoteItem (交互 CSR)


// 核心思想 ：父组件 RSC 取数据 + 渲染 HTML 给搜索引擎看；子组件客户端组件处理用户交互。 最小化客户端组件范围 。
export default async function SidebarNoteList({ notes }) {
  return (
    <ul className="notes-list">
      {
        notes.map(([noteId, note]) => {
          return (
            <li key={noteId}>
              <SidebarNoteItem noteId={noteId} note={note} />
            </li>
          )
        })
      }
    </ul>
  )
}