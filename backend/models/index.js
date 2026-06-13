const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (users)
const User = sequelize.define('user', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false }, // admin, trainer, client
    full_name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

// 2. ТАБЛИЦА АБОНЕМЕНТОВ (memberships)
const Membership = sequelize.define('membership', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: { type: DataTypes.STRING, allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    visits_total: { type: DataTypes.INTEGER, allowNull: true },
    visits_left: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: 'active' }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

// 3. ТАБЛИЦА ТРЕНИРОВОК (workouts)
const Workout = sequelize.define('workout', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    capacity: { type: DataTypes.INTEGER, defaultValue: 10 }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

// 4. ТАБЛИЦА ЗАПИСЕЙ НА ТРЕНИРОВКИ (bookings)
const Booking = sequelize.define('booking', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    status: { type: DataTypes.STRING, defaultValue: 'registered' } // registered, attended, canceled
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

// 5. ТАБЛИЦА ПРОГРЕССА (progress_logs)
const ProgressLog = sequelize.define('progress_log', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    log_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    weight: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    body_fat_pct: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    muscle_mass: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    photo_url: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

// ==========================================
// НАСТРОЙКА СВЯЗЕЙ 1:N (ОДИН КО МНОГИМ)
// ==========================================

// Пользователь -> Абонементы
User.hasMany(Membership, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Membership.belongsTo(User, { foreignKey: 'user_id' });

// Тренер (User) -> Тренировки
User.hasMany(Workout, { foreignKey: 'trainer_id', onDelete: 'CASCADE' });
Workout.belongsTo(User, { foreignKey: 'trainer_id' });

// Тренировка -> Записи
Workout.hasMany(Booking, { foreignKey: 'workout_id', onDelete: 'CASCADE' });
Booking.belongsTo(Workout, { foreignKey: 'workout_id' });

// Клиент (User) -> Записи
User.hasMany(Booking, { foreignKey: 'client_id', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'client_id' });

// Абонемент -> Записи
Membership.hasMany(Booking, { foreignKey: 'membership_id', onDelete: 'CASCADE' });
Booking.belongsTo(Membership, { foreignKey: 'membership_id' });

// Клиент (User) -> Прогресс
User.hasMany(ProgressLog, { foreignKey: 'client_id', onDelete: 'CASCADE' });
ProgressLog.belongsTo(User, { foreignKey: 'client_id' });

// Тренер (User) -> Прогресс (кто записал замеры)
User.hasMany(ProgressLog, { foreignKey: 'trainer_id', onDelete: 'SET NULL' });
ProgressLog.belongsTo(User, { foreignKey: 'trainer_id' });

// Экспортируем все модели
module.exports = {
    sequelize,
    User,
    Membership,
    Workout,
    Booking,
    ProgressLog
};