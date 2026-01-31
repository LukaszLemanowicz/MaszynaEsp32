const { verifyToken } = require('../services/auth.service');

/**
 * Middleware do weryfikacji autoryzacji
 * Sprawdza token w headerze Authorization: Bearer <token>
 */
async function requireAuth(req, res, next) {
  try {
    // Pobierz token z nagłówka Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Brak tokenu autoryzacji. Wymagany nagłówek: Authorization: Bearer <token>',
      });
    }

    const token = authHeader.substring(7); // Usuń "Bearer "

    // Weryfikuj token
    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token jest nieprawidłowy lub wygasł',
      });
    }

    // Dodaj użytkownika do obiektu request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('❌ Błąd weryfikacji autoryzacji:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas weryfikacji autoryzacji',
    });
  }
}

module.exports = {
  requireAuth,
};
