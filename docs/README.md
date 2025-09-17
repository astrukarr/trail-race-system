# Trail Race System - Documentation

Welcome to the comprehensive documentation for the Trail Race System **web-app** (Next.js frontend) application.

## 📚 Documentation Overview

This documentation provides complete coverage of the frontend application, including architecture, features, user flows, and technical implementation details.

## 📖 Available Documentation

### 🎯 [Frontend Documentation](./FRONTEND_DOCUMENTATION.md)

**Complete frontend overview and technical guide**

- System architecture and technology stack
- User roles and permissions
- Page descriptions and features
- API integration details
- Styling and UI guidelines
- Development and deployment information

### 🔄 [User Flow Diagrams](./USER_FLOW_DIAGRAMS.md)

**Visual representation of user journeys**

- Complete Applicant flow (registration → browsing → applying → managing)
- Complete Administrator flow (registration → managing races → monitoring applications)
- Cross-role interactions
- Error handling flows
- Mobile responsiveness patterns

### 🧩 [Components Documentation](./COMPONENTS_DOCUMENTATION.md)

**Detailed component library reference**

- Authentication components (AuthProvider)
- Layout components (Header, Navigation)
- Race components (RaceList, RaceCard)
- Page components (all pages with props and features)
- Styling components and utilities
- API service components
- Responsive design patterns

## 🚀 Quick Start Guide

### For Developers

1. **Start here**: [Frontend Documentation](./FRONTEND_DOCUMENTATION.md) - Get the big picture
2. **Understand flows**: [User Flow Diagrams](./USER_FLOW_DIAGRAMS.md) - See how users interact
3. **Dive into code**: [Components Documentation](./COMPONENTS_DOCUMENTATION.md) - Understand implementation

### For Product Managers

1. **Start here**: [User Flow Diagrams](./USER_FLOW_DIAGRAMS.md) - Understand user journeys
2. **Review features**: [Frontend Documentation](./FRONTEND_DOCUMENTATION.md) - See available features
3. **Technical details**: [Components Documentation](./COMPONENTS_DOCUMENTATION.md) - Understand capabilities

### For QA/Testers

1. **Start here**: [User Flow Diagrams](./USER_FLOW_DIAGRAMS.md) - Understand test scenarios
2. **Feature coverage**: [Frontend Documentation](./FRONTEND_DOCUMENTATION.md) - See all features
3. **Component testing**: [Components Documentation](./COMPONENTS_DOCUMENTATION.md) - Understand testable units

## 🎭 User Roles Summary

### 🏃‍♀️ Applicant (Race Participant)

**What they can do:**

- Browse available races
- Apply for races
- View their applications
- Delete their applications
- Update their profile

**Key pages:**

- Home (`/`) - Browse races
- Apply (`/apply`) - Submit applications
- My Applications (`/applications`) - Manage applications

### 🔑 Administrator (Race Organizer)

**What they can do:**

- Everything Applicants can do
- Create new races
- Edit existing races
- Delete races
- View all applications from all users
- Monitor system statistics

**Key pages:**

- Home (`/`) - Browse races with admin controls
- Manage Races (`/manage-races`) - Race management
- All Applications (`/all-applications`) - Monitor all applications

## 🛠️ Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Authentication**: JWT with cookies
- **Package Manager**: pnpm

## 📱 Key Features

### ✅ Implemented Features

- User authentication (login/register)
- Role-based access control
- Race browsing and display
- Application submission
- Application management
- Race management (admin)
- Application monitoring (admin)
- Responsive design
- Dark theme UI
- English language support

### 🔄 User Flows

- **Applicant**: Register → Login → Browse → Apply → Manage Applications
- **Administrator**: Register → Login → Manage Races → Monitor Applications

### 🎨 UI/UX Features

- Modern, clean design
- Dark theme with neutral colors
- Responsive mobile-first design
- Loading states and error handling
- Form validation
- Confirmation dialogs
- Empty state handling

## 🔧 Development Information

### Project Structure

```
client-app/src/
├── app/                    # Next.js pages
├── components/            # Reusable components
├── services/              # API services
├── styles/                # Global styles
└── lib/                   # Utilities
```

### Key Components

- **AuthProvider**: Global authentication state
- **RaceList/RaceCard**: Race display components
- **Navigation**: Role-based navigation
- **API Services**: Backend integration

### Environment Setup

- Node.js 18+
- pnpm package manager
- Docker support
- Environment variables for API URLs

## 📊 System Status

### ✅ Completed Features

- [x] User authentication system
- [x] Role-based access control
- [x] Race browsing and display
- [x] Application submission system
- [x] Application management
- [x] Race management (admin)
- [x] Application monitoring (admin)
- [x] Responsive design
- [x] Dark theme implementation
- [x] English translation
- [x] Error handling
- [x] Loading states
- [x] Form validation

### 🔄 In Progress

- [ ] Race creation form (admin)
- [ ] Race editing form (admin)
- [ ] Enhanced error handling
- [ ] Performance optimizations

### 📋 Future Enhancements

- [ ] Email notifications
- [ ] File uploads (race images)
- [ ] Advanced filtering and search
- [ ] Export functionality
- [ ] Analytics dashboard
- [ ] Multi-language support

## 🤝 Contributing

### Development Guidelines

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Implement proper error handling
4. Add loading states for async operations
5. Write component documentation
6. Test on multiple screen sizes

### Code Standards

- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Component documentation
- API error handling

## 📞 Support

### Documentation Issues

If you find any issues with this documentation or need clarification on any topic, please:

1. Check the relevant documentation file
2. Review the component implementation
3. Test the user flows
4. Contact the development team

### Technical Support

For technical issues:

1. Check browser console for errors
2. Verify API endpoints are running
3. Check authentication token validity
4. Review network requests in DevTools

---

## 📝 Document History

- **v1.0.0** (September 2025) - Initial documentation release
  - Complete frontend documentation
  - User flow diagrams
  - Component library reference
  - Technical implementation guide

---

_This documentation is maintained alongside the Trail Race System frontend application._
_Last updated: September 2025_
