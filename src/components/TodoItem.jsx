import { useState } from 'react';

export default function TodoItem({ todo, onToggle, onDelete, onEdit, onPriority }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue]         = useState(todo.content);
  const [dueDate, setDueDate]     = useState(
    todo.due_date ? todo.due_date.slice(0, 10) : ''
  );
    const [startTime, setStartTime] = useState(
    todo.start_time ? todo.start_time.slice(0, 5) : ''
  );
  const [endTime, setEndTime] = useState(
    todo.end_time ? todo.end_time.slice(0, 5) : ''
  );

  const handleSave = () => {
    if (value.trim()) {
      onEdit(todo.id, value.trim(), dueDate || null, startTime || null, endTime || null);
    }
    setIsEditing(false);
  };

  const handleEditStart = () => {
    setValue(todo.content);
    setDueDate(todo.due_date ? todo.due_date.slice(0, 10) : '');
    setStartTime(todo.start_time ? todo.start_time.slice(0, 5) : '');
    setEndTime(todo.end_time ? todo.end_time.slice(0, 5) : '');
    setIsEditing(true);
  };

  const getDday = (due) => {
    if (!due) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(due);
    target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'D-DAY';
    if (diff > 0)   return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
  };

  const dday = getDday(todo.due_date);
  const ddayClass =
    !dday                  ? '' :
    dday === 'D-DAY'       ? 'dday-today' :
    dday.startsWith('D+')  ? 'dday-over'  :
    parseInt(dday.slice(2)) <= 3 ? 'dday-soon' :
    'dday-normal';

  const priorityClass =
    todo.priority === 'high'   ? 'priority-high'  :
    todo.priority === 'medium' ? 'priority-medium' :
    'priority-none';

  const timeLabel = todo.start_time
    ? todo.end_time
      ? `${todo.start_time.slice(0, 5)}~${todo.end_time.slice(0, 5)}`
      : todo.start_time.slice(0, 5)
    : null;

  return (
    <div className={`todo-item ${todo.is_done ? 'done' : ''}`}>
      <button
        className={`priority-btn ${priorityClass}`}
        onClick={() => onPriority(todo.id, todo.priority)}
        title={
          todo.priority === 'high'   ? '가장 중요' :
          todo.priority === 'medium' ? '중요' :
          '중요도 없음'
        }
      />

      {dday && <span className={`dday-badge ${ddayClass}`}>{dday}</span>}

      {isEditing ? (
        <div className="todo-edit-wrap">
          <input
            className="todo-edit-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            autoFocus
          />
          <input
            type="date"
            className="due-date-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <input
            type="time"
            className="time-input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <span className="time-sep">~</span>
          <input
            type="time"
            className="time-input"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <button className="todo-save" onClick={handleSave}>
            <i className="ri-check-line"></i>
          </button>
        </div>
      ) : (
        <span className="todo-content" onClick={() => onToggle(todo.id)}>
          {todo.content}
        </span>
      )}

      {!isEditing && timeLabel && (
  <span className="todo-time-label">
    <i className="ri-time-line"></i> {timeLabel}
  </span>
)}

      <div className="todo-actions">
        {!isEditing && (
          <button
            className="todo-edit"
            onClick={handleEditStart}
            disabled={todo.is_done}
            title="수정"
          >
            <i className="ri-pencil-line"></i>
          </button>
        )}
        <button className="todo-delete" onClick={() => onDelete(todo.id)} title="삭제">
          <i className="ri-close-line"></i>
        </button>
      </div>
    </div>
  );
}