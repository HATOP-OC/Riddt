
# Developer Guide: Setup and Running the Application

This document provides detailed instructions on how to set up and run the Reddit-style application from scratch.

## Prerequisites

- Node.js 20.x or later
- PostgreSQL 16.x (available through Replit)
- Git (for version control)

## Setup Instructions

### 1. Clone the Repository

If you're on Replit, you can fork the project directly. Otherwise, clone the repository:

```bash
git clone <repository-url>
```

### 2. Install Dependencies

Navigate to the project root directory and install the required npm packages:

```bash
npm install
```

This will install all dependencies specified in `package.json`, including:
- React and React DOM for the frontend
- Express for the backend server
- Drizzle ORM for database operations
- Shadcn UI components
- TypeScript
- Vite for development and building

### 3. Database Setup

The application uses PostgreSQL for data storage. На Replit PostgreSQL доступний як модуль.

1. **Створення бази даних**:
   - Відкрийте нову вкладку в Replit і введіть "Database"
   - У панелі "Database" натисніть "create a database"
   - Після створення бази даних, ви отримаєте доступ до інформації про підключення

2. **Налаштування змінних середовища**:
   - Replit автоматично створить змінну середовища `DATABASE_URL` в розділі Secrets
   - Переконайтеся, що ця змінна доступна - перевірте в розділі "Secrets" в лівій панелі
   - Значення `DATABASE_URL` має формат: `postgresql://username:password@hostname:port/database_name`

3. **Ініціалізація схеми бази даних**:
   - Використовуючи Drizzle ORM, виконайте міграцію схеми:

```bash
npm run db:push
```

Ця команда використовує Drizzle Kit для створення і застосування схеми, визначеної у файлі `shared/schema.ts`.

4. **Перевірка підключення**:
   - Ви можете перевірити підключення до бази даних, запустивши:

```bash
npx drizzle-kit studio
```

Це відкриє графічний інтерфейс, де ви зможете переглядати структуру та дані вашої бази даних.

5. **SQL Explorer**:
   - Replit надає SQL Explorer для керування базою даних
   - Відкрийте вкладку "Database" для доступу до SQL Explorer
   - Тут ви можете виконувати запити SQL для перегляду або зміни даних

### 4. Environment Variables

The application may require environment variables for database connections and other configurations. If you're running the application outside Replit, you'll need to set these up manually.

On Replit, use the Secrets tool to set up the following environment variables:

- `DATABASE_URL`: Connection string for PostgreSQL database
- Add any other required secrets like API keys if needed

### 5. Running the Development Server

Start the development server:

```bash
npm run dev
```

This command starts both the backend server and frontend development server:
- The backend Express server runs on port 5000
- The Vite development server handles hot reloading for the frontend

### 6. Building for Production

To build the application for production:

```bash
npm run build
```

This command:
1. Compiles the React frontend using Vite
2. Bundles the Express backend using esbuild
3. Places all assets in the `dist` directory

### 7. Running in Production

To start the application in production mode:

```bash
npm run start
```

This runs the application with `NODE_ENV=production` from the compiled code in the `dist` directory.

## Project Structure

### Frontend (`/client`)

- `/src`: Contains all React components and frontend code
  - `/components`: Reusable UI components
    - `/ui`: Shadcn UI components
    - `/layout`: Page layout components (header, sidebar)
    - `/modals`: Modal dialog components
  - `/hooks`: Custom React hooks
  - `/lib`: Utility functions and providers
  - `/pages`: Page components for different routes

### Backend (`/server`)

- `index.ts`: Entry point for the Express server
- `routes.ts`: API route definitions
- `auth.ts`: Authentication logic
- `db.ts`: Database connection and query methods
- `storage.ts`: Data storage interfaces and implementations

### Shared (`/shared`)

- `schema.ts`: Shared type definitions and schemas used by both frontend and backend

## Development Workflows

The project uses Replit workflows to streamline development:

- **Start application**: Runs `npm run dev` to start the development server
- **Project**: A parent workflow that runs the Start application workflow

## Troubleshooting

If you encounter issues:

1. **Port conflicts**: The application runs on port 5000. Make sure this port is available.
2. **Database connection issues**: Verify your database connection string and credentials.
3. **Build errors**: Check the console for specific error messages. Most issues stem from missing dependencies or TypeScript errors.
4. **Runtime errors**: Check the browser console and server logs for error details.

## Additional Commands

- `npm run check`: Run TypeScript type checking
- `npm run db:push`: Update the database schema

## Deployment

The application is configured for deployment on Replit with the following settings:

```
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]
```

These commands will execute during the deployment process.
