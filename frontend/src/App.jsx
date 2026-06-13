// === frontend/src/App.jsx ===
import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, TrendingUp, Users, FileText, 
  LogOut, Bell, ChevronRight, Activity, Zap, Plus, History
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from './api';

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

const getWorkoutImage = (title) => {
  if (!title) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80';
  const t = title.toLowerCase();
  if (t.includes('йога')) return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80';
  if (t.includes('кроссфит')) return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=500&q=80';
  if (t.includes('пилатес')) return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80';
  if (t.includes('сайкл') || t.includes('кардио')) return 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=500&q=80';
  if (t.includes('силов') || t.includes('атлетизм')) return 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=500&q=80';
  return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80';
};

const ProgressRing = ({ progress, size = 120, stroke = 8, color = "#2563eb", label = "" }) => {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="#e2e8f0" strokeWidth={stroke} fill="transparent" />
        <circle 
          cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={stroke} fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black">{Math.round(progress)}%</span>
        <span className="text-[10px] text-slate-400 uppercase font-bold">{label}</span>
      </div>
    </div>
  );
};

const DynamicWeightChart = ({ logs }) => {
  if (!logs || logs.length < 2) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
        Внесите хотя бы 2 замера, чтобы увидеть график динамики
      </div>
    );
  }
  const width = 360;
  const height = 120;
  const padding = 20;
  const weights = logs.map(l => parseFloat(l.weight));
  const minW = Math.min(...weights) - 2;
  const maxW = Math.max(...weights) + 2;
  const range = maxW - minW || 1;

  const points = logs.map((l, idx) => {
    const x = padding + (idx / (logs.length - 1)) * (width - padding * 2);
    const y = height - padding - ((parseFloat(l.weight) - minW) / range) * (height - padding * 2);
    return { x, y, weight: l.weight, date: new Date(l.log_date).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'}) };
  });

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
      <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#f1f5f9" strokeWidth="1" />
      <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#e2e8f0" strokeWidth="1.5" />
      <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, idx) => (
        <g key={idx}>
          <circle cx={p.x} cy={p.y} r="4" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
          <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[9px] font-bold fill-slate-700">{p.weight}</text>
          <text x={p.x} y={height - 4} textAnchor="middle" className="text-[7px] font-bold fill-slate-400">{p.date}</text>
        </g>
      ))}
    </svg>
  );
};

// --- ПУБЛИЧНАЯ ЗОНА (Сайт-витрина) ---

function Navbar({ token, user, handleLogout }) {
  const navigate = useNavigate();
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50 text-white shadow-md">
      <Link to="/" className="text-xl font-black tracking-tighter hover:text-blue-400 transition-colors">
        ⚡ PULSECORE
      </Link>
      <div className="flex items-center space-x-4">
        {token ? (
          <>
            <Link to="/cabinet" className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-1.5 px-4 rounded-xl transition">
              Личный кабинет ({user?.full_name?.split(' ')[0]})
            </Link>
            <button 
              onClick={() => { handleLogout(); navigate('/'); }} 
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-4 rounded-xl transition"
            >
              Выйти
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-4 rounded-xl transition">
            Войти в систему
          </Link>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 px-8 py-6 flex justify-between text-xs text-slate-400 mt-auto">
      <div>Соцсети: VK | Telegram</div>
      <div>Работаем с 2026 года. Все права защищены.</div>
      <div>Контактные данные: +7 (495) 000-00-00</div>
    </footer>
  );
}

function MainPage({ workouts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [levelFilter, setLevelFilter] = useState('All');
  const [capacityFilter, setCapacityFilter] = useState('All');

  const navigate = useNavigate();

  const categories = [
    { id: 'All', label: 'Все направления' },
    { id: 'Кроссфит', label: 'Кроссфит' },
    { id: 'Йога', label: 'Йога' },
    { id: 'Пилатес', label: 'Пилатес' },
    { id: 'Кардио', label: 'Кардио' },
    { id: 'Силов', label: 'Силовые' }
  ];

  const filteredWorkouts = workouts.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || w.title.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesLevel = levelFilter === 'All' || 
      (levelFilter === 'Продвинутый' && w.title.toLowerCase().includes('продвинутый')) ||
      (levelFilter === 'Базовый' && !w.title.toLowerCase().includes('продвинутый'));
    const matchesCapacity = capacityFilter === 'All' ||
      (capacityFilter === 'Малые группы' && w.capacity <= 10) ||
      (capacityFilter === 'Большие группы' && w.capacity > 10);

    return matchesSearch && matchesCategory && matchesLevel && matchesCapacity;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div 
        className="relative h-96 bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80')` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-65"></div>
        <div className="relative z-10 px-12 max-w-2xl text-white space-y-4">
          <h2 className="text-4xl font-black leading-tight">
            Новые программы тренировок от лучших специалистов!
          </h2>
          <button 
            onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}
            className="bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-100 font-bold py-2 px-6 rounded text-sm transition"
          >
            Перейти к расписанию
          </button>
        </div>
      </div>

      <main id="catalog" className="p-8 space-y-8 max-w-6xl mx-auto w-full mb-10">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Направления:</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full border border-slate-800 text-xs font-bold transition ${
                  selectedCategory === cat.id ? 'bg-slate-800 text-white' : 'bg-white text-slate-800 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск направления тренировки..."
              className="flex-1 p-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="border border-slate-300 px-6 py-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 transition shadow-sm"
            >
              Фильтры {showFilters ? '▲' : '▼'}
            </button>
          </div>

          {showFilters && (
            <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm grid grid-cols-2 gap-6 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Уровень сложности:</label>
                <div className="flex gap-2">
                  {['All', 'Базовый', 'Продвинутый'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setLevelFilter(lvl)}
                      className={`px-3 py-1 border rounded text-xs font-semibold ${
                        levelFilter === lvl ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300 text-slate-600'
                      }`}
                    >
                      {lvl === 'All' ? 'Все' : lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Вместимость группы:</label>
                <div className="flex gap-2">
                  {['All', 'Малые группы', 'Большие группы'].map(cap => (
                    <button
                      key={cap}
                      onClick={() => setCapacityFilter(cap)}
                      className={`px-3 py-1 border rounded text-xs font-semibold ${
                        capacityFilter === cap ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300 text-slate-600'
                      }`}
                    >
                      {cap === 'All' ? 'Любая' : cap}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Популярные программы:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map(w => {
              const photoUrl = getWorkoutImage(w.title);
              return (
                <div key={w.id} className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-white shadow-sm hover:shadow-lg hover:scale-[1.02] transform transition-all duration-300">
                  <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url('${photoUrl}')` }}></div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                        {w.title.toLowerCase().includes('продвинутый') ? 'Продвинутый' : 'Базовый'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-lg mt-3 leading-tight">{w.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">Вместимость: {w.capacity} чел.</p>
                      <p className="text-sm text-blue-600 font-black mt-2">1500 руб</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/workout/${w.id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm shadow-blue-500/30"
                    >
                      Подробнее
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailPage({ handleBook, token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);

  useEffect(() => {
    api.get('/workout').then(res => {
      const found = res.data.find(w => w.id === id);
      setWorkout(found);
    });
  }, [id]);

  if (!workout) return <div className="text-center p-8 text-slate-500">Загрузка информации...</div>;

  const photoUrl = getWorkoutImage(workout.title);

  const handleBookClick = () => {
    if (!token) {
      toast.warning('Пожалуйста, сначала войдите в систему!');
      navigate('/login');
      return;
    }
    handleBook(workout.id);
  };

  return (
    <main className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8 bg-white my-8 rounded-3xl shadow-sm border border-slate-100">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 font-bold hover:underline mb-4 block">
        &larr; Вернуться в каталог
      </button>
      
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-1/2 h-96 bg-cover bg-center rounded-2xl shadow-inner" style={{ backgroundImage: `url('${photoUrl}')` }}></div>
        
        <div className="lg:w-1/2 space-y-6 flex flex-col justify-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
              {workout.title.toLowerCase().includes('продвинутый') ? 'Продвинутый уровень' : 'Базовый уровень'}
            </span>
            <h2 className="text-4xl font-black text-slate-900 mt-4 leading-tight">{workout.title}</h2>
            <p className="text-sm text-slate-500 mt-2">Тренер: Иванов Иван Иванович</p>
          </div>
          
          <p className="text-3xl font-black text-blue-600">1500 ₽</p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-slate-500 w-20">Уровень:</span>
              <span className="bg-slate-100 px-4 py-1.5 rounded-lg text-sm font-bold text-slate-800">
                {workout.title.toLowerCase().includes('продвинутый') ? 'Продвинутый' : 'Базовый'} ▽
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-slate-500 w-20">Время:</span>
              <span className="bg-slate-100 px-4 py-1.5 rounded-lg text-sm font-bold text-slate-800">
                {new Date(workout.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} ▽
              </span>
            </div>
          </div>

          <button 
            onClick={handleBookClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-lg transition shadow-lg shadow-blue-500/30 mt-4"
          >
            Записаться на занятие
          </button>
        </div>
      </div>

      <div className="space-y-8 pt-8 border-t border-slate-100">
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-slate-900">О программе</h3>
          <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
            {workout.description || 'Высокоэффективная тренировочная программа, направленная на развитие выносливости, улучшение координации и проработку всех мышечных групп. Подходит как для новичков, так и для продвинутых атлетов.'}
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-slate-900">Характеристики</h3>
          <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
            Индивидуальный контроль техники, использование сертифицированного инвентаря, адаптивный уровень нагрузки в соответствии с вашими физиологическими показателями и замерами.
          </p>
        </div>
      </div>
    </main>
  );
}

// --- СТРАНИЦА ВХОДА ---
function LoginPage({ handleLogin, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 mx-auto mb-6">
            <Zap size={32} fill="white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">PulseCore</h1>
          <p className="text-slate-400 mt-2 font-medium">Вход в закрытую систему</p>
        </div>
        
        <form onSubmit={(e) => handleLogin(e, username, password)} className="space-y-5">
          <input 
            type="text" value={username} onChange={(e)=>setUsername(e.target.value)} 
            placeholder="Ваш логин" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
          />
          <input 
            type="password" value={password} onChange={(e)=>setPassword(e.target.value)} 
            placeholder="Пароль" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20">
            Войти
          </button>
          {error && <p className="text-sm text-red-500 text-center font-bold">{error}</p>}
        </form>
        
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-blue-600 font-bold hover:underline">&larr; Вернуться на главную</Link>
        </div>
      </motion.div>
    </div>
  );
}

// --- ПРИВАТНАЯ ЗОНА (КАБИНЕТЫ) ---

// Лейаут с левым черным меню (Сайдбаром)
function CabinetLayout({ children, user, handleLogout }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      <aside className="w-20 lg:w-64 bg-slate-900 m-4 rounded-3xl flex flex-col p-6 text-white shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
            <Zap size={24} fill="white" />
          </div>
          <span className="hidden lg:block text-xl font-black tracking-tighter">PULSECORE</span>
        </div>

        <nav className="flex-1 space-y-2">
          <Link to="/cabinet" className="flex items-center gap-4 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors group">
            <LayoutDashboard size={22} className="text-blue-400" />
            <span className="hidden lg:block text-sm font-bold text-white">Рабочий стол</span>
          </Link>
          {/* КНОПКА ВОЗВРАТА В ПУБЛИЧНЫЙ КАТАЛОГ */}
          <Link to="/" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/10 transition-colors group mt-4">
            <Calendar size={22} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="hidden lg:block text-sm font-medium text-slate-300 group-hover:text-white">Каталог тренировок</span>
          </Link>
        </nav>

        <button 
          onClick={() => { handleLogout(); navigate('/'); }}
          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-red-500/20 text-red-400 transition-colors mt-auto group"
        >
          <LogOut size={22} />
          <span className="hidden lg:block text-sm font-bold uppercase tracking-widest">Выйти</span>
        </button>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto pt-8 px-8 pb-12">
        <header className="flex justify-between items-center mb-8">
            <div className="relative">
                <Bell size={24} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-slate-50 rounded-full"></span>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800">{user.full_name}</p>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white shadow-xl shadow-blue-500/20 border-2 border-white">
                    {user.full_name[0]}
                </div>
            </div>
        </header>
        {children}
      </div>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

// Дашборд Клиента
function ClientDashboard({ user, membership, bookings, workouts, handleBook }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [progressLogs, setProgressLogs] = useState([]);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();

  const loadProgress = async () => {
    try {
      const res = await api.get('/progress/my');
      setProgressLogs(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { loadProgress(); }, []);

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('weight', weight);
    formData.append('body_fat_pct', bodyFat);
    formData.append('muscle_mass', muscleMass);
    formData.append('notes', notes);
    if (photo) formData.append('photo', photo);

    try {
      await api.post('/progress', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Замер сохранен!');
      setWeight(''); setBodyFat(''); setMuscleMass(''); setNotes(''); setPhoto(null);
      loadProgress();
    } catch (err) { toast.error('Ошибка сохранения замера'); }
  };

  const progress = membership ? (membership.visits_left / membership.visits_total) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full">
      <div className="flex border-b border-slate-200 gap-6">
        <button onClick={() => setActiveTab('overview')} className={`pb-3 font-bold text-sm transition-all ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}>Обзор кабинета</button>
        <button onClick={() => setActiveTab('progress')} className={`pb-3 font-bold text-sm transition-all ${activeTab === 'progress' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}>Мой прогресс (Замеры и Фото)</button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div key="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-700">Статус подписки</h3>
                  <div>
                    <p className="text-4xl font-black text-blue-600">{membership?.type || 'Нет абонемента'}</p>
                    <p className="text-slate-400 mt-1">Истекает: {membership ? new Date(membership.end_date).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <ProgressRing progress={100 - progress} label="Визиты" />
                  <ProgressRing progress={progressLogs.length > 0 ? parseFloat(progressLogs[progressLogs.length-1].body_fat_pct) : 20} color="#f97316" label="Жир %" />
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between">
                 <div>
                   <p className="text-slate-400 text-sm">Текущий вес</p>
                   <p className="text-5xl font-black">{progressLogs.length > 0 ? progressLogs[progressLogs.length-1].weight : '75'} <span className="text-xl font-normal text-slate-500">кг</span></p>
                 </div>
                 <div onClick={() => setActiveTab('progress')} className="h-12 bg-white/5 rounded-2xl flex items-center px-4 justify-between border border-white/10 cursor-pointer hover:bg-white/10 transition">
                   <span className="text-xs font-bold">Внести замеры</span>
                   <ChevronRight size={16} />
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <History size={20} className="text-blue-600" /> Мои оформленные записи
                </h3>
                <div className="space-y-4">
                  {bookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                          {new Date(b.created_at).getDate()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{b.workout?.title}</p>
                          <p className="text-xs text-slate-400">Статус: <span className="text-blue-600 font-bold uppercase">{b.status === 'registered' ? 'Записан' : b.status === 'attended' ? 'Посетил' : 'Пропустил'}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && <p className="text-slate-400 italic">У вас еще нет записей на тренировки.</p>}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Zap size={20} className="text-orange-500" /> Быстрая запись
                </h3>
                <div className="grid gap-4">
                  {workouts.slice(0,3).map(w => (
                    <div key={w.id} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-400 transition-all flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{w.title}</p>
                        <p className="text-xs text-slate-400">Свободно: {w.capacity} мест</p>
                      </div>
                      <button onClick={() => navigate(`/workout/${w.id}`)} className="bg-white border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 p-2 rounded-xl transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="progress" className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-fit">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus size={20} className="text-blue-600" /> Новый замер тела
              </h3>
              <form onSubmit={handleProgressSubmit} className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Вес (кг)</label><input type="number" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} required className="w-full p-3 bg-slate-50 rounded-xl outline-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Жир %</label><input type="number" step="0.1" value={bodyFat} onChange={e=>setBodyFat(e.target.value)} required className="w-full p-3 bg-slate-50 rounded-xl outline-none" /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Мышцы %</label><input type="number" step="0.1" value={muscleMass} onChange={e=>setMuscleMass(e.target.value)} required className="w-full p-3 bg-slate-50 rounded-xl outline-none" /></div>
                </div>
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Фото формы</label><input type="file" onChange={e=>setPhoto(e.target.files[0])} className="text-xs" /></div>
                <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">Сохранить замер</button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"><h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Activity size={20} className="text-blue-600" /> Динамика веса</h3><div className="h-40 w-full"><DynamicWeightChart logs={progressLogs} /></div></div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"><h3 className="text-xl font-bold mb-6 flex items-center gap-2"><History size={20} className="text-blue-600" /> Галерея формы</h3>
                <div className="grid grid-cols-3 gap-4">
                  {progressLogs.filter(l => l.photo_url).map(l => (
                    <div key={l.id} className="relative rounded-2xl overflow-hidden border border-slate-100">
                      <img src={`http://localhost:5000${l.photo_url}`} alt="Progress" className="w-full h-32 object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-white text-[10px] font-bold text-center">{new Date(l.log_date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Дашборд Тренера
function TrainerPage({ user, workouts }) {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [bookings, setBookings] = useState([]);

  const loadBookings = async (workoutId) => {
    try {
      const res = await api.get(`/booking/workout/${workoutId}`);
      setBookings(res.data);
      setSelectedWorkout(workoutId);
    } catch (err) { toast.error('Ошибка загрузки записей'); }
  };

  const changeStatus = async (bookingId, status) => {
    try {
      await api.put(`/booking/${bookingId}`, { status });
      toast.success('Статус посещения обновлен!');
      loadBookings(selectedWorkout);
    } catch (err) { toast.error('Ошибка при обновлении статуса'); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full">
      <div><h1 className="text-3xl font-black text-slate-800">Журнал тренера 🏋️</h1><p className="text-slate-500">Отмечайте присутствие клиентов.</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"><h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Calendar size={20} className="text-blue-600" /> Ваши тренировки</h3>
          <div className="space-y-3">
            {workouts.map(w => (
              <div key={w.id} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-400 transition-all flex items-center justify-between">
                <div><p className="font-bold text-slate-800">{w.title}</p><p className="text-xs text-slate-400">{new Date(w.start_time).toLocaleDateString()}</p></div>
                <button onClick={() => loadBookings(w.id)} className="bg-white border border-slate-200 text-xs font-bold py-1.5 px-4 rounded-xl hover:bg-blue-600 hover:text-white transition">Записи</button>
              </div>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {selectedWorkout && (
            <motion.div key={selectedWorkout} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Users size={20} className="text-green-600" /> Клиенты</h3>
              <div className="space-y-3">
                {bookings.length > 0 ? bookings.map(b => (
                  <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div><p className="font-bold text-slate-800">{b.user?.full_name}</p><p className="text-xs text-slate-400">Статус: <span className={`font-bold ml-1 ${b.status === 'registered' ? 'text-blue-600' : 'text-green-600'}`}>{b.status}</span></p></div>
                    {b.status === 'registered' && (
                      <div className="flex gap-2">
                        <button onClick={() => changeStatus(b.id, 'attended')} className="bg-green-600 text-white text-xs font-bold py-1 px-3 rounded-xl transition">Посетил</button>
                        <button onClick={() => changeStatus(b.id, 'missed')} className="bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-xl transition">Пропуск</button>
                      </div>
                    )}
                  </div>
                )) : <p className="text-slate-400 italic">Пусто</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Дашборд Администратора
function AdminPage() {
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(null);

  const loadAdminData = async () => {
    try {
      const [statsRes, clientsRes] = await Promise.all([api.get('/report/stats'), api.get('/user/clients')]);
      setStats(statsRes.data); setClients(clientsRes.data);
    } catch (err) { toast.error('Ошибка загрузки данных'); } finally { setLoading(false); }
  };

  useEffect(() => { loadAdminData(); }, []);

  const filteredClients = clients.filter(c => c.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleExport = async () => {
    try {
      const response = await api.get('/report/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url; link.setAttribute('download', 'attendance_report.csv');
      document.body.appendChild(link); link.click(); link.remove();
      toast.success('Отчет CSV успешно экспортирован!');
    } catch (e) { toast.error('Ошибка при генерации отчета'); }
  };

  const handleRenewMembership = async () => {
    if (!selectedClientId) return toast.warning('Сначала выберите клиента!');
    const membership = clients.find(c => c.id === selectedClientId)?.memberships?.[0];
    if (!membership) return toast.error('Нет активного абонемента');
    try {
      const res = await api.put(`/membership/${membership.id}/renew`);
      toast.success(res.data.message); setSelectedClientId(null); loadAdminData();
    } catch (err) { toast.error('Ошибка при продлении абонемента'); }
  };

  if (loading) return <div className="text-center p-8">Загрузка...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full">
      <div><h1 className="text-3xl font-black text-slate-800">Панель администратора 👑</h1></div>
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase">Абонементы</p><p className="text-3xl font-black text-blue-600 mt-2">{stats.activeMemberships} шт.</p></div><div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold"><Zap size={20} /></div></div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase">Записи</p><p className="text-3xl font-black text-green-600 mt-2">{stats.totalBookings} шт.</p></div><div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-bold"><Calendar size={20} /></div></div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase">Выручка</p><p className="text-3xl font-black text-orange-600 mt-2">{stats.revenueEstimate} ₽</p></div><div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-bold"><Activity size={20} /></div></div>
        </div>
      )}
      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск клиента..." className="w-full p-3 border border-slate-200 rounded-2xl text-sm outline-none bg-white shadow-sm" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 text-blue-600">База клиентов</h3>
          <table className="min-w-full text-sm">
            <thead><tr className="border-b text-slate-400 font-bold"><th className="pb-3 text-left">ФИО</th><th className="pb-3 text-left">Абонемент</th><th className="pb-3 text-right">Остаток</th></tr></thead>
            <tbody>
              {filteredClients.map(c => (
                <tr key={c.id} onClick={() => setSelectedClientId(c.id === selectedClientId ? null : c.id)} className={`border-b cursor-pointer ${c.id === selectedClientId ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                  <td className="py-4 font-semibold text-slate-800">{c.full_name}</td>
                  <td className="py-4 text-slate-500">{c.memberships[0]?.type || 'Нет'}</td>
                  <td className="py-4 text-right"><span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">{c.memberships[0]?.visits_left ?? 0}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleRenewMembership} className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">Продлить абонемент (+12)</button>
        </div>
        <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between">
          <div><h3 className="text-lg font-bold">Выгрузка отчетов</h3><p className="text-slate-400 text-xs mt-2">Экспорт CSV для Excel.</p></div>
          <button onClick={handleExport} className="w-full bg-blue-600 text-white p-3 rounded-2xl font-bold hover:bg-blue-500">Сформировать отчет (CSV)</button>
        </div>
      </div>
    </motion.div>
  );
}

// === ГЛАВНЫЙ СБОРЩИК (App) ===
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [error, setError] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [membership, setMembership] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/workout').then(res => setWorkouts(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (token) {
      api.get('/membership/my').then(res => setMembership(res.data)).catch(console.error);
      api.get('/booking/my').then(res => setBookings(res.data)).catch(console.error);
    }
  }, [token]);

  const handleLogin = async (e, username, password) => {
    e.preventDefault(); setError('');
    try {
      const res = await api.post('/user/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token); setUser(res.data.user);
      toast.success(`Рады видеть вас, ${res.data.user.full_name}!`);
    } catch (err) { setError(err.response?.data?.message || 'Ошибка'); }
  };

  const handleLogout = () => {
    localStorage.clear(); setToken(null); setUser(null); setMembership(null); setBookings([]);
  };

  const handleBook = async (id) => {
    if (!token) return toast.warning('Сначала войдите в систему!');
    try {
      const res = await api.post('/booking', { workout_id: id });
      toast.success(res.data.message);
      const [mem, book] = await Promise.all([api.get('/membership/my'), api.get('/booking/my')]);
      setMembership(mem.data); setBookings(book.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка записи'); }
  };

  return (
    <Router>
      <Routes>
        {/* ПУБЛИЧНАЯ ЗОНА (Сайт-витрина) */}
        <Route path="/" element={
          <div className="min-h-screen bg-white font-sans flex flex-col">
            <Navbar token={token} user={user} handleLogout={handleLogout} />
            <MainPage workouts={workouts} />
            <Footer />
          </div>
        } />
        <Route path="/workout/:id" element={
          <div className="min-h-screen bg-white font-sans flex flex-col">
            <Navbar token={token} user={user} handleLogout={handleLogout} />
            <DetailPage handleBook={handleBook} token={token} />
            <Footer />
          </div>
        } />

        {/* СТРАНИЦА ЛОГИНА */}
        <Route path="/login" element={
          token ? <Navigate to="/cabinet" /> : <LoginPage handleLogin={handleLogin} error={error} />
        } />

        {/* ПРИВАТНАЯ ЗОНА (Личные кабинеты с боковым меню) */}
        <Route path="/cabinet" element={
          !token ? <Navigate to="/login" /> : (
            <CabinetLayout user={user} handleLogout={handleLogout}>
              {user.role === 'admin' ? <AdminPage /> : 
               user.role === 'trainer' ? <TrainerPage user={user} workouts={workouts} /> : 
               <ClientDashboard user={user} membership={membership} bookings={bookings} workouts={workouts} handleBook={handleBook} />}
            </CabinetLayout>
          )
        } />
      </Routes>
    </Router>
  );
}