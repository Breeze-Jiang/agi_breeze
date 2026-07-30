import * as React from 'react';
import {type MemberEntity} from '../model/member';
import { getMemberCollection } from '../api/memberApi';
import { useState, useEffect } from 'react';

const MemberRow= (props) => {
  const {member} = props;
  return (
    <tr>
      <td>
        <img src={member.avatar_url} style={{maxWidth: '10rem'}}/>
      </td>
      <td><span>{member.id}</span></td>
      <td><span>{member.login}</span></td>
    </tr>
  )
}


const MemberTable: React.FC = () => {
  const [memberCollection, setMemberCollection] = React.useState<MemberEntity[]>([])
  
  React.useEffect(() => {
    // 挂载后请求接口 不会影响组件的渲染
    (async () => {
      const memberCollection = await getMemberCollection();
      setMemberCollection(memberCollection);
    })();

  },[])
  return (
    <table>
      <thead>
        <tr>
          <th>Avatar</th>
          <th>ID</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {
          memberCollection.map(member => (
            <MemberRow key={member.id} member={member} />
          ))
        }
      </tbody>
    </table>
  )
}
export default MemberTable;
