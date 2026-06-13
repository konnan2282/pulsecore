const { ProgressLog } = require('../models');

class ProgressController {
    // Внесение нового замера прогресса (с опциональным фото через multer)
    async create(req, res) {
        try {
            const { weight, body_fat_pct, muscle_mass, notes } = req.body;
            
            // Если файл был загружен, сохраняем его относительный путь
            const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

            const log = await ProgressLog.create({
                client_id: req.user.id,
                weight: parseFloat(weight),
                body_fat_pct: parseFloat(body_fat_pct),
                muscle_mass: parseFloat(muscle_mass),
                photo_url,
                notes
            });

            return res.json({ message: 'Замер прогресса успешно сохранен!', log });
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Ошибка при сохранении прогресса' });
        }
    }

    // Получение истории замеров текущего клиента
    async getMy(req, res) {
        try {
            const logs = await ProgressLog.findAll({
                where: { client_id: req.user.id },
                order: [['log_date', 'ASC']] // Сортируем от старых к новым для построения красивого графика
            });
            return res.json(logs);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Ошибка при получении истории прогресса' });
        }
    }
}

module.exports = new ProgressController();