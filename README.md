# Support Ticketing System

A full-featured support ticketing system built with Node.js, Express, TypeScript, Prisma, PostgreSQL, and EJS. Includes authentication, role-based access, rate limiting, global error handling, and best practices for security and maintainability.

## Features

- **User Authentication**: Register, login, and secure JWT-based authentication with HTTP-only cookies.
- **Role-Based Access**: Customer, Agent, and Admin roles with protected routes and UI.
- **Ticket Management**: Create, view, update, assign, and close support tickets.
- **GitHub Integration**: Optionally link tickets to GitHub issues.
- **Replies**: Add replies to tickets.
- **Rate Limiting**: Prevent abuse with configurable rate limiting middleware.
- **Global Error Handling**: Centralized error handler for consistent error responses and logging.
- **Logging**: Request and error logging using Winston.
- **EJS Views**: Clean, server-rendered UI with role-based navigation.
- **Prisma ORM**: Type-safe database access and migrations.
- **Security Best Practices**: Helmet, CORS, HTTP-only cookies, and secure password hashing.
- **Dockerized**: Ready for production with Docker and Docker Compose.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### Local Development

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd support-ticketing-system-assignment
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in values (see below).
4. **Run database migrations:**
   ```sh
   npx prisma migrate dev --name init
   ```
5. **Start the app:**
   ```sh
   npm run dev
   ```
6. **Visit:** [http://localhost:3000](http://localhost:3000)

### Docker Deployment

1. **Build and start all services:**
   ```sh
   docker-compose up --build
   ```
2. The app will be available at [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env` file in the root directory:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/support_ticketing
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Best Practices & Architecture

- **Rate Limiting:** Prevents brute-force and abuse attacks using Express middleware.
- **Global Error Handler:** All errors are caught and handled in a consistent way, with user-friendly messages and logging for debugging.
- **Security:**
  - Helmet for HTTP headers
  - CORS enabled
  - HTTP-only cookies for JWT
  - Passwords hashed with bcrypt
- **TypeScript:** Strong typing for safety and maintainability.
- **Prisma:** Modern ORM for type-safe DB access and migrations.
- **Logging:** Winston for request and error logs.
- **Docker:** Production-ready setup with Docker and Compose.

## Folder Structure

```
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── types/
│   ├── configs/
│   └── server.ts
├── views/
├── public/
├── prisma/
│   └── schema.prisma
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## License
MIT
