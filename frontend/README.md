cat > README.md <<'EOF'
# QMS Frontend

The web app for the Quranic Management System. It works on desktop and mobile, with Arabic (RTL) support.

## Before you start

You need Node.js (LTS version). Check it with:

    node -v

If the command is not found, install Node.js from nodejs.org, then close and reopen the terminal.

## First-time setup (do this once)

1. Go into this folder:

       cd frontend

2. Install the packages:

       npm install

## Run the app

    npm run dev

Open the address it prints, usually http://localhost:5173. Press Ctrl + C to stop.

The app talks to the backend at http://localhost:3000. To use real data, start the backend too (see backend/README.md) in a second terminal.

## Other commands

- `npm run lint`: check the code for problems
- `npm run build`: create the production version
- `npm run preview`: view the production version locally
- `npm test`: run the frontend tests (once tests are added)

## Folders in src

- `layout/`: shared layout (sidebar, top bar, mobile menu, menu per role)
- `pages/`: one folder per screen (login, halaqat, teacher, session)
- `components/`: shared parts (buttons, forms, popups, messages, cards)
- `api/`: functions that call the backend
- `styles/`: colors, fonts, and RTL styles
- `tests/`: frontend tests

## Rules

- Pages call the backend only through `api/`, never directly.
- Every screen must work on desktop and mobile, in Arabic (RTL) and English.
- Follow the wireframes and style guide in docs/design.
- Do not commit the `.env` file or `node_modules`.
EOF