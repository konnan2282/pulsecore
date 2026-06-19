// === backend/controllers/progressController.js ===
const fs = require('fs');
const path = require('path');
const { ProgressLog } = require('../models');

class ProgressController {
    // Внесение нового замера прогресса (с опциональным фото через multer)
    async create(req, res) {
        try {
            const { weight, body_fat_pct, muscle_mass, notes } = req.body;
            
            // Если файл был загружен, сохраняем его относительный путь
            const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

            // Защита: парсим строковые значения в числа
            const parsedWeight = parseFloat(weight);
            const parsedFat = parseFloat(body_fat_pct);
            const parsedMuscle = parseFloat(muscle_mass);

            if (isNaN(parsedWeight) || isNaN(parsedFat) || isNaN(parsedMuscle)) {
                return res.status(400).json({ message: 'Замеры веса, процента жира и мышечной массы должны быть числовыми значениями!' });
            }

            const log = await ProgressLog.create({
                client_id: req.user.id,
                weight: parsedWeight,
                body_fat_pct: parsedFat,
                muscle_mass: parsedMuscle,
                photo_url,
                notes
            });

            return res.json({ message: 'Замер прогресса успешно сохранен!', log });
        } catch (e) {
            console.log("Ошибка БД в progressController.create:", e);
            res.status(500).json({ 
                message: 'Ошибка при сохранении замера в базу данных', 
                error: e.message 
            });
        }
    }

    // Получение истории замеров текущего клиента
    async getMy(req, res) {
        try {
            const logs = await ProgressLog.findAll({
                where: { client_id: req.user.id },
                order: [['log_date', 'ASC']]
            });
            return res.json(logs);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Ошибка при получении истории прогресса' });
        }
    }

    // Удаление замера прогресса и физическое стирание файла картинки
    async delete(req, res) {
        try {
            const { id } = req.params;
            const client_id = req.user.id;

            const log = await ProgressLog.findOne({ where: { id, client_id } });
            if (!log) {
                return res.status(404).json({ message: 'Замер прогресса не найден' });
            }

            // Если к замеру прикреплено фото — физически стираем файл с жесткого диска бэкенда
            if (log.photo_url) {
                const cleanPath = path.join(__dirname, '..', log.photo_url.replace(/^\//, ''));
                fs.unlink(cleanPath, (err) => {
                    if (err) {
                        console.log("⚠️ Не удалось удалить физический файл фотографии:", err.message);
                    } else {
                        console.log("🧹 Физический файл фотографии успешно стерт с диска сервера");
                    }
                });
            }

            await log.destroy();
            return res.json({ message: 'Замер прогресса успешно удален!' });
        } catch (e) {
            console.log("Ошибка в progressController.delete:", e);
            res.status(500).json({ message: 'Ошибка при удалении замера прогресса' });
        }
    }
}

module.exports = new ProgressController();