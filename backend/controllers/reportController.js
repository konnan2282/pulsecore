const { User, Membership, Booking, Workout } = require('../models');

class ReportController {
    // 1. Получение статистики для дашборда администратора (Глава 3.5)
    async getStats(req, res) {
        try {
            // Подсчитываем общее число активных абонементов
            const activeMemberships = await Membership.count({ where: { status: 'active' } });
            
            // Подсчитываем общее количество записей
            const totalBookings = await Booking.count();

            return res.json({
                activeMemberships,
                totalBookings,
                revenueEstimate: activeMemberships * 15000 // Примерный подсчет выручки по тарифу
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка при получении статистики" });
        }
    }

    // 2. Оптимизированный экспорт отчета в CSV формат (Глава 3.5)
    async exportCSV(req, res) {
        try {
            // 1. Сбор данных с объединением (JOIN) таблиц
            const bookings = await Booking.findAll({
                include: [
                    { model: User, attributes: ['full_name', 'phone'] },
                    { model: Workout, attributes: ['title'] },
                    { model: Membership, attributes: ['type'] }
                ],
                order: [['created_at', 'DESC']]
            });

            // 2. Виртуализация буфера в оперативной памяти (StringIO)
            // Записываем маркер последовательности байтов (BOM) для корректного отображения кириллицы в Excel
            let csvContent = '\ufeff'; 
            
            // Заголовок таблицы с разделителем "точка с запятой" (как описано в главе 3.5)
            csvContent += 'ID записи;Дата оформления;Клиент;Телефон;Абонемент;Тренировка;Статус\n';

            // Запись строк данных
            bookings.forEach(b => {
                const date = new Date(b.created_at).toLocaleDateString('ru-RU');
                const clientName = b.user ? b.user.full_name : 'Удален';
                const clientPhone = b.user ? b.user.phone : '-';
                const membershipType = b.membership ? b.membership.type : 'Нет';
                const workoutTitle = b.workout ? b.workout.title : 'Удалена';
                
                csvContent += `${b.id};${date};${clientName};${clientPhone};${membershipType};${workoutTitle};${b.status}\n`;
            });

            // Отправка клиенту в виде скачиваемого файла (стриминг буфера)
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
            
            return res.send(csvContent);

        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка при генерации отчета" });
        }
    }
}

module.exports = new ReportController();