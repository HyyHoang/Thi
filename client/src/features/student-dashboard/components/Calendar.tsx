import { useState } from 'react';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];
const DAY_NAMES = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

export default function Calendar({ today }: { today: Date }) {
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = view.getFullYear(), month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  const isToday = (d: number | null) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="cal-wrapper">
      <div className="cal-hero" style={{ background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)' }}>
        <div className="cal-hero-left">
          <span className="cal-hero-num">{today.getDate()}</span>
          <span className="cal-hero-slash">/</span>
          <span className="cal-hero-month-sm">{today.getMonth() + 1}</span>
        </div>
        <div className="cal-hero-right">
          <div className="cal-hero-dayname">{DAY_NAMES[today.getDay()]}</div>
          <div className="cal-hero-year">{today.getFullYear()}</div>
        </div>
        <div className="cal-hero-orb" />
        <div className="cal-hero-orb2" />
      </div>

      <div className="cal-body">
        <div className="cal-nav-row">
          <button className="cal-nav" onClick={() => setView(new Date(year, month - 1, 1))}>‹</button>
          <span className="cal-nav-title">{MONTHS[month]} {year}</span>
          <button className="cal-nav" onClick={() => setView(new Date(year, month + 1, 1))}>›</button>
        </div>
        <div className="cal-grid">
          {WEEKDAYS.map((d, i) => (
            <div key={d} className={`cal-wday${i === 0 || i === 6 ? ' cal-wend-h' : ''}`}>{d}</div>
          ))}
          {cells.map((d, i) => {
            const col = i % 7;
            const weekend = col === 0 || col === 6;
            return (
              <div
                key={i}
                className={[
                  'cal-cell',
                  !d ? 'cal-null' : '',
                  d && isToday(d) ? 'cal-today' : '',
                  d && weekend && !isToday(d) ? 'cal-wend' : '',
                ].filter(Boolean).join(' ')}
              >
                {d || ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
