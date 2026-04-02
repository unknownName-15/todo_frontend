import { useState, useEffect, useRef } from 'react';
import { useNavigate, useRoutes } from 'react-router-dom';
import api from './api/axios';
import AuthCallback from './components/AuthCallback';
import TodoItem from './components/TodoItem';
import TodoListPage from './pages/TodoListPage';
import './App.css';
import DayPage   from './pages/DayPage';
import WeekPage  from './pages/WeekPage';
import MonthPage from './pages/MonthPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage   from './pages/TermsPage';

function App() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen]         = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [user, setUser]                     = useState(null);
  const [todos, setTodos]                   = useState([]);
  const [input, setInput]                   = useState('');
  const [priority, setPriority]             = useState('none');
  const [dueDate, setDueDate]               = useState('');
  const [startTime, setStartTime]           = useState('');
  const [endTime, setEndTime]               = useState('');
  const [calendarEvents, setCalendarEvents] = useState([]);
  const dateInputRef = useRef(null);
  const dateInputMobileRef  = useRef(null);
  const [startAmPm, setStartAmPm] = useState('AM');
  const [startHour, setStartHour] = useState('12');
  const [startMin, setStartMin] = useState('00');
  const [endAmPm, setEndAmPm] = useState('PM');
  const [endHour, setEndHour] = useState('12');
  const [endMin, setEndMin] = useState('00');
  const [timeSelected, setTimeSelected] = useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = ['00', '10', '20', '30', '40', '50'];

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }).toUpperCase();
  };

  const getDday = (dateStr) => {
    if (!dateStr) return null;
    const today  = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'D-DAY';
    if (diff > 0)   return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) { fetchTodos(); fetchCalendarEvents(); }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const { data } = await api.get('/todos');
      const sorted = data.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      });
      setTodos(sorted);
    } catch (e) { console.error(e); }
  };

  const fetchCalendarEvents = async () => {
    try {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      const { data } = await api.get(`/calendar?start=${start.toISOString()}&end=${end.toISOString()}`);
      setCalendarEvents(data);
    } catch (e) { console.error(e); }
  };

  const handleLogin = (userData) => { setUser(userData); localStorage.setItem('user', JSON.stringify(userData)); };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); setTodos([]); };

  const convertTo24Hour = (ampm, hour, min) => {
    let h = parseInt(hour);
    if (ampm === 'AM' && h === 12) h = 0;
    if (ampm === 'PM' && h !== 12) h = h + 12;
    return `${String(h).padStart(2, '0')}:${min}`;
  };

  const handleAddTodo = async () => {
    if (!input.trim()) return;
    const finalStartTime = convertTo24Hour(startAmPm, startHour, startMin);
    const finalEndTime   = convertTo24Hour(endAmPm, endHour, endMin);
    try {
      const { data } = await api.post('/todos', {
        content: input, priority,
        due_date: dueDate || null,
        start_time: dueDate ? finalStartTime : null,
        end_time: dueDate ? finalEndTime : null,
      });
      setTodos([data, ...todos]);
      setInput(''); setPriority('none'); setDueDate('');
      setStartAmPm('AM'); setStartHour('12'); setStartMin('00');
      setEndAmPm('PM'); setEndHour('12'); setEndMin('00');
    } catch (e) { console.error(e); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.put(`/todos/${id}`);
      setTodos(todos.map((t) => (t.id === id ? data : t)));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleEdit = async (id, content, due_date, start_time, end_time) => {
    try {
      const { data } = await api.patch(`/todos/${id}`, { content, due_date, start_time, end_time });
      setTodos(todos.map((t) => (t.id === id ? data : t)));
    } catch (e) { console.error(e); }
  };

  const handlePriority = async (id, current) => {
    const next = current === 'none' ? 'high' : current === 'high' ? 'medium' : 'none';
    try {
      const { data } = await api.patch(`/todos/${id}/priority`, { priority: next });
      setTodos(todos.map((t) => (t.id === id ? data : t)));
    } catch (e) { console.error(e); }
  };

  const handleGoogleLogin = () => { window.location.href = 'https://sessiontask.site/auth/google'; };
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSchedule = () => setIsScheduleOpen(!isScheduleOpen);

  return (
    <div className="app-wrapper">
      <nav className="top-nav">
        <div className="nav-left">
          <button className="hamburger-btn" onClick={toggleMenu}>
            <div className={`line ${isMenuOpen ? 'open' : ''}`}></div>
            <div className={`line ${isMenuOpen ? 'open' : ''}`}></div>
          </button>
          <span className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>SESSION TASK.</span>
        </div>
        <div className="nav-right">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="user-email">{user.email}</span>
              <button className="login-btn" onClick={handleLogout}>LOGOUT</button>
            </div>
          ) : (
            <button className="login-btn" onClick={handleGoogleLogin}>LOGIN</button>
          )}
        </div>
      </nav>

      <div className={`full-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="menu-inner">
          <ul className="main-nav">
            <li className="nav-item">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/todos'); setIsMenuOpen(false); }}>내 할일</a>
            </li>
            <li className="nav-item">
              <div className="dropdown-label" onClick={toggleSchedule}>내 일정 <i className={`ri-add-line ${isScheduleOpen ? 'rotate' : ''}`}></i></div>
              <ul className={`sub-nav ${isScheduleOpen ? 'open' : ''}`}>
                <li onClick={() => { window.location.href = '/calendar/day'; }}>일별</li>
                <li onClick={() => { window.location.href = '/calendar/week'; }}>주별</li>
                <li onClick={() => { window.location.href = '/calendar/month'; }}>월별</li>
                <li onClick={() => { navigate('/privacy'); setIsMenuOpen(false); }}>개인정보처리방침</li>
                <li onClick={() => { navigate('/terms'); setIsMenuOpen(false); }}>서비스 약관</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <main className="content-container">
        <div className="todo-header">
          <span className="date-label">{getFormattedDate()}</span>
          <h2 className="main-title">일정 목록</h2>
        </div>

        <div className="input-section">
          {/* ↓ 동그라미 두 개 → 조율 완료/조율 중 토글 버튼으로 교체 */}
          <div className="input-priority">
            <div className="priority-toggle-group">
              <button
              type="button"
                className={`priority-toggle-btn ${priority === 'high' ? 'active-high' : ''}`}
                onClick={() => setPriority(priority === 'high' ? 'none' : 'high')}
                disabled={!user}
              >
                <span className="dot" />
                조율 완료
              </button>
              <button
              type="button"
                className={`priority-toggle-btn ${priority === 'medium' ? 'active-medium' : ''}`}
                onClick={() => setPriority(priority === 'medium' ? 'none' : 'medium')}
                disabled={!user}
              >
                <span className="dot" />
                조율 중
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder={user ? '세션 제목 입력 후 조율 여부를 선택해 주세요.' : '로그인 후 이용 가능합니다.'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
            disabled={!user}
          />

          <div className="due-date-wrap pc-only" onClick={() => dateInputRef.current.showPicker()}>
            <span className="due-date-label">{dueDate ? dueDate : '출발 날짜 선택'}</span>
            <input ref={dateInputRef} type="date" className="due-date-hidden" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={!user} />
          </div>

          {dueDate && (
            <div className="custom-time-picker pc-only">
              <div className="time-select-group">
                <select value={startAmPm} onChange={(e) => setStartAmPm(e.target.value)}>
                  <option value="AM">오전</option><option value="PM">오후</option>
                </select>
                <select value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                  {hours.map(h => <option key={h} value={h}>{h}시</option>)}
                </select>
                <select value={startMin} onChange={(e) => setStartMin(e.target.value)}>
                  {minutes.map(m => <option key={m} value={m}>{m}분</option>)}
                </select>
              </div>
              <span className="time-dash">~</span>
              <div className="time-select-group">
                <select value={endAmPm} onChange={(e) => setEndAmPm(e.target.value)}>
                  <option value="AM">오전</option><option value="PM">오후</option>
                </select>
                <select value={endHour} onChange={(e) => setEndHour(e.target.value)}>
                  {hours.map(h => <option key={h} value={h}>{h}시</option>)}
                </select>
                <select value={endMin} onChange={(e) => setEndMin(e.target.value)}>
                  {minutes.map(m => <option key={m} value={m}>{m}분</option>)}
                </select>
              </div>
            </div>
          )}

          <button className="submit-icon" onClick={handleAddTodo} disabled={!user}>
            <i className="ri-arrow-right-up-line"></i>
          </button>
        </div>

        <div className="task-list">
          {user && todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} onPriority={handlePriority} />
          ))}
        </div>
      </main>
    </div>
  );
}

function Root() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) setUser(JSON.parse(saved));
  }, []);
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };

  const routes = useRoutes([
    { path: '/', element: <App /> },
    { path: '/todos', element: <TodoListPage user={user} onLogout={handleLogout} /> },
    { path: '/calendar/day', element: <DayPage user={user} onLogout={handleLogout} /> },
    { path: '/calendar/week', element: <WeekPage user={user} onLogout={handleLogout} /> },
    { path: '/calendar/month', element: <MonthPage user={user} onLogout={handleLogout} /> },
    { path: '/auth/callback', element: <AuthCallback onLogin={(u) => setUser(u)} /> },
    { path: '/privacy', element: <PrivacyPage /> },
    { path: '/terms', element: <TermsPage /> },
  ]);
  return routes;
}
export default Root;
