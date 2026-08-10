import { useRef } from 'react';

function CommentBox() {
  const textareaRef = useRef(null);
  function handleSubmit() {
    const comment = textareaRef.current.value;
    if (!comment) {
      alert('请输入评论内容////');
      return;
    }
    console.log(comment);
  }
  return (
    <div>
      Comment Box
      <textarea ref={textareaRef} placeholder="请输入评论内容" />
      <button onClick={handleSubmit}>提交评论</button>
    </div>
  );
}
export default CommentBox;