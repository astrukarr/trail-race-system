# Frontend Components Documentation

## 📦 Component Library

### 🔐 Authentication Components

#### AuthProvider (`/components/auth/AuthProvider.tsx`)

**Purpose**: Global authentication state management
**Type**: React Context Provider

**Props**: None (wraps entire app)

**State**:

```typescript
interface AuthContextType {
  user: User | null; // Current user data
  token: string | null; // JWT token
  isLoading: boolean; // Loading state
  isAuthenticated: boolean; // Auth status
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}
```

**Features**:

- JWT token management with cookies
- Automatic token refresh
- User session persistence
- Role-based access control
- Error handling for auth failures

**Usage**:

```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

---

### 🏗️ Layout Components

#### Header (`/components/layout/Header.tsx`)

**Purpose**: Top navigation bar with user info
**Type**: Functional Component

**Features**:

- Logo and app title
- User welcome message
- User role display
- Logout button
- Responsive design

**Props**: None (uses AuthProvider context)

**Rendering Logic**:

- Shows only when user is authenticated
- Displays user name and role
- Provides logout functionality

#### Navigation (`/components/layout/Navigation.tsx`)

**Purpose**: Main navigation menu
**Type**: Functional Component

**Features**:

- Role-based navigation items
- Active page highlighting
- Responsive navigation
- Dark theme styling

**Navigation Items**:

```typescript
const navItems = [
  { path: "/", label: "Races", roles: ["Applicant", "Administrator"] },
  { path: "/applications", label: "My Applications", roles: ["Applicant"] },
  { path: "/manage-races", label: "Manage Races", roles: ["Administrator"] },
  {
    path: "/all-applications",
    label: "All Applications",
    roles: ["Administrator"],
  },
];
```

**Props**: None (uses AuthProvider context)

---

### 🏃‍♀️ Race Components

#### RaceList (`/components/races/RaceList.tsx`)

**Purpose**: Display grid of race cards
**Type**: Functional Component

**Props**:

```typescript
interface RaceListProps {
  onApply?: (raceId: string) => void; // Apply callback
  onEdit?: (race: Race) => void; // Edit callback
  onDelete?: (raceId: string) => void; // Delete callback
  showActions?: boolean; // Show action buttons
}
```

**Features**:

- Fetches races from API
- Loading and error states
- Empty state handling
- Responsive grid layout
- Role-based action buttons

**State Management**:

```typescript
const [races, setRaces] = useState<Race[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState("");
```

**API Integration**:

- Uses `raceQueryApi.getAll()`
- Handles API errors gracefully
- Refreshes data on mount

#### RaceCard (`/components/races/RaceCard.tsx`)

**Purpose**: Individual race display card
**Type**: Functional Component

**Props**:

```typescript
interface RaceCardProps {
  race: Race; // Race data
  onApply?: (raceId: string) => void; // Apply callback
  onEdit?: (race: Race) => void; // Edit callback
  onDelete?: (raceId: string) => void; // Delete callback
  showActions?: boolean; // Show action buttons
  userRole?: string; // User role for permissions
}
```

**Features**:

- Race information display
- Role-based action buttons
- Hover effects
- Responsive design
- Distance formatting

**Action Buttons**:

- **Applicant**: "Apply Now" button
- **Administrator**: "Edit" and "Delete" buttons

**Styling**:

- Card-based design with shadows
- Hover animations
- Dark theme colors
- Responsive layout

---

## 📄 Page Components

### 🏠 Home Page (`/app/page.tsx`)

**Purpose**: Main landing page with races
**Type**: Next.js Page Component

**Features**:

- Race list display
- Role-based actions
- Authentication checks
- Responsive layout

**User Experience**:

- **Unauthenticated**: Shows login/register options
- **Applicant**: Shows races with "Apply Now" buttons
- **Administrator**: Shows races with admin controls

**Components Used**:

- `RaceList` - Main race display
- `AuthProvider` - Authentication context

### 🔐 Login Page (`/app/login/page.tsx`)

**Purpose**: User authentication
**Type**: Next.js Page Component

**Features**:

- Email/password form
- Form validation
- Error handling
- Success redirect
- Link to registration

**Form Fields**:

```typescript
const [formData, setFormData] = useState({
  email: "",
  password: "",
});
```

**Validation**:

- Required field validation
- Email format validation
- API error display

### 📝 Application Form (`/app/apply/page.tsx`)

**Purpose**: Race application submission
**Type**: Next.js Page Component with Suspense

**Features**:

- Race information display
- Application form
- Form validation
- Submission handling
- Success confirmation

**URL Parameters**:

- `raceId` - Required race identifier

**Form Fields**:

```typescript
const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  club: "",
});
```

**Suspense Boundary**:

- Wrapped in Suspense for `useSearchParams`
- Loading fallback component
- Error boundary handling

### 📋 My Applications (`/app/applications/page.tsx`)

**Purpose**: Personal application management
**Type**: Next.js Page Component

**Features**:

- Application list display
- Application details
- Delete functionality
- Empty state handling
- Link to races

**Access Control**:

- Applicants only
- Automatic redirect for unauthorized users

**API Integration**:

- `applicationQueryApi.getAll()` - Fetch applications
- `applicationCommandApi.delete()` - Delete applications

### ⚙️ Manage Races (`/app/manage-races/page.tsx`)

**Purpose**: Race management for administrators
**Type**: Next.js Page Component

**Features**:

- Complete race list
- Race details display
- Edit/Delete actions
- Create race button
- Empty state handling

**Access Control**:

- Administrators only
- Automatic redirect for unauthorized users

**Actions**:

- Edit race (prepared for implementation)
- Delete race with confirmation
- Create new race (redirect to form)

### 📊 All Applications (`/app/all-applications/page.tsx`)

**Purpose**: View all user applications
**Type**: Next.js Page Component

**Features**:

- All applications display
- Application statistics
- Applicant information
- Race information
- Summary statistics

**Access Control**:

- Administrators only
- Automatic redirect for unauthorized users

**Statistics**:

- Total application count
- Application status overview
- User engagement metrics

---

## 🎨 Styling Components

### Global Styles (`/styles/globals.css`)

**Purpose**: Global CSS with Tailwind utilities
**Type**: CSS File

**Custom Classes**:

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

**Color Scheme**:

- Primary: `bg-neutral-800` (dark gray)
- Secondary: `bg-neutral-600` (medium gray)
- Accent: `bg-neutral-500` (light gray)
- Background: `bg-gray-50` (light background)
- Text: `text-neutral-900` (dark text)

**Responsive Design**:

- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Grid layouts with responsive columns
- Flexible spacing and sizing

---

## 🔌 API Service Components

### API Client (`/lib/api.ts`)

**Purpose**: Axios configuration and interceptors
**Type**: Utility Module

**Configuration**:

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
```

**Request Interceptor**:

- Automatic JWT token attachment
- Request logging
- Error handling

**Response Interceptor**:

- 401 error handling (auto logout)
- Error message standardization
- Response transformation

### API Services (`/services/api.ts`)

**Purpose**: API endpoint definitions
**Type**: Service Module

**Services**:

```typescript
// Authentication API
export const authApi = {
  login: (data: LoginData) => api.post("/api/auth/login", data),
  register: (data: RegisterData) => api.post("/api/auth/register", data),
  getMe: () => api.get("/api/auth/me"),
};

// Race API
export const raceQueryApi = {
  getAll: () => api.get("/api/races"),
  getById: (id: string) => api.get(`/api/races/${id}`),
};

export const raceCommandApi = {
  create: (data: CreateRaceData) => api.post("/api/races", data),
  update: (id: string, data: UpdateRaceData) =>
    api.put(`/api/races/${id}`, data),
  delete: (id: string) => api.delete(`/api/races/${id}`),
};

// Application API
export const applicationQueryApi = {
  getAll: () => api.get("/api/applications"),
};

export const applicationCommandApi = {
  create: (data: CreateApplicationData) => api.post("/api/applications", data),
  delete: (id: string) => api.delete(`/api/applications/${id}`),
};
```

---

## 🔧 Utility Components

### Type Definitions

**Location**: `/services/api.ts`

**Interfaces**:

```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "Applicant" | "Administrator";
}

export interface Race {
  id: string;
  name: string;
  distance: "5k" | "10k" | "HalfMarathon" | "Marathon";
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  firstName: string;
  lastName: string;
  club?: string;
  raceId: string;
  raceName?: string;
  raceDistance?: string;
  userEmail?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Error Handling

**Pattern**: Consistent error handling across components

**Error States**:

```typescript
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
```

**Error Display**:

```typescript
{
  error && (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600">{error}</p>
    </div>
  );
}
```

### Loading States

**Pattern**: Consistent loading indicators

**Loading Display**:

```typescript
{
  loading && (
    <div className="flex justify-center items-center py-16">
      <div className="spinner w-8 h-8 mr-3"></div>
      <span className="text-neutral-600 font-medium">Loading...</span>
    </div>
  );
}
```

---

## 📱 Responsive Design Patterns

### Grid Layouts

```typescript
// Race cards grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {races.map(race => <RaceCard key={race.id} race={race} />)}
</div>

// Form fields grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <input className="form-input" />
  <input className="form-input" />
</div>
```

### Mobile Navigation

```typescript
// Responsive navigation
<nav className="bg-white border-b border-neutral-200">
  <div className="container">
    <div className="flex space-x-8">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          {item.label}
        </Link>
      ))}
    </div>
  </div>
</nav>
```

### Button Sizing

```typescript
// Responsive button sizes
<button className="btn btn-primary btn-sm md:btn-md lg:btn-lg">
  Action Button
</button>
```

---

## 🧪 Testing Considerations

### Component Testing

- Unit tests for individual components
- Props validation testing
- State management testing
- Event handler testing

### Integration Testing

- API integration testing
- Authentication flow testing
- Form submission testing
- Navigation testing

### E2E Testing

- Complete user journey testing
- Cross-browser testing
- Mobile responsiveness testing
- Performance testing

---

_Last updated: September 2025_
_Version: 1.0.0_
