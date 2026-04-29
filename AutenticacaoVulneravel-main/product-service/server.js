require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Importado
const productRoutes = require('./routes/products');
const db = require('./db');

const app = express();

// 1. Segurança de Headers
app.use(helmet()); 

// 2. Configuração de CORS (
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

app.use('/products', productRoutes);

//  tabela com INDEX para performance
(async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id) --  acelerar as buscas por dono
      )
    `);
    console.log('Tabela products verificada/criada');
  } catch (err) {
    console.error('Erro ao criar tabela:', err);
  }
})();

app.listen(PORT, () => {
  console.log(`Product service rodando na porta ${PORT}`);
});