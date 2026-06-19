// === backend/controllers/membershipController.js ===
const { Membership } = require('../models');

class MembershipController {
    // Продление абонемента администратором (с выбором количества занятий: 6 или 12)
    async renew(req, res) {
        try {
            const { id } = req.params;
            const { visits } = req.body; // Получаем 6 или 12 из тела запроса
            
            const membership = await Membership.findByPk(id);
            if (!membership) {
                return res.status(404).json({ message: "Абонемент не найден" });
            }

            const addVisits = parseInt(visits) || 12;
            const addDays = addVisits === 6 ? 15 : 30; // 6 занятий -> 15 дней, 12 занятий -> 30 дней

            membership.visits_left = (membership.visits_left || 0) + addVisits;
            membership.status = 'active';

            // Вычисляем новую дату окончания
            const currentEndDate = new Date(membership.end_date);
            currentEndDate.setDate(currentEndDate.getDate() + addDays);
            membership.end_date = currentEndDate;

            await membership.save();
            return res.json({ message: `Абонемент успешно продлен на ${addVisits} занятий и ${addDays} дней!`, membership });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка при продлении абонемента" });
        }
    }

    // НОВЫЙ МЕТОД: Обнуление (аннулирование) абонемента администратором
    async reset(req, res) {
        try {
            const { id } = req.params;
            const membership = await Membership.findByPk(id);
            if (!membership) {
                return res.status(404).json({ message: "Абонемент не найден" });
            }

            membership.visits_left = 0;
            membership.status = 'expired'; // Переводим статус в архивный

            await membership.save();
            return res.json({ message: "Абонемент успешно аннулирован (визиты обнулены, статус изменен на expired)!", membership });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка при обнулении абонемента" });
        }
    }

    // Выдача нового абонемента
    async create(req, res) {
        try {
            const { user_id, type, start_date, end_date, visits_total } = req.body;
            const membership = await Membership.create({
                user_id,
                type,
                start_date,
                end_date,
                visits_total,
                visits_left: visits_total,
                status: 'active'
            });
            return res.json(membership);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Ошибка при выдаче абонемента' });
        }
    }

    // Получение абонемента текущего пользователя
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