import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../api/axios';

export default function MonthPage({ user, onLogout }) {
  const [currentMonth, setCurrentMonth]   = useState(dayjs());
  const [events, setEvents]               = useState([]);
  const [holidays, setHolidays]           = useState([]);
  const [isMenuOpen, setIsMenuOpen]       = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [form, setForm]                   = useState({ title: '', start: '', end: '', description: '' });
  const [editEvent, setEditEvent]         = useState(null);
  const [selectedDay, setSelectedDay]     = useState(null);
  const navigate = useNavigate();

  const startOfMonth   = currentMonth.startOf('month');
  const daysInMonth    = currentMonth.daysInMonth();
  const startDayOfWeek = startOfMonth.day();
  const weeks          = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchEvents();
    fetchHolidays();
  }, [currentMonth]);

  const fetchEvents = async () => {
    try {
      const start = startOfMonth.toISOString();
      const end   = startOfMonth.endOf('month').endOf('day').toISOString();
      const { data } = await api.get(`/calendar?start=${start}&end=${end}`);
      setEvents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHolidays = async () => {
    try {
      const start = startOfMonth.toISOString();
      const end   = startOfMonth.endOf('month').endOf('day').toISOString();
      const { data } = await api.get(
        `/calendar/holidays?start=${start}&end=${end}`
      );
      setHolidays(data);
    } catch (e) {
      console.error(e);
    }
  };

  const isHoliday = (day) =>
    holidays.some((h) => {
      const hDate = h.start?.date || h.start?.dateTime?.slice(0, 10);
      return hDate === day.format('YYYY-MM-DD');
    });

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

  const getEventsForDay = (day) =>
    events.filter((e) => {
      const eventDate = e.start?.date || e.start?.dateTime?.slice(0, 10);
      return eventDate === day.format('YYYY-MM-DD');
    });

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const cells = [
    ...Array(startDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, 'day')),
  ];

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
  <span className="date-label">MONTHLY</span>
  <div className="month-nav">
    <button className="month-nav-btn" onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}>
      <i className="ri-arrow-left-s-line"></i>
    </button>
    
    <h2 className="main-title">
      {currentMonth.format('MMMM YYYY')}
    </h2>
    
    <button className="month-nav-btn" onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}>
      <i className="ri-arrow-right-s-line"></i>
    </button>

    {/* 다른 페이지와 동일한 플러스 아이콘 버튼 추가 */}
    <button className="icon-add-btn" title="일정 추가" onClick={() => {
      setEditEvent(null);
      setForm({
        title: '',
        start: currentMonth.startOf('month').format('YYYY-MM-DDT09:00'),
        end:   currentMonth.startOf('month').format('YYYY-MM-DDT10:00'),
        description: ''
      });
      setShowForm(true);
    }}>
      <i className="ri-add-circle-line"></i>
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

        {/* 달력 그리드 */}
        <div className="cal-month-grid">
          {weeks.map((w, i) => (
            <div key={w} className={`cal-month-week-label ${i === 0 ? 'sunday' : ''}`}>{w}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="cal-month-cell empty" />;
            const isToday    = day.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
            const isSelected = selectedDay?.format('YYYY-MM-DD') === day.format('YYYY-MM-DD');
            const isSunday   = day.day() === 0;
            const holiday    = isHoliday(day);
            const dayEvents  = getEventsForDay(day);
            const isRed      = isSunday || holiday;

            return (
              <div
                key={day.format()}
                className={`cal-month-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <span className={`cal-month-day-num ${isRed ? 'red-day' : ''}`}>
                  {day.format('D')}
                </span>
                {holiday && <span className="holiday-dot" />}
                {dayEvents.slice(0, 2).map((e) => (
                  <div key={e.id} className="cal-month-event-dot" title={e.summary} />
                ))}
                {dayEvents.length > 2 && (
                  <span className="cal-month-more">+{dayEvents.length - 2}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* 선택한 날 일정 */}
        {selectedDay && (
          <div className="cal-selected-day">
            <h3 className="cal-selected-day-title">
              {selectedDay.format('M월 D일')} 일정
              {isHoliday(selectedDay) && (
                <span className="holiday-label">
                  {holidays.find((h) => (h.start?.date || h.start?.dateTime?.slice(0, 10)) === selectedDay.format('YYYY-MM-DD'))?.summary}
                </span>
              )}
            </h3>
            {selectedDayEvents.length === 0 ? (
              <p className="priority-section-empty">일정이 없습니다.</p>
            ) : (
              selectedDayEvents.map((event) => (
                <div key={event.id} className="cal-event">
                  <span className="cal-event-title">{event.summary}</span>
                  <span className="cal-event-time">
                    {event.start?.dateTime
                      ? `${dayjs(event.start.dateTime).format('HH:mm')} - ${dayjs(event.end.dateTime).format('HH:mm')}`
                      : '종일'}
                  </span>
                  <div className="cal-event-actions">
                    <button onClick={() => handleEditStart(event)}><i className="ri-pencil-line"></i></button>
                    <button onClick={() => handleDelete(event.id)}><i className="ri-close-line"></i></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}