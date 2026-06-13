const { Membership } = require('../models');

class MembershipController {
    // НОВЫЙ МЕТОД: Продление абонемента администратором (Глава 3.3)
    async renew(req, res) {
        try {
            const { id } = req.params;
            const membership = await Membership.findByPk(id);
            if (!membership) {
                return res.status(404).json({ message: "Абонемент не найден" });
            }

            // Продлеваем: прибавляем 12 занятий и переводим статус в активный
            membership.visits_left = (membership.visits_left || 0) + 12;
            membership.status = 'active';

            // Продлеваем дату окончания на 30 дней вперед от текущей даты окончания
            const currentEndDate = new Date(membership.end_date);
            currentEndDate.setDate(currentEndDate.getDate() + 30);
            membership.end_date = currentEndDate;

            await membership.save();
            return res.json({ message: "Абонемент успешно продлен на 12 занятий и 30 дней!", membership });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка при продлении абонемента" });
        }
    }
    // Выдача абонемента пользователю (доступно администратору)
    async create(req, res) {
        try {
            const { user_id, type, start_date, end_date, visits_total } = req.body;
            const membership = await Membership.create({
                user_id,
                type,
                start_date,
                end_date,
                visits_total,
                visits_left: visits_total, // При создании остаток равен полному лимиту
                status: 'active'
            });
            return res.json(membership);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Ошибка при выдаче абонемента' });
        }
    }

    // Получение абонемента текущего вошедшего пользователя
    async getMy(req, res) {
        try {
            const membership = await Membership.findOne({ where: { user_id: req.user.id } });
            return res.json(membership);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Ошибка при получении абонемента' });
        }
    }
}




module.exports = new MembershipController();