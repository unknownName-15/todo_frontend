import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TodoItem from '../components/TodoItem';


export default function TodoListPage({ user, onLogout }) {
  const [todos, setTodos]       = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab]   = useState('high'); // 'high' | 'medium' | 'none'
  const navigate = useNavigate();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data } = await api.get('/todos');
      setTodos(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.put(`/todos/${id}`);
      setTodos(todos.map((t) => (t.id === id ? data : t)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = async (id, content, due_date, start_time, end_time) => {
  try {
    const { data } = await api.patch(`/todos/${id}`, {
      content,
      due_date,
      start_time,
      end_time,
    });
    setTodos(todos.map((t) => (t.id === id ? data : t)));
  } catch (e) {
    console.error(e);
  }
};

  const handlePriority = async (id, current) => {
    const next =
      current === 'none'   ? 'high'   :
      current === 'high'   ? 'medium' :
      'none';
    try {
      const { data } = await api.patch(`/todos/${id}/priority`, { priority: next });
      setTodos(todos.map((t) => (t.id === id ? data : t)));
    } catch (e) {
      console.error(e);
    }
  };

  const highTodos   = todos.filter((t) => t.priority === 'high');
  const mediumTodos = todos.filter((t) => t.priority === 'medium');
  const noneTodos   = todos.filter((t) => t.priority === 'none');

  const tabs = [
    { key: 'high',   label: '가장 중요', color: '#e53e3e', list: highTodos },
    { key: 'medium', label: '중요',      color: '#38a169', list: mediumTodos },
    { key: 'none',   label: '없음',      color: '#ddd',    list: noneTodos },
  ];

  const activeList = tabs.find((t) => t.key === activeTab)?.list || [];

  return (
    <div className="app-wrapper">
      {/* 네비게이션 */}
      <nav className="top-nav">
        <div className="nav-left">
          <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className={`line ${isMenuOpen ? 'open' : ''}`}></div>
            <div className={`line ${isMenuOpen ? 'open' : ''}`}></div>
          </button>
          <span className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
  SESSION TASK.
</span>
        </div>
        <div className="nav-right">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: '#888' }} className="user-email">
                {user.email}
              </span>
              <button className="login-btn" onClick={onLogout}>LOGOUT</button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => navigate('/')}>LOGIN</button>
          )}
        </div>
      </nav>

{/* 메뉴 */}
<div className={`full-menu ${isMenuOpen ? 'active' : ''}`}>
  <div className="menu-inner">
    <ul className="main-nav">
      <li className="nav-item">
        <div className="dropdown-label" onClick={() => setIsScheduleOpen(!isScheduleOpen)}>
          내 일정
          <i className={`ri-add-line ${isScheduleOpen ? 'rotate' : ''}`}></i>
        </div>
        <ul className={`sub-nav ${isScheduleOpen ? 'open' : ''}`}>
          <li onClick={() => { window.location.href = '/calendar/day'; }}>일별</li>
          <li onClick={() => { window.location.href = '/calendar/week'; }}>주별</li>
          <li onClick={() => { window.location.href = '/calendar/month'; }}>월별</li>
        </ul>
      </li>
    </ul>
  </div>
</div>

      {/* 메인 콘텐츠 */}
      <main className="content-container">
        <div className="todo-header">
          <span className="date-label">ALL TASKS</span>
          <h2 className="main-title">내 할일</h2>
        </div>

        {/* 탭 */}
        <div className="priority-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`priority-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span
                className="priority-dot"
                style={{ background: activeTab === tab.key ? tab.color : '#ddd' }}
              />
              {tab.label}
              <span className="priority-tab-count">{tab.list.length}</span>
            </button>
          ))}
        </div>

        {/* 할일 목록 */}
        <div className="task-list">
          {activeList.length === 0 ? (
            <div className="empty-state">
              해당 중요도의 할일이 없습니다.
            </div>
          ) : (
            activeList.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onPriority={handlePriority}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}