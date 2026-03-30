import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../api/axios';

export default function DayPage({ user, onLogout }) {
  const [currentDay, setCurrentDay]   = useState(dayjs());
  const [events, setEvents]           = useState([]);
  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ title: '', start: '', end: '', description: '' });
  const [editEvent, setEditEvent]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [currentDay]);

  const fetchEvents = async () => {
    try {
      const start = currentDay.startOf('day').toISOString();
      const end   = currentDay.endOf('day').toISOString();
      const { data } = await api.get(`/calendar?start=${start}&end=${end}`);
      setEvents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editEvent) {
        await api.put(`/calendar/${editEvent.id}`, form);
      } else {
        await api.post('/calendar', form);
      }
      setForm({ title: '', start: '', end: '', description: '' });
      setShowForm(false);
      setEditEvent(null);
      fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await api.delete(`/calendar/${eventId}`);
      fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditStart = (event) => {
    setEditEvent(event);
    setForm({
      title: event.summary || '',
      start: dayjs(event.start.dateTime).format('YYYY-MM-DDTHH:mm'),
      end:   dayjs(event.end.dateTime).format('YYYY-MM-DDTHH:mm'),
      description: event.description || '',
    });
    setShowForm(true);
  };

  const isToday = currentDay.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');

  return (
    <div className="app-wrapper">
      <nav className="top-nav">
        <div className="nav-left">
          <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className={`line ${isMenuOpen ? 'open' : ''}`}></div>
            <div className={`line ${isMenuOpen ? 'open' : ''}`}></div>
          </button>
          <span className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>SESSION TASK.</span>
        </div>
        <div className="nav-right">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: '#888' }} className="user-email">{user.email}</span>
              <button className="login-btn" onClick={onLogout}>LOGOUT</button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => navigate('/')}>LOGIN</button>
          )}
        </div>
      </nav>

      <div className={`full-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="menu-inner">
          <ul className="main-nav">
            <li className="nav-item">
              <a href="#" onClick={() => { navigate('/todos'); setIsMenuOpen(false); }}>내 할일</a>
            </li>
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

      <main className="content-container">
        <div className="todo-header">
  <span className="date-label">DAILY</span>
  <div className="month-nav">
    <button className="month-nav-btn" onClick={() => setCurrentDay(currentDay.subtract(1, 'day'))}>
      <i className="ri-arrow-left-s-line"></i>
    </button>
    
    <h2 className="main-title">
      {isToday ? '오늘' : currentDay.format('M월 D일')}
    </h2>
    
    <button className="month-nav-btn" onClick={() => setCurrentDay(currentDay.add(1, 'day'))}>
      <i className="ri-arrow-right-s-line"></i>
    </button>

    {/* 여기에 플러스 아이콘 버튼을 추가합니다 */}
    <button className="icon-add-btn" title="일정 추가" onClick={() => {
      setEditEvent(null);
      setForm({
        title: '',
        start: currentDay.format('YYYY-MM-DDT09:00'),
        end:   currentDay.format('YYYY-MM-DDT10:00'),
        description: ''
      });
      setShowForm(true);
    }}>
      <i className="ri-add-circle-line"></i> {/* 혹은 ri-add-line */}
    </button>
  </div>
</div>

        {showForm && (
          <div className="cal-form">
            <input className="cal-form-input" placeholder="제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="cal-form-row">
              <input className="cal-form-input" type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
              <input className="cal-form-input" type="datetime-local" value={form.end}   onChange={(e) => setForm({ ...form, end: e.target.value })} />
            </div>
            <input className="cal-form-input" placeholder="설명 (선택)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="cal-form-actions">
              <button className="cal-form-submit" onClick={handleSubmit}>{editEvent ? '수정' : '추가'}</button>
              <button className="cal-form-cancel" onClick={() => { setShowForm(false); setEditEvent(null); }}>취소</button>
            </div>
          </div>
        )}

        <div className="cal-day-timeline">
          {Array.from({ length: 24 }, (_, i) => {
            const hour = i;
            const hourEvents = events.filter((e) => {
              if (!e.start?.dateTime) return false;
              return dayjs(e.start.dateTime).hour() === hour;
            });
            return (
              <div key={hour} className="cal-day-row">
                <span className="cal-day-hour">{String(hour).padStart(2, '0')}:00</span>
                <div className="cal-day-events">
                  {hourEvents.map((event) => (
                    <div key={event.id} className="cal-event">
                      <span className="cal-event-title">{event.summary}</span>
                      <span className="cal-event-time">
                        {dayjs(event.start.dateTime).format('HH:mm')}
                        {event.end?.dateTime && ` - ${dayjs(event.end.dateTime).format('HH:mm')}`}
                      </span>
                      <div className="cal-event-actions">
                        <button onClick={() => handleEditStart(event)}><i className="ri-pencil-line"></i></button>
                        <button onClick={() => handleDelete(event.id)}><i className="ri-close-line"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}