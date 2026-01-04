# ShareJoy: Application Requirements

This document serves as the primary source of truth for the ShareJoy application's goals, features, and requirements.

## 1. Project Overview
Build a mobile app for people to donate their used electronics to NGOs. There will be different interfaces to the apps based on the role of the user. The roles are:

## 2. User Roles & Personas
- **Regular User**: Individuals who register and want to donate their used electronics to NGOs.
- **NGO Admin**: Admin of an NGO that register and want to accept donations.
- **Approver**: NGO Administrators who approve/reject NGO submissions.
- **Admin**: Superuser who can manage all users and NGOs.
- **Backend Manager**: Manages the elctronics items list and takes care of logistics.

## 3. Core Functional Requirements
### Authentication & Profiles
- [ ] Users must be able to sign up with Email, Username and password.
- [ ] Users will be created as a Regular User by default.
- [ ] Users must be able to log in securely.
- [ ] Users can manage their account (Password changes, etc.).
- [ ] Users get a menu option to request for an elevated role.
- [ ] Elevated roles are: NGO Admin, Approver, Backend Manager.
- [ ] Elevated roles are approved by Admin users.
- [ ] Elevated roles are rejected by Admin users.
- [ ] Admin users can see a list of all users and their roles.
- [ ] Admin users can change the role of a user without request or approval.

### NGO Management
- [ ] NGO Admins can register a new NGO with details (Name, Address, Contact, PIN, etc.).
- [ ] NGO Admins can only see and edit their own NGO submissions.
- [ ] NGO submissions start in a 'Pending' state.
- [ ] NGO admins can resubmit a 'rejected' NGO submission.
- [ ] NGO admins can edit the details of their NGO submission.

### Approver Workflow
- [ ] Approvers can see a list of all 'Pending' NGOs.
- [ ] Approvers can Approve or Reject a submission.
- [ ] Approvers can add a note to a submission.
- [ ] Approvers cannot edit the details of an NGO, only the status.

### Backend Management
- [ ] Backend managers curates the list of electronics items.
- [ ] Backend managers can add new electronics items.
- [ ] Backend managers can edit existing electronics items.
- [ ] Backend managers can delete electronics items.

### Donations
- [ ] Donations are created when a user makes an electonic item available for donation. Donation is creted in the pending state.
- [ ] Pending Donations are available to NGO Admins for browsing.
- [ ] NGO admins can show interest in a donation. They provide justification for why they want to accept the donation.
- [ ] NGO admins can not directly accept or reject donations.
- [ ] Backend managers allocates donations to NGOs. The donation state moves to allocated.
- [ ] NGO admins can reject donations. The donation state moves to rejected.
- [ ] NGO admins can rate the donation after receiving it.
- [ ] NGO admins can add a note to a donation.
- [ ] NGO admins can see a list of all donations for their NGO.


### Logistics Management
- [ ] Backend managers can see a list of all donations.
- [ ] Backend managers can see a list of all donations for a specific NGO.
- [ ] Backend managers can see a list of all donations for a specific electronics item.
- [ ] Backend managers can see a list of all donations for a specific user.
- [ ] Backend manager schedules the pickup of a donation. The donation state moves to scheduled.
- [ ] The state of donation moves to in transit when the pickup is completed
- [ ] The state of donation moves to completed when the donation is received by the NGO.

## 4. Multi-Platform Requirements
### Mobile App (iOS/Android)
- Optimized for quick data entry and push notifications.
- Primary interface for Regular Users (on-the-go donation posting) and Backend Managers (pickup logistics).

### Web Interface (Desktop/Tablet)
- Optimized for large screens, providing a dense, dashboard-style view.
- Primary interface for NGO Admins, Approvers, and Admin users.
- Feature a multi-column layout for reviewing NGO submissions and donation allocations.
- Advanced reporting and data visualization for Admins.

## 5. Technical Constraints
- **Backend**: Supabase (Auth, PostgreSQL, RLS).
- **Mobile**: React Native (Expo).
- **Web**: To be determined (Next.js or Vite recommended for high performance).
- **Architecture**: Shared business logic (Supabase client/types) between platforms.

## 6. Non-Functional Requirements
- **Performance**: High-priority screens (Login/Dashboard) should load in < 2 seconds.
- **Resilience**: The app must handle slow network connectivity without hanging (Timeouts enabled).
- **UX**: Premium, dark-mode-first aesthetic with smooth micro-animations.
