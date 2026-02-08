# Instant-Dashboard

A web app that converts JSON data and a user prompt into an instant visual dashboard using AI.

## Description

This project is a simple one-page web application that takes JSON data and a natural language prompt from the user, then generates a live dashboard preview using an AI model (Groq LLaMA-3.3).
The dashboard displays totals and tables, with professional styling, directly in the browser.

## Features

- Input JSON data and a prompt to describe the dashboard
- AI generates HTML/CSS dashboard on-the-fly
- Preview area renders the dashboard in real-time
- Professional styling with tables, totals, and clean layout
- Fully functional in the browser

## Technologies

- Frontend: HTML, CSS, JavaScript (or React if using it)
- Backend: Node.js / Vercel API routes
- AI Model: Groq LLaMA-3.3-70B Versatile
- Hosting: Vercel

## Deployment on Vercel

Sign up at https://vercel.com
and connect your GitHub repository.
Clone the repository:

```bash
git clone https://github.com/your-username/instant-dashboard.git

In the Vercel dashboard, go to Settings → Environment Variables and add:


GROQ_API_KEY	your_actual_key	Production & Preview

Click Deploy.

Vercel will build the app and provide a live URL (e.g., https://instant-dashboard.vercel.app).

Test your app by entering JSON + Prompt → click Generate Dashboard.
```
