#Tecnologias Utilizadas*
Runtime: Node.js

Framework: Express

Banco de Dados: MySQL

Segurança: JSON Web Token (JWT), BcryptJS, Helmet, Express-rate-limit

Orquestração Local: Concurrently

---Melhorias de Segurança Implementadas
Conforme solicitado na atividade, foram realizadas as seguintes correções:

Broken Object Level Authorization (BOLA): No product-service, as rotas de busca e atualização foram corrigidas para garantir que um usuário só possa acessar ou modificar produtos que ele mesmo criou, utilizando o user_id extraído do Token JWT.

Broken Authentication: * Implementada expiração de 1 hora para os Tokens JWT.

Substituição de segredos fracos por variáveis de ambiente (JWT_SECRET).

Implementação de Rate Limiting na rota de login para prevenir ataques de força bruta.

Aumento da complexidade do Hash de senha (Bcrypt salt rounds aumentado para 12).

Security Misconfiguration: Uso da biblioteca Helmet em todos os serviços para proteção de headers HTTP e desativação de mensagens de erro detalhadas em produção.

API Gateway: Centralização de logs e implementação de timeouts para evitar ataques de negação de serviço (DoS) e garantir a disponibilidade.

 Como Rodar o Projeto
1. Pré-requisitos
Node.js instalado.

MySQL Server rodando localmente.

2. Configuração do Banco de Dados
Execute os seguintes comandos no seu terminal MySQL ou Workbench para criar os bancos de dados necessários:

SQL
CREATE DATABASE auth_db;
CREATE DATABASE product_db;
3. Variáveis de Ambiente
Crie um arquivo .env dentro das pastas auth-service, product-service e gateway seguindo o modelo abaixo (ajuste conforme suas credenciais):

Snippet de código
PORT=300x
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco
JWT_SECRET=seu_segredo_super_seguro
4. Instalação e Execução
Na pasta raiz do projeto, execute:

Bash
# Instalar dependências (conforme configurado no package.json principal)
npm install

# Rodar todos os serviços simultaneamente
npm start
-- Roteiro de Testes
Para validar as correções, utilize o Postman ou Thunder Client:

1. Registro e Login: Crie um usuário em /api/auth/register e faça login em /api/auth/login para obter o Token JWT.

2. Criação de Produto: Use o token no header (Authorization: Bearer <TOKEN>) para criar um produto em POST /api/products. O userId será vinculado automaticamente pelo token.

3. Validação BOLA: Tente acessar um produto de outro usuário pelo ID. O sistema deve retornar 404 ou Acesso Negado.

4. Rate Limit: Tente errar a senha de login 5 vezes seguidas; o sistema bloqueará novas tentativas temporariamente.
