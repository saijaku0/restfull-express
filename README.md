# Task Management API

RESTful API для системи управління завданнями з JWT-аутентифікацією, рольовим контролем доступу та повним набором CRUD-операцій.

Дисципліна: Високорівневі мови програмування та фреймворки.

## Технологічний стек

- Node.js, Express, TypeScript
- PostgreSQL, Prisma ORM
- JWT (access + refresh), bcryptjs
- Joi (валідація вхідних даних)
- Helmet, CORS (безпека)
- Swagger (swagger-jsdoc + swagger-ui-express)
- Jest, Supertest (інтеграційні тести)

## Вимоги

- Node.js 18 або новіший
- Docker та Docker Compose

## Встановлення та запуск

1. Клонувати репозиторій:

        git clone <repository-url>
        cd rest-api

2. Встановити залежності:

        npm install

3. Створити файл `.env` у корені проєкту (див. розділ "Змінні середовища").

4. Підняти базу даних у Docker:

        npm run db:up

5. Застосувати міграції:

        npx prisma migrate dev

6. Запустити сервер у режимі розробки:

        npm run dev

Сервер запуститься на `http://localhost:3000`.

## Змінні середовища

Файл `.env` у корені проєкту:

        DB_USER=postgres
        DB_PASSWORD=postgres
        DB_NAME=task_api
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/task_api?schema=public"
        PORT=3000
        JWT_ACCESS_SECRET=your_access_secret
        JWT_REFRESH_SECRET=your_refresh_secret
        JWT_ACCESS_EXPIRES=15m
        JWT_REFRESH_EXPIRES=7d

## Структура проєкту

        rest-api/
        +-- prisma/
        |   +-- schema.prisma
        |   +-- migrations/
        +-- src/
        |   +-- config/
        |   |   +-- env.ts
        |   |   +-- prisma.ts
        |   |   +-- swagger.ts
        |   +-- middleware/
        |   |   +-- authenticate.ts
        |   |   +-- authorize.ts
        |   |   +-- validate.ts
        |   |   +-- errorHandler.ts
        |   +-- modules/
        |   |   +-- auth/
        |   |   +-- users/
        |   |   +-- tasks/
        |   +-- types/
        |   +-- utils/
        |   +-- app.ts
        |   +-- server.ts
        +-- tests/
        +-- docs/
        +-- .env
        +-- compose.yml
        +-- package.json
        +-- tsconfig.json

## Ендпоінти API

### Аутентифікація

| Метод | Шлях | Опис | Доступ |
|-------|------|------|--------|
| POST | /api/auth/register | Реєстрація користувача | Публічний |
| POST | /api/auth/login | Вхід, видача токенів | Публічний |
| POST | /api/auth/refresh | Оновлення access-токена | Публічний (refresh cookie) |
| POST | /api/auth/logout | Вихід, інвалідація токена | Публічний |

### Користувачі

| Метод | Шлях | Опис | Доступ |
|-------|------|------|--------|
| GET | /api/users/profile | Профіль поточного користувача | JWT |
| PUT | /api/users/profile | Оновлення профілю | JWT |
| POST | /api/users/change-password | Зміна пароля | JWT |
| GET | /api/users | Список усіх користувачів | JWT + роль admin |

### Завдання

| Метод | Шлях | Опис | Доступ |
|-------|------|------|--------|
| POST | /api/tasks | Створення завдання | JWT |
| GET | /api/tasks | Список завдань (фільтри, пагінація) | JWT |
| GET | /api/tasks/:id | Отримання завдання за id | JWT (власник або admin) |
| PUT | /api/tasks/:id | Оновлення завдання | JWT (власник або admin) |
| DELETE | /api/tasks/:id | Видалення завдання | JWT (власник або admin) |

## Документація API

- Swagger UI: `http://localhost:3000/api/docs` (інтерактивна документація, згенерована з коду)
- OpenAPI-специфікація: `docs/openapi.json` (можна імпортувати в Postman, Insomnia або інший клієнт)

Для виклику захищених ендпоінтів у Swagger UI натисніть кнопку Authorize та вставте access-токен.

## Ролі та контроль доступу

Передбачено дві ролі: `user` (за замовчуванням) та `admin`.

- Звичайний користувач має доступ лише до власних завдань та профілю.
- Адміністратор має доступ до списку користувачів та до будь-яких завдань.

Першого адміністратора призначають вручну через Prisma Studio (`npx prisma studio`, таблиця User, поле role) або SQL-запитом до бази. Після зміни ролі потрібно повторно увійти, оскільки роль зашита в токен.

## Тестування

Інтеграційні тести виконуються на окремій тестовій базі даних (порт 5433), щоб не зачіпати робочу.

1. Підняти тестову базу:

        npm run test:db:up

2. Запустити тести:

        npm test

Тести покривають аутентифікацію, CRUD-операції над завданнями та контроль доступу.