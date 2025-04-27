# Arguepedia2 Architecture Overview

## Project Structure

Arguepedia2 is a Vue.js/Quasar-based web application with a Supabase backend. Here's a high-level overview of the project structure and key components:

### Core Application Structure

```
src/
├── assets/         # Static assets (images, fonts, etc.)
├── boot/           # Application boot files (initialization code)
├── components/     # Reusable Vue components
├── composables/    # Vue composition API hooks
├── constants/      # Application-wide constants
├── css/           # Global styles and CSS utilities
├── layouts/       # Page layout templates
├── pages/         # Route-based page components
├── router/        # Vue Router configuration
├── stores/        # State management (Pinia stores)
├── types/         # TypeScript type definitions
└── utils/         # Utility functions and helpers
```

### Key Configuration Files

- `quasar.config.ts` - Quasar framework configuration
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Vercel deployment configuration
- `.env.local` - Environment variables (not committed to git)

### Build and Development

- `package.json` - Project dependencies and scripts
- `postcss.config.js` - PostCSS configuration for CSS processing
- `eslint.config.js` - ESLint configuration for code quality
- `.prettierrc.json` - Prettier configuration for code formatting

### Database and Backend

The `supabase/` directory contains database migrations and configurations for the Supabase backend.

## Component Relationships

### Frontend Architecture

1. **Entry Point**

   - `src/App.vue` - Root component
   - `src/boot/` - Application initialization
   - `src/router/` - Route definitions and navigation

2. **State Management**

   - `src/stores/` - Pinia stores for global state
     - `authStore.ts` - Manages user authentication state and Supabase auth
     - `statementStore.ts` - Handles statement-related state and operations
   - `src/composables/` - Reusable stateful logic
     - `useSupabase.ts` - Core database operations and state management
     - `useStatementCreation.ts` - Statement creation and validation
     - `useArgumentCreation.ts` - Argument creation and management
     - `useComments.ts` - Comment system functionality

3. **UI Components**

   - `src/components/` - Reusable Vue components
     - `CreateArgumentComponent.vue` - Form for creating new arguments
     - `SearchStatementSelect.vue` - Component for searching and selecting statements
     - `CreateStatement.vue` - Form for creating new statements
     - `ArgumentComponent.vue` - Displays individual arguments
     - `StatementComponent.vue` - Displays individual statements
     - `CommentComponent.vue` - Displays comments
     - `ReplyBox.vue` - Form for adding replies
     - `UsernameButton.vue` - Displays user information
   - `src/layouts/` - Page layout templates
   - `src/pages/` - Route-based page components
     - `IndexPage.vue` - Home page
     - `SearchResults.vue` - Search results page
     - `AuthPage.vue` - Authentication page
     - `StatementPage.vue` - Individual statement page
     - `ArgumentPage.vue` - Individual argument page
     - `ProfilePage.vue` - User profile page
     - `UserSettingsPage.vue` - User settings page
     - `AboutPage.vue` - About page

4. **Data Layer**
   - `src/types/` - TypeScript interfaces and types
   - `src/constants/` - Application constants
   - `src/utils/` - Helper functions and utilities

### Build Process

1. Development

   - Vite handles development server and HMR
   - Quasar provides UI framework and build tools
   - TypeScript for type safety

2. Production
   - Build output goes to `dist/` directory
   - Vercel handles deployment
   - Supabase provides backend services

## Key Features

- Vue 3 with Composition API
- Quasar Framework for UI components
- TypeScript for type safety
- Supabase for backend services
- Vercel for deployment
- ESLint and Prettier for code quality

## Development Workflow

1. Local development using `npm run dev`
2. Code quality enforced by ESLint and Prettier
3. TypeScript for type checking
4. Vercel for continuous deployment
5. Supabase for database and authentication

## Best Practices

- Components are organized by feature/functionality
- State management using Pinia stores
- Type safety with TypeScript
- Reusable logic in composables
- Consistent code style with ESLint and Prettier

## SSR Considerations

### Components Requiring SSR Adaptation

1. **Authentication Components**

   - `AuthPage.vue` and `AuthCallback.vue` need to handle server-side auth state
   - `authStore.ts` needs to be adapted for SSR context

2. **Data Fetching Components**

   - `useSupabase.ts` composable needs SSR-safe data fetching
   - Components using `searchStatements` and `fetchStatement` need SSR support

3. **State Management**
   - Pinia stores need to be initialized properly for SSR
   - User session state needs to be handled server-side

### SSR Implementation Strategy

1. **Data Fetching**

   - Move initial data fetching to `asyncData` or `setup` functions
   - Implement proper hydration of server-rendered state
   - Handle loading states during client-side navigation

2. **Authentication**

   - Implement server-side session validation
   - Handle auth state transfer between server and client
   - Manage protected routes during SSR

3. **Performance Optimization**

   - Implement proper caching strategies
   - Handle SEO metadata server-side
   - Optimize initial page load

4. **Error Handling**
   - Implement proper error boundaries for SSR
   - Handle network errors during server-side rendering
   - Provide fallback UI for failed SSR
