import React from 'react';
import Link from 'next/link';
import { getAllNotes } from '@/lib/redis';
import SidebarNoteList from './SidebarNoteList2';

export default async function Sidebar() {
  const notes = await getAllNotes();
  console.log(notes);
  return ( 
    <>
      {/* sidebar
      区块 电商网站， 商品介绍， 评论 图片， 售价...
      section 自带的语义是独立的一块内容区域 */}
      <section className="col sidebar">
        <Link href="/">
          <img className='logo' src="/logo.svg" alt="logo" width='22px' height='20px' role='presentation' />
          <strong>LLM Notes</strong>
        </Link>
        <section className="sidebar-menu" role="menubar">
          {/* SideSearchField 未来干 */}
        </section>
        <nav>
          {/* SidebarNoteList */}
          <SidebarNoteList notes={notes} />
          {/* note相当于一个对象 */}
          {/* {
              "1702459181837": '{"title":"sunt aut",...}',
              "1702459182837": '{"title":"qui est",...}',
              "1702459188837": '{"title":"ea molestias",...}'
              } */}
        </nav>
      </section>
    </>
  )
}
