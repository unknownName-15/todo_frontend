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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).toUpperCase();
  };

  const getDday = (dateStr) => {
    if (!dateStr) return null;
    const today  = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
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
    if (user) {
      fetchTodos();
      fetchCalendarEvents();
    }
  }, [user]);

  const fetchTodos = async () => {
  try {
    const { data } = await api.get('/todos');

    // D-day 기준 정렬 (날짜 없는 건 맨 아래)
    const sorted = data.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });

    setTodos(sorted);
  } catch (e) {
    console.error(e);
  }
};

  const fetchCalendarEvents = async () => {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const { data } = await api.get(
        `/calendar?start=${start.toISOString()}&end=${end.toISOString()}`
      );
      setCalendarEvents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTodos([]);
  };

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
  console.log('finalStartTime:', finalStartTime);
  console.log('finalEndTime:', finalEndTime);
  try {
    const { data } = await api.post('/todos', {
      content: input,
      priority,
      due_date: dueDate || null,
      start_time: dueDate ? finalStartTime : null,
      end_time: dueDate ? finalEndTime : null,
    });
    setTodos([data, ...todos]);
    setInput('');
    setPriority('none');
    setDueDate('');
    setStartAmPm('AM');
    setStartHour('12');
    setStartMin('00');
    setEndAmPm('PM');
    setEndHour('12');
    setEndMin('00');
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

  const handleCalendarEventClick = async (event) => {
  try {
    const dateStr = event.start?.date || event.start?.dateTime?.slice(0, 10);
    const { data } = await api.post('/todos/from-calendar', {
      content: event.summary,
      due_date: dateStr || null,
      calendar_event_id: event.id,
    });

    // 새로 저장된 할일이면 목록에 추가, 이미 있으면 업데이트
    setTodos((prev) => {
      const exists = prev.find((t) => t.calendar_event_id === event.id);
      if (exists) return prev.map((t) => (t.calendar_event_id === event.id ? data : t));
      return [data, ...prev];
    });

    // 캘린더 목록에서 제거
    setCalendarEvents((prev) => prev.filter((e) => e.id !== event.id));
  } catch (e) {
    console.error(e);
  }
};

  const handleGoogleLogin = () => {
    window.location.href = 'https://sessiontask.site/auth/google';
  };

  const toggleMenu     = () => setIsMenuOpen(!isMenuOpen);
  const toggleSchedule = () => setIsScheduleOpen(!isScheduleOpen);

  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback onLogin={handleLogin} />;
  }

  return (
    <div className="app-wrapper">
      {/* 상단 네비게이션 */}
      <nav className="top-nav">
        <div className="nav-left">
          <button className="hamburger-btn" onClick={toggleMenu}>
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
              <button className="login-btn" onClick={handleLogout}>LOGOUT</button>
            </div>
          ) : (
            <button className="login-btn" onClick={handleGoogleLogin}>LOGIN</button>
          )}
        </div>
      </nav>

      {/* 전체 화면 메뉴 */}
      <div className={`full-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="menu-inner">
          <ul className="main-nav">
            <li className="nav-item">
              <a href="#" onClick={() => { navigate('/todos'); setIsMenuOpen(false); }}>
                내 할일
              </a>
            </li>
            <li className="nav-item">
              <div className="dropdown-label" onClick={toggleSchedule}>
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
          <span className="date-label">{getFormattedDate()}</span>
          <h2 className="main-title">일정 목록</h2>
        </div>

        <div className="input-section">
  <div className="input-priority">
    <button
      className={`priority-btn ${priority === 'high' ? 'priority-high' : 'priority-none'}`}
      onClick={() => setPriority(priority === 'high' ? 'none' : 'high')}
      title="가장 중요"
      disabled={!user}
    />
    <button
      className={`priority-btn ${priority === 'medium' ? 'priority-medium' : 'priority-none'}`}
      onClick={() => setPriority(priority === 'medium' ? 'none' : 'medium')}
      title="중요"
      disabled={!user}
    />
  </div>

  <input
    type="text"
    placeholder={user ? '세션 제목 입력 후 조율 여부를 선택해 주세요.' : '로그인 후 이용할 수 있습니다.'}
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
    disabled={!user}
  />

  {/* PC: 텍스트 형태 날짜 입력 */}
<div className="due-date-wrap pc-only" onClick={() => dateInputRef.current.showPicker()}>
  <span className="due-date-label">
    {dueDate ? dueDate : '출발 날짜, 시간 선택'}
  </span>
  <input
    ref={dateInputRef}
    type="date"
    className="due-date-hidden"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    disabled={!user}
  />
</div>

{/* 모바일: 달력 아이콘 버튼 */}
<div className="due-date-wrap mobile-only-flex" onClick={() => dateInputMobileRef.current.showPicker()}>
  <i className={`ri-calendar-line ${dueDate ? 'cal-icon-active' : ''}`}></i>
  <input
    ref={dateInputMobileRef}
    type="date"
    className="due-date-hidden"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    disabled={!user}
  />
</div>

  {/* 시간 입력 — 날짜 선택 후에만 표시 */}
{dueDate && (
  <div className="custom-time-picker pc-only">
    <div className="time-select-group">
      <select value={startAmPm} onChange={(e) => { setStartAmPm(e.target.value); setTimeSelected(true); }}>
        <option value="AM">오전</option>
        <option value="PM">오후</option>
      </select>
      <select value={startHour} onChange={(e) => { setStartHour(e.target.value); setTimeSelected(true); }}>
        {hours.map(h => <option key={h} value={h}>{h}시</option>)}
      </select>
      <select value={startMin} onChange={(e) => { setStartMin(e.target.value); setTimeSelected(true); }}>
        {minutes.map(m => <option key={m} value={m}>{m}분</option>)}
      </select>
    </div>

    <span className="time-dash">~</span>

    <div className="time-select-group">
      <select value={endAmPm} onChange={(e) => { setEndAmPm(e.target.value); setTimeSelected(true); }}>
        <option value="AM">오전</option>
        <option value="PM">오후</option>
      </select>
      <select value={endHour} onChange={(e) => { setEndHour(e.target.value); setTimeSelected(true); }}>
        {hours.map(h => <option key={h} value={h}>{h}시</option>)}
      </select>
      <select value={endMin} onChange={(e) => { setEndMin(e.target.value); setTimeSelected(true); }}>
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
          {!user ? (
            <div className="empty-state">
              로그인하고 오늘의 세션 일정을<br />확인해 보세요.
            </div>
          ) : todos.length === 0 && calendarEvents.length === 0 ? (
            <div className="empty-state">
              아직 계획된 세션 일정이 없습니다. <br />
              새로운 세션 일정을 만들어 보세요.
            </div>
          ) : (
            <>
              {/* 할일 목록 */}
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onPriority={handlePriority}
                />
              ))}

              {/* 구글 캘린더 일정 */}
              {calendarEvents
                .filter((e) => !e.summary?.startsWith('✅'))
                .filter((e) => !todos.some((t) => t.calendar_event_id === e.id))
                .map((event) => {
                  const dateStr = event.start?.date || event.start?.dateTime?.slice(0, 10);
                  const dday    = getDday(dateStr);
                  const ddayClass =
                    !dday                  ? '' :
                    dday === 'D-DAY'       ? 'dday-today' :
                    dday.startsWith('D+')  ? 'dday-over'  :
                    parseInt(dday.slice(2)) <= 3 ? 'dday-soon' :
                    'dday-normal';

                  return (
  <div
    key={event.id}
    className="todo-item calendar-item"
    onClick={() => handleCalendarEventClick(event)}
    style={{ cursor: 'pointer' }}
  >
    <span className="priority-btn" style={{ background: '#4285F4', border: 'none' }} />
    {dday && <span className={`dday-badge ${ddayClass}`}>{dday}</span>}
    <span className="todo-content">{event.summary}</span>
    {event.start?.dateTime && (
      <span className="cal-event-time">
        {new Date(event.start.dateTime).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    )}
  </div>
);
                })
              }
            </>
          )}
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const routes = useRoutes([
    { path: '/',                element: <App /> },
    { path: '/todos',           element: <TodoListPage user={user} onLogout={handleLogout} /> },
    { path: '/calendar/day',    element: <DayPage   user={user} onLogout={handleLogout} /> },
    { path: '/calendar/week',   element: <WeekPage  user={user} onLogout={handleLogout} /> },
    { path: '/calendar/month',  element: <MonthPage user={user} onLogout={handleLogout} /> },
    { path: '/auth/callback',   element: <AuthCallback onLogin={(u) => setUser(u)} /> },
  ]);

  return routes;
}

export default Root;