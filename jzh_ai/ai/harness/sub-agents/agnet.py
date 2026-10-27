# 系统模块
import os 
# 写爬虫？ 爬取到内容，找我们需要的部分， 用正则 
import re 
# 子进程  子Agent 再全新的子进程运行， 直接隔离
import subprocess
# 路径模块
from pathlib import Path
import json
from openai import OpenAI 
from dotenv import load_dotenv

load_dotenv(override=True)
# 不要把密钥打印到终端/日志里，只确认接口能否拿到值
print("API key loaded:", bool(os.getenv("DEEPSEEK_API_KEY")))
# Agent工作目录  安全的， 被授权的
# python 没有常量变量之分， 都是变量， 用约定大写来表达
WORKDIR = Path.cwd()
# print(WORKDIR)
MODEL = os.getenv("DEEPSEEK_MODEL")

client = OpenAI(
  base_url = os.getenv("DEEPSEEK_BASE_URL"),
  api_key = os.getenv("DEEPSEEK_API_KEY"),
)

# resp = client.chat.completions.create(
#   model=os.getenv("DEEPSEEK_MODEL"),
#   messages=[
#     {"role": "user", "content": "你好"}
#   ],
# )
# print(resp.choices[0].message.content)
# print("sub agents ,harness 的高级扩展模块")
# 主Agent 系统提示
# python 隐式字符串拼接， 括号里连续放多个字符串字面量
SYSTEM = (
  f"You are a coding agent at {WORKDIR}."
  # 使用task 去执行针对性探索， 或是独立完整的子任务
  "Use task for focused exploration or a self-contained subtask."
)
SUB_SYSTEM = (
  f"You are a coding agent at {WORKDIR}."
  "Complete the given task, then return a concise final answer."
)
# print(SUB_SYSTEM, SYSTEM)
# python 弱类型脚本  
# 类型注解， 不按约束可以
# 传路径字符串， 返回Path 对象
# 所有Agent 公用的函数， 返回一个安全的路径， 不允许超出工作目录
# 否则抛出异常 ValueError
def safe_path(p: str) -> Path:
  # pathlib.Path 特有的 / 运算符， 不是除法， 运算符重载
  # 相当于路径的拼接  path.join(p)
  # python 有个原则， 简洁 人生苦短， 我用python 
  path = (WORKDIR / p).resolve()
  # 逻辑判断语法
  if not path.is_relative_to(WORKDIR):
    # 抛出异常
    raise ValueError(f"Path escapes workspace: {p}")
  return path 

#  跑命令行脚本 sub agent tool
def run_bash(command: str) -> str:
  # 列表
  dangerours = ["rm -rf /", "sudo", "shutdown", "reboot", "> /dev/"]
  # any() 就是只有一个满足就返回真
  # 判断任意一个关键词是否出现在command字符串里。
  if any(d in command for d in dangerours):
    return "Error: Dangerous command blocked"
  
  try:
    # 调用系统shell跑命令
    r = subprocess.run(command, shell = True, cwd=WORKDIR, capture_output = True,
     text=True, errors="replace", timeout=120)
    # 把标准输出 + 错误输出拼一起 
    out = (r.stdout + r.stderr).strip()
    #三元运算符的表达
    return out[:50000] if out else "(no output)"
  except subprocess.TimeoutExpired:
    return "Error: Timeout (120s)"
  # 元祖 
  except (FileNotFoundError, OSError) as e:
    return f"Error: {e}"

# 读文件的工具
# 类型注解 
# Python 里`None`代表**空、无值**，是独立的空对象，不等于 0、空字符串或者 false。
def run_read(path: str, limit: int = None) -> str:
  # 返回一个安全的路径
  # read_text 读取文件内容， 返回字符串 同步操作
  # splitlines() 把字符串按行分割， 返回列表
  try:
    lines = safe_path(path).read_text(encoding="utf-8").splitlines()
    if limit and limit < len(lines):
      lines = lines[:limit] + [f"... ({len(lines)-limit} more)"]
    return "\n".join(lines)[:50000]
  except Exception as e:
    return f"Error: {e}"

def run_write(path: str, content: str) -> str:
    # try：尝试执行写文件逻辑，发生异常直接跳到except
    try:
        # 校验路径安全，得到目标文件的Path对象，防止逃出工作目录
        fp = safe_path(path)
        # 获取文件所在文件夹；parents=True自动创建多级父目录；exist_ok=True目录存在就不报错
        fp.parent.mkdir(parents=True, exist_ok=True)
        # 以utf8编码，把传入的content文本写入文件
        fp.write_text(content, encoding="utf-8")
        # 写入成功，返回提示，告诉AI一共写了多少字节
        return f"Wrote {len(content)} bytes"
    # 捕获所有异常：权限不足、路径非法等各种错误
    except Exception as e:
        # 出错时，返回错误信息给大模型
        return f"Error: {e}"

def run_edit(path: str, old_text: str, new_text: str) -> str:
    # 尝试执行编辑逻辑，出错就跳到except
    try:
        # 校验路径安全，拿到文件Path对象，防止逃出工作目录
        fp = safe_path(path)
        # 读取文件全部内容，utf-8编码
        content = fp.read_text(encoding="utf-8")
        # 如果待查找的旧文本不在文件里面
        if old_text not in content:
            # 返回错误提示，直接结束函数，不修改文件
            return f"Error: Text not found in {path}"
        # 替换：只替换第1处匹配的旧文本，写回原文件
        fp.write_text(content.replace(old_text, new_text, 1), encoding="utf-8")
        # 修改成功，返回提示信息
        return f"Edited {path}"
    # 捕获所有异常（文件不存在、权限问题等）
    except Exception as e:
        # 出现异常，返回错误详情给大模型
        return f"Error: {e}"




CHILD_TOOLS = [
  {
    "type": "function",
    "function": {
      "name": "bash",
      "description": "Run a shell command.",
      "parameters": {
        "type": "object",
        "properties": {
          "command": {
            "type": "string"
          }
        },
        "required": ["command"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "read_file",
      "description": "Read file contents.",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {"type": "string"},
          "limit": {"type": "integer"}
        },
        "required": ["path"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "write_file",
      "description": "Write content to file.",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {"type": "string"},
          "content": {"type": "string"}
        },
        "required": ["path", "content"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "edit_file",
      "description": "Replace extract text in file.",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {"type": "string"},
          "old_text": {"type": "string"},
          "new_text": {"type": "string"}
        },
        "required": ["path", "old_text", "new_text"]
      }
    }
  }
]
# concat 
PARENT_TOOLS = CHILD_TOOLS + [
  {
    "type": "function",
    "function": {
      "name": "task",
      # 给子Agent 分配完全独立的上下文
      "description": "Spawn a subagent with fresh context. It shares the filesystem but not conversation history",
      "parameters": {
        "type": "object",
        "properties": {
          "description": {
            "type": "string",
            "description": "Short description of the task"
          },
          "prompt": {
            "type": "string",
            "description": "Full task instructions for the subagent"
          }
        },
        "required": ["prompt"]
      }
    }
  }
]

# 工具名字和对应的执行函数映射字典
TOOL_HANDLERS = {
  # lambda表达式 可以用于简洁的创建匿名函数
  # () => {}
  # **kw  js ...kw rest 运算符 
  "bash": lambda **kw: run_bash(kw["command"]),
  "read_file": lambda **kw: run_read(kw["path"],kw.get("limit")),
  "write_file": lambda **kw: run_write(kw["path"], 
  kw["content"]),
  "edit_file": lambda ** kw: run_edit(kw["path"],kw["old_text"], kw["new_text"])
}
# 启动子agent, 传入用户任务文本, 返回执行结果
def run_subagent(prompt: str) -> str:
  sub_messages = [{"role": "user", "content": prompt}]
  # 最多尝试30次
  # 下标我不用  占位置
  # 独立的Agentic Loop 
  for _ in range(30):
    response = client.chat.completions.create(
      model = MODEL,
      messages = [{"role":"system", "content": SUB_SYSTEM}] + 
      sub_messages,
      tools = CHILD_TOOLS,
      max_tokens = 8000
    )
    # 取出模型返回的第一条消息对象
    msg = response.choices[0].message
    # 把模型返回消息转字典，加到对话历史，下一轮Ai能用到
    sub_messages.append(msg.model_dump())

    if response.choices[0].finish_reason != "tool_calls":
      break

    results = []
    for tool_call in msg.tool_calls:
      func_name = tool_call.function.name
      # json 格式的工具参数字符串 ， 转成Python 字典
      args = json.loads(tool_call.function.arguments)
      handler = TOOL_HANDLERS.get(func_name)
      # 把字典 展开
      output = handler(**args) if handler else f"Unknown tool: {func_name}"
      results.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": str(output)[:50000]
      })
    sub_messages.extend(results)
  return msg.content or "(no summary)"


def agent_loop(messages: list):
  while True:
    response = client.chat.completions.create(
      model = MODEL,
      messages = [{ "role": "system", "content":SYSTEM }] + messages,
      tools = PARENT_TOOLS,
      max_tokens = 8000
    )
    msg = response.choices[0].message
    print(msg.content, "??")
    # 消息对象转为 Python 字典
    messages.append(msg.model_dump())
    if response.choices[0].finish_reason != "tool_calls":
      return
    # results = []
    # Tool Calls
    msg = response.choices[0].message
    # 先初始化，避免 tool_calls 为空时 messages.extend(results) 报
    # UnboundLocalError，也避免把上一轮的 results 重复提交
    results = []
    if msg.tool_calls:
      for tool_call in msg.tool_calls:
        func = tool_call.function
        args = json.loads(func.arguments)
        # 主Agent分任务
        if func.name == "task":
          # subtask 包含任务的类型
          desc = args.get("description", "subtask")
          prompt = args.get('prompt', "")
          print(f"> task({desc}): {prompt[:80]}")
          # 启动子Agent 
          # 只关注结果 
          output = run_subagent(prompt)
        else: 
          # 主Agent 也可以自己干任务、
          handler = TOOL_HANDLERS.get(func.name)
          output = handler(**args) if handler else f"Unknown tool: {func.name}"
        
        results.append({
          "role": "tool",
          "tool_call_id": tool_call.id,
          "content": str(output)
        })
    messages.extend(results)

if __name__ == "__main__":
  print("Subagent - fresh messages, final text returns")
  print("Enter a question, press Enter to send.Type q to quit.\n")
  history = [] #  创建一个空列表
  while True:
    try:
      query = input("\001\033[36m\002s06 >> \001\033[0m\002")
    # 中断
    # ctrl + d  ctrl + c
    except (EOFError, KeyboardInterrupt):
      break
    print(query)
    if query.strip().lower() in ("q", "exit", ""):
      break
    # 把用户真正输入的内容(query)发出去，
    # 之前写成字符串字面量 "query"，导致无论输入什么都只发 "query"
    history.append({"role": "user", "content": query})
    agent_loop(history)
    

