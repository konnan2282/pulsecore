// === backend/controllers/authController.js ===
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Membership } = require('../models');

const generateJwt = (id, username, role) => {
    return jwt.sign({ id, username, role }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

class AuthController {
    async register(req, res) {
        try {
            const { username, password, full_name, phone, role } = req.body;
            const candidate = await User.findOne({ where: { username } });
            if (candidate) {
                return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
            }
            const hashPassword = await bcrypt.hash(password, 5);
            const userRole = role || 'client';
            const user = await User.create({ username, password_hash: hashPassword, full_name, phone, role: userRole });
            const token = generateJwt(user.id, user.username, user.role);
            return res.json({ token, user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name } });
        } catch (e) {
            res.status(400).json({ message: 'Ошибка при регистрации' });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            let comparePassword = await bcrypt.compare(password, user.password_hash);
            if (!comparePassword) {
                return res.status(400).json({ message: 'Указан неверный пароль' });
            }
            const token = generateJwt(user.id, user.username, user.role);
            return res.json({ token, user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name } });
        } catch (e) {
            res.status(400).json({ message: 'Ошибка при входе' });
        }
    }

    async check(req, res) {
        const token = generateJwt(req.user.id, req.user.username, req.user.role);
        return res.json({ token, user: req.user });
    }

    // НОВЫЙ МЕТОД: Получение всех клиентов для админа (Глава 3.3)
    async getClients(req, res) {
        try {
            const clients = await User.findAll({
                where: { role: 'client' },
                include: [Membership],
                attributes: ['id', 'full_name', 'phone']
            });
            return res.json(clients);
        } catch (e) {
            res.status(500).json({ message: 'Ошибка получения списка клиентов' });
        }
    }
}

module.exports = new AuthController();