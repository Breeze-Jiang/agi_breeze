import { useState, useEffect } from 'react';
import './App.css';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

type FilterType = 'all' | 'active' | 'completed';

const FILTER_LABELS: Record<FilterType, string> = {
  all: '全部',
  active: '进行中',
  completed: '已完成',
};

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem('todos');
      return saved ? (JSON.parse(saved) as Todo[]) : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState<FilterType>('all');
  const [input, setInput] = useState('');
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInput('');
  };

  const deleteTodo = (id: string) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 350);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const clearCompleted = () => {
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id);
    completedIds.forEach((id) => {
      setRemovingIds((prev) => new Set(prev).add(id));
    });
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => !t.completed));
      setRemovingIds(new Set());
    }, 350);
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return (
    <div className="app">
      <div className="todo-card">
        <h1 className="title">
          <span className="title-icon">📝</span>
          TodoList
        </h1>

        <div className="input-group">
          <input
            type="text"
            className="todo-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="✍️ 添加新任务..."
          />
          <button className="add-btn" onClick={addTodo}>
            添加
          </button>
        </div>

        <div className="filter-group">
          {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''} ${removingIds.has(todo.id) ? 'removing' : ''}`}
            >
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="todo-checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span className="checkmark" />
              </label>
              <span className="todo-text">{todo.text}</span>
              <button
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
                aria-label="删除"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {filteredTodos.length === 0 && todos.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🎉</span>
            <p>暂无任务，添加一个吧!</p>
          </div>
        )}
        {filteredTodos.length === 0 && todos.length > 0 && (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>该分类下没有任务</p>
          </div>
        )}

        <div className="stats-bar">
          <div className="stats">
            <span className="stat-item">
              <strong>{stats.total}</strong> 总计
            </span>
            <span className="stat-item active-count">
              <strong>{stats.active}</strong> 进行中
            </span>
            <span className="stat-item completed-count">
              <strong>{stats.completed}</strong> 已完成
            </span>
          </div>
          {stats.completed > 0 && (
            <button className="clear-btn" onClick={clearCompleted}>
              清除已完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
