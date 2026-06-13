// === backend/server.js ===
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const { sequelize, User, Membership, Workout, Booking } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

const authRouter = require('./routes/authRouter');
const workoutRouter = require('./routes/workoutRouter');
const membershipRouter = require('./routes/membershipRouter');
const bookingRouter = require('./routes/bookingRouter');
const reportRouter = require('./routes/reportRouter');
const progressRouter = require('./routes/progressRouter');

app.use('/api/user', authRouter);
app.use('/api/workout', workoutRouter);
app.use('/api/membership', membershipRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/report', reportRouter);
app.use('/api/progress', progressRouter);

app.get('/', (req, res) => {
    res.send('PulseCore API работает!');
});

const start = async () => {
    try {
        await sequelize.sync({ force: true }); // Пересоздаем БД один раз для загрузки новых тренировок
        console.log('✅ База данных успешно синхронизирована.');

        const salt = 5;
        const pass = await bcrypt.hash('password123', salt);

        // 1. Админ и тренер
        const admin = await User.create({ username: 'demidov', password_hash: pass, full_name: 'Матвей Демидов (Админ)', role: 'admin', phone: '+7 (999) 000-00-00' });
        const trainer = await User.create({ username: 'trainer', password_hash: pass, full_name: 'Иванов Иван (Тренер)', role: 'trainer', phone: '+7 (999) 111-11-11' });

        // 2. Три клиента
        const client1 = await User.create({ username: 'client1', password_hash: pass, full_name: 'Иванов И.И.', role: 'client', phone: '+7 (999) 222-22-22' });
        const client2 = await User.create({ username: 'client2', password_hash: pass, full_name: 'Петрова А.К.', role: 'client', phone: '+7 (999) 333-33-33' });
        const client3 = await User.create({ username: 'client3', password_hash: pass, full_name: 'Смирнов В.П.', role: 'client', phone: '+7 (999) 444-44-44' });

        // 3. Выдача абонементов
        const m1 = await Membership.create({ user_id: client1.id, type: 'Классический (12 занятий)', start_date: '2026-06-13', end_date: '2026-12-31', visits_total: 12, visits_left: 8, status: 'active' });
        const m2 = await Membership.create({ user_id: client2.id, type: 'Безлимит', start_date: '2026-06-13', end_date: '2026-12-31', visits_total: 999, visits_left: 999, status: 'active' });
        const m3 = await Membership.create({ user_id: client3.id, type: 'Разовый (8 занятий)', start_date: '2026-03-01', end_date: '2026-05-01', visits_total: 8, visits_left: 0, status: 'expired' });

        // 4. Создаем 6 разнообразных тренировок для красивой витрины
        const w1 = await Workout.create({ trainer_id: trainer.id, title: 'Кроссфит Интенсив', description: 'Силовая функциональная тренировка высокой интенсивности', start_time: '2026-06-20T18:00:00Z', end_time: '2026-06-20T19:00:00Z', capacity: 10 });
        const w2 = await Workout.create({ trainer_id: trainer.id, title: 'Йога Баланс и Растяжка', description: 'Мягкая практика для гибкости, баланса и умиротворения', start_time: '2026-06-21T10:00:00Z', end_time: '2026-06-21T11:00:00Z', capacity: 15 });
        const w3 = await Workout.create({ trainer_id: trainer.id, title: 'Пилатес для Осанки', description: 'Укрепление мышечного корсета и глубоких мышц кора', start_time: '2026-06-22T12:00:00Z', end_time: '2026-06-22T13:00:00Z', capacity: 12 });
        const w4 = await Workout.create({ trainer_id: trainer.id, title: 'Сайкл Кардио-Гонка', description: 'Интервальная велогонка на выносливость под драйвовую музыку', start_time: '2026-06-23T19:30:00Z', end_time: '2026-06-23T20:30:00Z', capacity: 8 });
        const w5 = await Workout.create({ trainer_id: trainer.id, title: 'Силовой Атлетизм', description: 'Проработка рельефа со свободными весами и штангой', start_time: '2026-06-24T17:00:00Z', end_time: '2026-06-24T18:30:00Z', capacity: 10 });
        const w6 = await Workout.create({ trainer_id: trainer.id, title: 'Хатха Йога (Продвинутый)', description: 'Глубокие асаны и дыхательные пранаямы для опытных', start_time: '2026-06-25T09:00:00Z', end_time: '2026-06-25T10:30:00Z', capacity: 15 });

        // 5. Оформляем демо-записи
        await Booking.create({ workout_id: w1.id, client_id: client1.id, membership_id: m1.id, status: 'registered' });
        await Booking.create({ workout_id: w1.id, client_id: client2.id, membership_id: m2.id, status: 'registered' });

        console.log('✅ База данных успешно заполнена демо-данными.');

        app.listen(process.env.PORT, () => {
            console.log(`🚀 Сервер запущен на порту ${process.env.PORT}`);
        });
    } catch (error) {
        console.error('❌ Ошибка запуска сервера:', error);
    }
};

start();