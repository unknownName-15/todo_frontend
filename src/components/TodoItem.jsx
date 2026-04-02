import { useState, useEffect } from 'react';

export default function TodoItem({ todo, onToggle, onDelete, onEdit, onPriority }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue]         = useState(todo.content);
  const [dueDate, setDueDate]     = useState(todo.due_date ? todo.due_date.slice(0, 10) : '');
  const [startTime, setStartTime] = useState(todo.start_time ? todo.start_time.slice(0, 5) : '');
  const [endTime, setEndTime]     = useState(todo.end_time ? todo.end_time.slice(0, 5) : '');

  // todo prop이 바뀔 때 (추가/수정 후) state 동기화
  useEffect(() => {
    setValue(todo.content);
    setDueDate(todo.due_date ? todo.due_date.slice(0, 10) : '');
    setStartTime(todo.start_time ? todo.start_time.slice(0, 5) : '');
    setEndTime(todo.end_time ? todo.end_time.slice(0, 5) : '');
  }, [todo]);

  const handleSave = () => {
    if (value.trim()) onEdit(todo.id, value.trim(), dueDate || null, startTime || null, endTime || null);
    setIsEditing(false);
  };

  const getDday = (due) => {
    if (!due) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(due); target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'D-DAY';
    return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
  };

  const dday = getDday(todo.due_date);
  console.log('start_time:', todo.start_time, 'end_time:', todo.end_time);
  // "09:00:00" 형식이든 "09:00" 형식이든 앞 5자리만 사용
  const fmt = (t) => (t ? t.slice(0, 5) : null);
  const timeLabel = fmt(todo.start_time)
    ? fmt(todo.end_time)
      ? `${fmt(todo.start_time)}~${fmt(todo.end_time)}`
      : fmt(todo.start_time)
    : null;

  return (
    <div className={`todo-item ${todo.is_done ? 'done' : ''}`}>

      {/* 조율 상태 뱃지 — type="button" 필수 (엔터 키 오작동 방지) */}
      <button
        type="button"
        className={`priority-badge ${
          todo.priority === 'high'   ? 'badge-high'   :
          todo.priority === 'medium' ? 'badge-medium' : ''
        }`}
        onClick={() => onPriority(todo.id, todo.priority)}
      >
        {todo.priority === 'high'   ? '조율 완료' :
         todo.priority === 'medium' ? '조율 중'   :
         '미조율'}
      </button>

      {/* 사각형 체크박스 */}
      <div className="checkbox-wrapper" onClick={() => onToggle(todo.id)}>
        <div className={`custom-checkbox ${todo.is_done ? 'checked' : ''}`}>
          {todo.is_done && <i className="ri-check-line"></i>}
        </div>
      </div>

      {dday && <span className="dday-badge dday-normal">{dday}</span>}

      {isEditing ? (
        <div className="todo-edit-wrap">
          <input
            className="todo-edit-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsEditing(false); }}
            autoFocus
          />
          <input type="date" className="due-date-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <input type="time" className="time-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <span className="time-sep">~</span>
          <input type="time" className="time-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          <button type="button" className="todo-save" onClick={handleSave}><i className="ri-check-line"></i></button>
        </div>
      ) : (
        <span className="todo-content" onClick={() => onToggle(todo.id)}>{todo.content}</span>
      )}

      {!isEditing && timeLabel && (
        <span className="todo-time-label"><i className="ri-time-line"></i> {timeLabel}</span>
      )}

      <div className="todo-actions">
        {!isEditing && (
          <button type="button" className="todo-edit" onClick={() => setIsEditing(true)} disabled={todo.is_done}>
            <i className="ri-pencil-line"></i>
          </button>
        )}
        <button type="button" className="todo-delete" onClick={() => onDelete(todo.id)}>
          <i className="ri-close-line"></i>
        </button>
      </div>
    </div>
  );
}
