- naPorta - API de Pedidos

Web API REST para gestão de pedidos (criar, listar, filtrar, editar e delete), com autenticação JWT.


- Stack e justificativas:

| Item, Escolha, Por quê |:

| Framework | NestJS 11 | Módulos, injeção de dependência e guards prontos |
| Banco | MongoDB | O pedido é lido sempre inteiro, então fica em um único documento |
| ORM/ODM | Prisma 6 | Tipagem forte, tipos compostos para documentos embutidos e seed simples |
| Autenticação | JWT (Bearer) com Passport | Requisito do desafio |
| Validação | JSON Schema | Schema do contrato fica separado do código e é documentável |


- Pré-requisitos:

docker run --name naporta-db -p 27017:27017 -d mongo:7 --replSet rs0
docker exec naporta-db mongosh --eval "rs.initiate()"


- Como executar

1. npm install

2. cp .env.example .env

3. npx prisma generate
   npx prisma db push

4. npm run seed

5. npm run start:dev 


Usuário criado pelo seed: `admin@naporta.com` / `123456`.


- Scripts

| Script | O que faz |

| `npm run start:dev` | Sobe a API com hot reload |
| `npm run build` | Compila para `dist/` |
| `npm run start` | Executa o build (`dist/main.js`) |
| `npm run seed` | Limpa e popula o banco com dados de demonstração |
| `npm run prisma:push` | Cria coleções e índices no MongoDB a partir do `schema.prisma` |


- Autenticação

1. `POST /auth/login` com `{ "email", "password" }` retorna `{ "accessToken", "tokenType": "Bearer", "expiresIn" }`.

2. Todas as rotas `/orders` exigem o header `Authorization: Bearer <accessToken>`.


- Endpoints

| Método | Rota | Descrição | Sucesso |

| POST | `/auth/login` | Gera o token JWT | 200 |
| POST | `/orders` | Cria pedido | 201 |
| GET | `/orders` | Lista pedidos | 200 |
| PATCH | `/orders/:orderId` | Edita pedido | 200 |
| DELETE | `/orders/:orderId` | Exclusão lógica | 204 |


- Erros

Todo erro segue o formato `{ "exceptionType", "message", "details?" }`:

| exceptionType | HTTP |
| `ValidationError` | 400 |
| `UnauthorizedError` | 401 |
| `NotFoundError` | 404 |
| `FatalError` | 500 |


- Imagens de testes:
 
Estão na pasta imagensTestes, testes realizados com insomnia (criado pedido e editado, por exemplo) e a seed no MongoDB.