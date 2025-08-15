# FamTodo

**A modern, family-focused task and shopping list management application**

FamTodo is a private, web-based Progressive Web App (PWA) designed to organize tasks, shopping lists, and daily chores for families. The system supports both shared and private lists with role-based access control, real-time collaboration, and intelligent shopping features.

## ✨ Key Features

### 🏠 **Family Management**
- Multi-family support with role-based access (Admin, Adult, Child)
- Private, family-wide, and adult-only content visibility
- Family invitation system with secure tokens

### 📋 **Task & List Management**
- Unlimited lists organized in folders with custom colors
- Rich task features: deadlines, recurrence, subtasks, assignments, tags
- Drag & drop task organization and calendar view
- Smart shopping lists with automatic categorization

### 🔄 **Real-time Collaboration**
- Live updates across all family members using Socket.io
- Instant task completion, list changes, and notifications
- Conflict-free collaborative editing

### 📱 **Progressive Web App**
- Mobile-first responsive design with desktop support
- Offline functionality with service worker caching
- Push notifications for deadlines and task changes
- Install as native app on mobile devices

### 🎨 **Modern UI/UX**
- Clean, minimalist design with dark/light theme support
- Accessible interface with keyboard navigation and ARIA support
- Smooth animations and intuitive interactions
- Built with shadcn/ui components and Tailwind CSS

## 🛠 Tech Stack

### **Frontend**
- **Next.js 15.4.6** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern, accessible UI components
- **React 19** - Latest React with concurrent features

### **Backend & Database**
- **PostgreSQL** - Primary database with ACID compliance
- **Prisma 6.14.0** - Type-safe ORM with migrations
- **NextAuth.js 4.24.11** - Authentication with JWT sessions

### **Real-time & Communication**
- **Socket.io 4.8.1** - WebSocket real-time communication
- **React Query** - Server state management and caching

### **PWA & Performance**
- **Serwist 9.0.7** - Service worker management
- **Winston 3.17.0** - Structured logging
- **Web Push API** - Native push notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fam-todo
   ```

2. **Install dependencies**
   ```bash
   cd apps/web
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/famtodo"
   
   # Authentication
   NEXTAUTH_URL="http://localhost:3003"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Features
   NEXT_PUBLIC_APP_URL="http://localhost:3003"
   ```

4. **Database setup**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3003`

## 📝 Key Commands

### Development
```bash
npm run dev          # Start development server on port 3003
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint code quality checks
```

### Database
```bash
npx prisma studio    # Open Prisma database browser
npx prisma migrate dev    # Run database migrations
npx prisma generate  # Generate Prisma client
```

### Testing
```bash
npm run test         # Run Jest test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 🏗 Architecture

### Database Schema
The application uses PostgreSQL with Row Level Security (RLS) for multi-tenant data isolation:

- **`families`** - Family groups with settings
- **`app_users`** - Users with roles (admin/adult/child)
- **`folders`** - Organizational containers for lists
- **`lists`** - Task lists with visibility controls
- **`tasks`** - Individual tasks with rich metadata
- **`shopping_items`** - Shopping list items with categories
- **`shopping_dictionary`** - Product catalog for autocomplete

### Authentication & Security
- **NextAuth.js** with custom credentials provider
- **JWT tokens** with family and role claims
- **Row Level Security** ensures users only access their family's data
- **bcrypt** password hashing with secure session management

### Real-time Architecture
- **Socket.io** server for WebSocket connections
- **Room-based** communication per family
- **Event-driven** updates for tasks, lists, and notifications
- **Optimistic updates** with automatic retry on failure

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_URL` | Application base URL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth signing secret | ✅ |
| `NEXT_PUBLIC_APP_URL` | Public app URL for PWA | ✅ |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |

### PWA Configuration
The app includes comprehensive PWA features:
- **Manifest** with app icons and theme colors
- **Service Worker** for offline caching and push notifications
- **Background Sync** for offline task creation
- **Install prompts** for native app experience

## 📊 Monitoring & Observability

### Built-in Monitoring
- **Structured logging** with Winston (server) and browser console
- **Performance metrics** tracking request/response times
- **Error tracking** with automatic grouping and reporting
- **Business metrics** for user engagement and feature usage

### Admin Dashboard
Access comprehensive monitoring at `/admin/monitoring` (admin role required):
- Real-time system metrics and performance data
- Error reports with stack traces and context
- User activity logs and audit trails
- Database operation statistics

## 🧪 Testing

The project includes comprehensive testing setup:
- **Jest** for unit and integration tests
- **Testing Library** for React component testing
- **Coverage reporting** with detailed metrics
- **CI/CD ready** test configuration

Run tests:
```bash
npm run test              # Single run
npm run test:watch        # Watch mode for development
npm run test:coverage     # Generate coverage report
```

## 🔒 Security Features

### Data Protection
- **Row Level Security** at database level
- **Input validation** with Zod schemas
- **XSS protection** with proper data sanitization
- **CSRF protection** built into Next.js

### Privacy & Compliance
- **Family data isolation** - no cross-family data access
- **Secure password storage** with bcrypt hashing
- **JWT token security** with expiration and refresh
- **Audit logging** for administrative actions

## 🌍 Internationalization

- **next-intl** for multi-language support
- **Danish** as primary language with English fallback
- **Date formatting** respects user locale
- **RTL language support** ready for future expansion

## 📱 Progressive Web App Features

### Offline Support
- **Service Worker** caches essential app resources
- **Background sync** for delayed network operations
- **Offline indicators** show connection status
- **Cached data** available during network outages

### Native App Experience
- **Install prompts** on supported devices
- **App icons** and splash screens configured
- **Full-screen** mobile experience
- **OS integration** with proper app metadata

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Considerations
- **Database** - PostgreSQL with connection pooling
- **Environment Variables** - All secrets properly configured
- **Logging** - Structured logs for monitoring systems
- **Performance** - Built-in metrics and monitoring endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run linting and tests
5. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Use Prettier for code formatting
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For issues and feature requests:
1. Check existing issues in the project repository
2. Create a new issue with detailed description
3. Include environment details and reproduction steps

---

**Built with ❤️ for families who want to stay organized together**