const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
require('dotenv').config();

// Antes: const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_fraca';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("erro: JWT_SECRET não definida no arquivo .env");
  process.exit(1);
}

const rateLimit = require('express-rate-limit');
// Limite específico para login: 5 tentativas a cada 15 minutos por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." }
});
// Registro
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha obrigatórios' });
  }

  try {
    
    const hashed = await bcrypt.hash(password, 12); 
    const [result] = await db.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashed]
    );
    res.status(201).json({ id: result.insertId, username });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Usuário já existe' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Login - gera token vulnerável
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    // VULNERABILIDADE: token sem expiração, com segredo fraco
   /* const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET
    );*/
    const token = jwt.sign(
  { id: user.id, username: user.username },
  JWT_SECRET,
  { expiresIn: '1h' } // tempo limite
);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware público para verificar token (usado pelo product-service)
router.post('/verify', async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(401).json({ valid: false, error: 'Token não fornecido' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Token inválido' });
  }
});

module.exports = router;
