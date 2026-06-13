const { Workout } = require('../models');

class WorkoutController {
    // Создание тренировки (доступно администраторам и тренерам)
    async create(req, res) {
        try {
            const { title, description, start_time, end_time, capacity } = req.body;
            const workout = await Workout.create({
                title,
                description,
                start_time,
                end_time,
                capacity,
                trainer_id: req.user.id // Автоматически привязываем создавшего тренера
            });
            return res.json(workout);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Ошибка при создании тренировки' });
        }
    }

    // Получение списка всех тренировок
    async getAll(req, res) {
        try {
            const workouts = await Workout.findAll();
            return res.json(workouts);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Ошибка при получении тренировок' });
        }
    }
}

module.exports = new WorkoutController();