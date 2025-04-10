
# Ligenia Frontend – Prompt History (Cursor using Sonnet 3.5 and 3.7 + Lovable)

This document captures 10 realistic prompts that guided the development of the frontend for Ligenia using React, TailwindCSS, Supabase, and Vite. The project was initially scaffolded with Lovable and finalized in Cursor. Of course there were a lot of iterations with the LLM model to get the final result.

---

## Prompt 1:
Generate a frontend project using React and Tailwind CSS. Use Vite as the build tool. Structure the project with a clean separation between components, pages, and services. Include routing with React Router and authentication support using Supabase.

---

## Prompt 2:
Implement a landing page with login and registration forms. The forms should validate input (email format, minimum 6-character passwords), highlight invalid fields, and display inline error messages. Ensure error messages are shown in Spanish only.

---

## Prompt 3:
Use Supabase Auth to handle login, logout, and registration. Show a loading state while checking session status. After login, redirect the user to `/dashboard`. Ensure logout redirects to the landing page (`/`).

---

## Prompt 4:
Create a header component with a user avatar. If the user has no profile picture, show their initial inside a circle. Clicking the avatar should open a dropdown with the user’s name, a link to “Configuración” and a “Cerrar sesión” button. Style it with Tailwind.

---

## Prompt 5:
Implement a sidebar navigation menu for authenticated users. Highlight the active route. Add links to all core sections (Torneos, Partidos, Estadísticas, Configuración). When the user clicks “Cerrar sesión” in the sidebar, ensure it triggers a proper logout.

---

## Prompt 6:
In the user settings page, allow users to update their password. Add input validation, ensuring current password is required, new password must be at least 6 characters, and confirmation matches. Add a toggle to show/hide passwords.

---

## Prompt 7:
Enable user preference saving for appearance (light/dark mode). Store preferences using Supabase and apply them across the app. Ensure the UI reflects changes instantly and persists them between sessions.

---

## Prompt 8:
Replace all i18n placeholders and keys with static Spanish text. Remove the language selector and internationalization library entirely from the project. All text should be displayed in Spanish only.

---

## Prompt 9:
Fix session persistence issues. Ensure the app always starts on `/` and checks the Supabase session on load. If the session is expired, redirect to `/` and display a message indicating the session ended. Otherwise, redirect to `/dashboard`.

---

## Prompt 10:
Prepare the frontend for production deployment on Railway. Add a `vite.config.ts` configured for environment variables. Ensure the Supabase URL and keys are loaded from `.env.production`. Document the deployment process in a README.

---
