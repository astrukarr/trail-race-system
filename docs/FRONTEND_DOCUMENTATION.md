# Trail Race System - Frontend Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Pages & Features](#pages--features)
5. [User Flows](#user-flows)
6. [Technical Implementation](#technical-implementation)
7. [Styling & UI](#styling--ui)
8. [API Integration](#api-integration)

---

## 🎯 Overview

The Trail Race System frontend is a Next.js 14 application that provides a comprehensive platform for managing trail races and applications. The system supports two distinct user roles with different capabilities and interfaces.

### Key Features

- **User Authentication** - Login/Register system with JWT tokens
- **Role-based Access Control** - Different interfaces for Administrators and Applicants
- **Race Management** - Create, view, edit, and delete races (Admin only)
- **Application System** - Submit and manage race applications
- **Responsive Design** - Modern UI with Tailwind CSS
- **Real-time Updates** - Live data synchronization with backend services

---

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context (AuthProvider)
- **HTTP Client**: Axios
- **Authentication**: JWT tokens with cookies
- **Package Manager**: pnpm

### Project Structure

```
client-app/src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (races list)
│   ├── login/page.tsx     # Login page
│   ├── register/page.tsx  # Registration page
│   ├── apply/page.tsx     # Application form
│   ├── applications/page.tsx # My Applications (Applicant)
│   ├── manage-races/page.tsx # Manage Races (Admin)
│   ├── all-applications/page.tsx # All Applications (Admin)
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── layout/            # Layout components (Header, Navigation)
│   └── races/             # Race-related components
├── services/              # API services
├── styles/                # Global styles
└── lib/                   # Utility functions
```

---

## 👥 User Roles & Permissions

### 🔑 Administrator

**Capabilities:**

- ✅ Create new races
- ✅ Edit existing races
- ✅ Delete races
- ✅ View all applications from all users
- ✅ Manage user accounts
- ✅ Access admin dashboard
- ✅ View system statistics

**UI Elements:**

- "Create Race" button
- "Edit" and "Delete" buttons on race cards
- "Manage Races" navigation item
- "All Applications" navigation item
- Admin-only sections and controls

### 🏃‍♀️ Applicant

**Capabilities:**

- ✅ View available races
- ✅ Apply for races
- ✅ View own applications
- ✅ Delete own applications
- ✅ Update profile information

**UI Elements:**

- "Apply Now" button on race cards
- "My Applications" navigation item
- Application form access
- Personal dashboard

---

## 📄 Pages & Features

### 🏠 Home Page (`/`)

**Purpose**: Main landing page displaying available races
**Access**: All authenticated users

**Features:**

- Race cards with key information (name, distance, creation date)
- Role-based action buttons:
  - **Applicant**: "Apply Now" button
  - **Administrator**: "Edit" and "Delete" buttons
- Responsive grid layout
- Loading states and error handling

**Components Used:**

- `RaceList` - Displays grid of race cards
- `RaceCard` - Individual race display component

### 🔐 Authentication Pages

#### Login Page (`/login`)

**Purpose**: User authentication
**Access**: Unauthenticated users only

**Features:**

- Email/password form
- Form validation
- Error message display
- Redirect to home page on success
- Link to registration page

#### Register Page (`/register`)

**Purpose**: New user registration
**Access**: Unauthenticated users only

**Features:**

- Registration form (email, password, first name, last name, role)
- Role selection (Applicant/Administrator)
- Form validation
- Success/error feedback
- Redirect to home page on success

### 📝 Application Form (`/apply`)

**Purpose**: Submit race applications
**Access**: Authenticated Applicants only

**Features:**

- Race information display
- Application form (first name, last name, club)
- Form validation
- Submission with loading state
- Success confirmation
- Cancel option

**URL Parameters:**

- `raceId` - Required race identifier

### 📋 My Applications (`/applications`)

**Purpose**: View and manage personal applications
**Access**: Authenticated Applicants only

**Features:**

- List of submitted applications
- Application details (race name, personal info, submission date)
- Delete application option
- Empty state when no applications
- Link to view available races

### ⚙️ Manage Races (`/manage-races`)

**Purpose**: Race management for administrators
**Access**: Administrators only

**Features:**

- Complete list of all races
- Race details (name, distance, creation/update dates)
- Edit race functionality (prepared for implementation)
- Delete race with confirmation
- Create new race button
- Empty state when no races exist

### 📊 All Applications (`/all-applications`)

**Purpose**: View all user applications
**Access**: Administrators only

**Features:**

- Complete list of all applications
- Application details (applicant info, race info, submission date)
- Application status display
- Summary statistics
- Empty state when no applications exist

---

## 🔄 User Flows

### 🏃‍♀️ Applicant Flow

#### 1. Registration & Login

```
Unauthenticated User
    ↓
Register Account (Choose "Applicant" role)
    ↓
Login with credentials
    ↓
Redirected to Home Page
```

#### 2. Browse & Apply for Races

```
Home Page (Races List)
    ↓
Click "Apply Now" on desired race
    ↓
Application Form (/apply?raceId=xxx)
    ↓
Fill form (First Name, Last Name, Club)
    ↓
Submit Application
    ↓
Success Message
    ↓
Redirect to Home Page
```

#### 3. Manage Applications

```
Click "My Applications" in navigation
    ↓
View Applications List (/applications)
    ↓
See all submitted applications
    ↓
Option to delete applications
```

### 🔑 Administrator Flow

#### 1. Registration & Login

```
Unauthenticated User
    ↓
Register Account (Choose "Administrator" role)
    ↓
Login with credentials
    ↓
Redirected to Home Page with admin controls
```

#### 2. Race Management

```
Home Page (Races List with admin controls)
    ↓
Click "Manage Races" in navigation
    ↓
Manage Races Page (/manage-races)
    ↓
View all races with edit/delete options
    ↓
Create new races
    ↓
Edit existing races
    ↓
Delete races with confirmation
```

#### 3. Application Monitoring

```
Click "All Applications" in navigation
    ↓
All Applications Page (/all-applications)
    ↓
View all user applications
    ↓
Monitor application statistics
    ↓
Track user engagement
```

---

## ⚙️ Technical Implementation

### 🔐 Authentication System

#### AuthProvider Context

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}
```

#### Token Management

- JWT tokens stored in HTTP-only cookies
- Automatic token attachment to API requests
- Token refresh handling
- Automatic logout on token expiration

#### Route Protection

- Role-based access control
- Automatic redirects for unauthorized access
- Protected routes with authentication checks

### 🌐 API Integration

#### API Client Configuration

```typescript
// Axios instance with interceptors
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
```

#### Request Interceptors

- Automatic JWT token attachment
- Request logging and debugging

#### Response Interceptors

- 401 error handling (automatic logout)
- Error message standardization
- Response data transformation

### 📱 State Management

#### Local State

- Component-level state with `useState`
- Form state management
- Loading and error states

#### Global State

- Authentication state via Context
- User information persistence
- Role-based UI rendering

### 🔄 Data Flow

#### Race Data Flow

```
Backend API (Query Service)
    ↓
Frontend API Service (raceQueryApi)
    ↓
React Components (RaceList, RaceCard)
    ↓
User Interface
```

#### Application Data Flow

```
User Input (Application Form)
    ↓
Frontend API Service (applicationCommandApi)
    ↓
Backend API (Command Service)
    ↓
Database Update
    ↓
Real-time UI Update
```

---

## 🎨 Styling & UI

### Design System

- **Color Palette**: Neutral-based dark theme
- **Typography**: System fonts with clear hierarchy
- **Spacing**: Consistent spacing scale
- **Components**: Reusable component library

### Tailwind CSS Classes

#### Custom Component Classes

```css
.btn-primary    /* Primary action buttons */
/* Primary action buttons */
.btn-secondary  /* Secondary action buttons */
.btn-danger     /* Delete/destructive actions */
.btn-accent     /* Accent color buttons */
.card           /* Card containers */
.card-body      /* Card content */
.form-input     /* Form input fields */
.form-label     /* Form labels */
.spinner; /* Loading spinner */
```

#### Color Scheme

- **Primary**: Neutral-800 (dark gray)
- **Secondary**: Neutral-600 (medium gray)
- **Accent**: Neutral-500 (light gray)
- **Background**: Gray-50 (light background)
- **Text**: Neutral-900 (dark text)

### Responsive Design

- **Mobile-first approach**
- **Breakpoints**: sm, md, lg, xl
- **Grid layouts**: Responsive race cards
- **Navigation**: Collapsible on mobile

### Component Library

#### Buttons

- Primary: Dark background, white text
- Secondary: Light background, dark text
- Danger: Red background for destructive actions
- Sizes: sm, md, lg variants

#### Cards

- Clean white background
- Subtle shadows
- Rounded corners
- Consistent padding

#### Forms

- Clear labels and placeholders
- Validation states
- Error message display
- Loading states

---

## 🔌 API Integration

### Service Architecture

#### API Services

```typescript
// Authentication API
authApi.login();
authApi.register();
authApi.getMe();

// Race API
raceQueryApi.getAll();
raceQueryApi.getById();
raceCommandApi.create();
raceCommandApi.update();
raceCommandApi.delete();

// Application API
applicationQueryApi.getAll();
applicationCommandApi.create();
applicationCommandApi.delete();
```

#### Error Handling

- Network error handling
- API error message display
- Retry mechanisms
- Fallback UI states

#### Loading States

- Component-level loading indicators
- Global loading states
- Skeleton screens for better UX

### Environment Configuration

```typescript
// Environment variables
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_QUERY_API_URL=http://localhost:3002
```

---

## 🚀 Deployment & Build

### Build Process

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

### Docker Configuration

- Multi-stage Docker build
- Production optimizations
- Static asset handling
- Environment variable injection

### Performance Optimizations

- Code splitting
- Image optimization
- Bundle size optimization
- Caching strategies

---

## 🔧 Development Guidelines

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component documentation

### Testing Strategy

- Component testing
- Integration testing
- E2E testing scenarios
- API mocking

### Accessibility

- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

---

## 📚 Additional Resources

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### API Documentation

- See `COMMAND_SERVICE_DOCS.md` for backend API details
- See `QUERY_SERVICE_IMPLEMENTATION.md` for query service details

### Troubleshooting

- Check browser console for errors
- Verify API endpoints are running
- Check authentication token validity
- Review network requests in DevTools

---

_Last updated: September 2025_
_Version: 1.0.0_
