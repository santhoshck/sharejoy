# AI Guidelines & Project Persona

This document provides persistent instructions for AI agents working on the ShareJoy project. Please refer to this for all design, architectural, and implementation decisions.

## 1. Design Principles (The "Aesthetic")
- **Premium & Modern**: Use a "Glassmorphism" or "Apple-esque" clean aesthetic.
- **Vibrant & Dynamic**: Favor HSL-based color palettes. Use `#6366f1` (Indigo) as the primary brand color.
- **Responsive & Contextual**:
    - **Mobile**: Minimalist, single-column, thumb-friendly interactions.
    - **Web**: Dense, multi-column dashboard layouts. Use sidebars and wide tables to maximize screen utility. Avoid "blown-up mobile" designs on web.
- **Animations**: Subtle micro-animations on all interactive elements (Hover, Press).
- **Dark Mode First**: Ensure all UI looks stunning in dark mode.

## 2. Technical Approach
- **Atomic Components**: Keep components small, focused, and reusable within `src/components`.
- **Supabase-First**: Use Row Level Security (RLS) instead of manual filtering whenever possible.
- **Fail Gracefully**: Every network request MUST have a timeout and a fallback state (no permanent spinners).
- **TypeScript Strict**: Use full typing for all objects, especially Props and State. No `any`.

## 3. Implementation Workflow
- **Plan First**: Always propose an implementation plan for new features.
- **Atomic Commits/Steps**: Break down large features into small, testable chunks.
- **Self-Correction**: If a tool call fails, debug the root cause before retrying.
- **Multi-Platform**: Implement features for both mobile and web.
- **Shared Business Logic**: Use Supabase client and types for shared business logic.
- **Reuse**: Recheck at the end of every task if there is any duplication that can be avoided

## 4. Communication Style
- **Proactive but Concise**: Suggest optimizations but don't over-explain obvious code.
- **Visual Evidence**: Always use screenshots or recordings to demonstrate UI changes.
- **Checkpoints**: Ask for feedback at major architectural junctions.

## 5. Domain Knowledge (ShareJoy)
- **Roles are Critical**: Be highly aware of the 5 roles (User, NGO Admin, Approver, Admin, Backend Manager).
- **Logistics Focus**: The app is not just a directory; it's a logistics management tool for electronics.
- **Security**: Data privacy for donors (Regular Users) is paramount.
