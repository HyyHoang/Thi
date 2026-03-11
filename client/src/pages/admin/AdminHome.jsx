import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminHome.css';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'
];
const DAY_NAMES = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];

const WEATHER_CODES = {
  0:  { label: 'Quang đãng',    icon: '☀️',  bg: 'sunny'  },
  1:  { label: 'Ít mây',        icon: '🌤️', bg: 'sunny'  },
  2:  { label: 'Mây rải rác',   icon: '⛅',  bg: 'cloudy' },
  3:  { label: 'Nhiều mây',     icon: '☁️',  bg: 'cloudy' },
  45: { label: 'Sương mù',      icon: '🌫️', bg: 'foggy'  },
  48: { label: 'Sương giá',     icon: '🌫️', bg: 'foggy'  },
  51: { label: 'Mưa phùn nhẹ',  icon: '🌦️', bg: 'rainy'  },
  53: { label: 'Mưa phùn',      icon: '🌦️', bg: 'rainy'  },
  55: { label: 'Mưa phùn dày',  icon: '🌧️', bg: 'rainy'  },
  61: { label: 'Mưa nhẹ',       icon: '🌧️', bg: 'rainy'  },
  63: { label: 'Mưa vừa',       icon: '🌧️', bg: 'rainy'  },
  65: { label: 'Mưa to',        icon: '🌧️', bg: 'rainy'  },
  71: { label: 'Tuyết nhẹ',     icon: '🌨️', bg: 'snowy'  },
  80: { label: 'Mưa rào nhẹ',   icon: '🌦️', bg: 'rainy'  },
  81: { label: 'Mưa rào',       icon: '🌧️', bg: 'rainy'  },
  82: { label: 'Mưa rào mạnh',  icon: '⛈️', bg: 'stormy' },
  95: { label: 'Dông',          icon: '⛈️', bg: 'stormy' },
  99: { label: 'Dông mưa đá',   icon: '⛈️', bg: 'stormy' },
};
const getInfo = (code) => WEATHER_CODES[code] || { label: 'Không xác định', icon: '🌡️', bg: 'cloudy' };

/* ── Calendar ── */
function Calendar({ today }) {
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = view.getFullYear(), month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();

  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="cal-wrapper">
      {/* Hero banner */}
      <div className="cal-hero">
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

      {/* Mini grid */}
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
              <div key={i} className={[
                'cal-cell',
                !d ? 'cal-null' : '',
                d && isToday(d) ? 'cal-today' : '',
                d && weekend && !isToday(d) ? 'cal-wend' : '',
              ].filter(Boolean).join(' ')}>
                {d || ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Weather ── */
function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loc, setLoc] = useState('Vị trí của bạn');

  useEffect(() => {
    if (!navigator.geolocation) { fetch10(10.8231, 106.6297, 'TP. Hồ Chí Minh'); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { geocode(p.coords.latitude, p.coords.longitude); fetch10(p.coords.latitude, p.coords.longitude, null); },
      () => fetch10(10.8231, 106.6297, 'TP. Hồ Chí Minh')
    );
  }, []);

  async function geocode(lat, lon) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const d = await r.json();
      setLoc(d.address?.city || d.address?.town || d.address?.village || d.address?.county || 'Vị trí của bạn');
    } catch { /* ignore */ }
  }

  async function fetch10(lat, lon, fb) {
    if (fb) setLoc(fb);
    try {
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature` +
        `&hourly=temperature_2m&timezone=Asia%2FHo_Chi_Minh&forecast_days=1`
      );
      setWeather(await r.json());
    } catch { setError('Không thể tải thời tiết'); }
    finally { setLoading(false); }
  }

  if (loading) return (
    <div className="w-loading">
      <div className="w-dots"><span/><span/><span/></div>
      <p>Đang tải thời tiết…</p>
    </div>
  );
  if (error) return <div className="w-error">⚠️ {error}</div>;

  const cur = weather.current;
  const info = getInfo(cur.weather_code);
  const hourly = (weather.hourly?.temperature_2m || []).slice(0, 13);
  const mn = Math.min(...hourly), mx = Math.max(...hourly);
  const pts = hourly.map((t, i) => `${(i / (hourly.length - 1)) * 100}%,${40 - ((t - mn) / (mx - mn || 1)) * 32}`);
  const sparkPath = `M ${pts.join(' L ')}`;
  const fillPath = `M 0%,44 L ${pts.join(' L ')} L 100%,44 Z`;

  return (
    <div className={`w-card w-bg-${info.bg}`}>
      <div className="w-glow" />

      <div className="w-header">
        <div className="w-loc">
          <svg width="11" height="13" viewBox="0 0 11 13"><path d="M5.5 0A4.5 4.5 0 001 4.5C1 7.94 5.5 13 5.5 13S10 7.94 10 4.5A4.5 4.5 0 005.5 0zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="rgba(255,255,255,0.75)"/></svg>
          {loc}
        </div>
        <div className="w-icon">{info.icon}</div>
      </div>

      <div className="w-temp-block">
        <div className="w-temp">{Math.round(cur.temperature_2m)}<span className="w-unit">°C</span></div>
        <div className="w-desc-block">
          <div className="w-desc">{info.label}</div>
          <div className="w-feels">Cảm giác như {Math.round(cur.apparent_temperature)}°</div>
        </div>
      </div>

      <div className="w-pills">
        <div className="w-pill">
          <span className="w-pill-icon">💧</span>
          <span className="w-pill-val">{cur.relative_humidity_2m}%</span>
          <span className="w-pill-lbl">Độ ẩm</span>
        </div>
        <div className="w-pill">
          <span className="w-pill-icon">💨</span>
          <span className="w-pill-val">{Math.round(cur.wind_speed_10m)}<small>km/h</small></span>
          <span className="w-pill-lbl">Gió</span>
        </div>
        <div className="w-pill">
          <span className="w-pill-icon">🌡️</span>
          <span className="w-pill-val">{Math.round(mn)}–{Math.round(mx)}°</span>
          <span className="w-pill-lbl">Hôm nay</span>
        </div>
      </div>

      {hourly.length > 2 && (
        <div className="w-spark">
          <svg viewBox="0 0 100 48" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <path d={fillPath} fill="url(#sg)" />
            <path d={sparkPath} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="w-spark-labels">
            <span>0h</span><span>6h</span><span>12h</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── AdminHome ── */
export default function AdminHome() {
  const today = new Date();
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  //const isAdmin = user?.role === 0;

  return (
    <div className="admin-home">
      <div className="admin-top">
        <div className="admin-greeting">
          <h2>Trang chủ quản trị</h2>
          <p className="admin-welcome">Xin chào, <strong>{user.username || user.email || 'Admin'}</strong>! 👋</p>
        </div>
        {/* {isAdmin && (
          <Link className="admin-users-btn" to="/admin/users">
            <span>👥</span> Quản lý tài khoản
          </Link>
        )} */}
      </div>

      <div className="admin-widgets">
        <div className="admin-widget"><Calendar today={today} /></div>
        <div className="admin-widget"><WeatherWidget /></div>
      </div>
    </div>
  );
}