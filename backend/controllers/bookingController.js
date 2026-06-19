// === backend/controllers/bookingController.js ===
const { sequelize, Booking, Membership, Workout, User } = require('../models');

class BookingController {
    async create(req, res) {
        const { workout_id } = req.body;
        const client_id = req.user.id;
        const t = await sequelize.transaction();

        try {
            const workout = await Workout.findByPk(workout_id, { transaction: t });
            if (!workout) {
                await t.rollback();
                return res.status(404).json({ message: 'Тренировка не найдена' });
            }

            const activeBookings = await Booking.count({ where: { workout_id, status: 'registered' }, transaction: t });
            if (activeBookings >= workout.capacity) {
                await t.rollback();
                return res.status(400).json({ message: 'На эту тренировку не осталось свободных мест' });
            }

            const membership = await Membership.findOne({ where: { user_id: client_id, status: 'active' }, transaction: t });
            if (!membership) {
                await t.rollback();
                return res.status(400).json({ message: 'У вас нет активного абонемента' });
            }

            const currentDate = new Date();
            const endDate = new Date(membership.end_date);
            if (currentDate > endDate) {
                await t.rollback();
                return res.status(400).json({ message: 'Срок действия вашего абонемента истек' });
            }

            if (membership.visits_left !== null && membership.visits_left <= 0) {
                await t.rollback();
                return res.status(400).json({ message: 'На вашем абонементе закончились доступные занятия' });
            }

            if (membership.visits_left !== null) {
                await membership.decrement('visits_left', { by: 1, transaction: t });
            }

            const booking = await Booking.create({
                workout_id,
                client_id,
                membership_id: membership.id,
                status: 'registered'
            }, { transaction: t });

            await t.commit();
            return res.json({ message: 'Запись успешно оформлена! Одно занятие списано с абонемента.', booking });
        } catch (e) {
            await t.rollback();
            res.status(500).json({ message: 'Системная ошибка при оформлении записи' });
        }
    }

    
    async cancel(req, res) {
        const { id } = req.params;
        const client_id = req.user.id;
        const t = await sequelize.transaction();

        try {
            const booking = await Booking.findOne({ where: { id, client_id }, transaction: t });
            if (!booking) {
                await t.rollback();
                return res.status(404).json({ message: 'Запись не найдена' });
            }

            if (booking.status === 'canceled') {
                await t.rollback();
                return res.status(400).json({ message: 'Запись уже отменена' });
            }

            // Меняем статус записи
            booking.status = 'canceled';
            await booking.save({ transaction: t });

            // Возвращаем занятие на абонемент (если это не безлимит)
            if (booking.membership_id) {
                const membership = await Membership.findByPk(booking.membership_id, { transaction: t });
                if (membership && membership.visits_left !== null && membership.visits_total !== 999) {
                    await membership.increment('visits_left', { by: 1, transaction: t });
                }
            }

            await t.commit();
            return res.json({ message: 'Запись успешно отменена, занятие возвращено на абонемент.', booking });
        } catch (e) {
            await t.rollback();
            console.log(e);
            res.status(500).json({ message: 'Ошибка при отмене записи' });
        }
    }

    async getMy(req, res) {
        try {
            const bookings = await Booking.findAll({
                where: { client_id: req.user.id },
                include: [Workout]
            });
            return res.json(bookings);
        } catch (e) {
            res.status(500).json({ message: 'Ошибка при получении записей' });
        }
    }

    async getByWorkout(req, res) {
        try {
            const { workoutId } = req.params;
            const bookings = await Booking.findAll({
                where: { workout_id: workoutId },
                include: [{ model: User, attributes: ['full_name'] }]
            });
            return res.json(bookings);
        } catch (e) {
            res.status(500).json({ message: 'Ошибка при получении записей тренировки' });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const booking = await Booking.findByPk(id);
            if (!booking) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }
            booking.status = status;
            await booking.save();
            return res.json(booking);
        } catch (e) {
            res.status(500).json({ message: 'Ошибка при обновлении статуса записи' });
        }
    }
}

module.exports = new BookingController();