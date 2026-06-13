const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }
    try {
        // Токен передается в заголовке в формате "Bearer ТУТ_ТОКЕН"
        const token = req.headers.authorization.split(' ')[1]; 
        if (!token) {
            return res.status(401).json({ message: "Пользователь не авторизован" });
        }
        
        // Расшифровываем токен нашим секретным ключом
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Добавляем данные пользователя в запрос
        next(); // Пропускаем к следующей функции
    } catch (e) {
        res.status(403).json({ message: "Токен недействителен или истек" });
    }
};