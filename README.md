# 🎓 IT Adda — First-Year IT Engineering Academic & Collaboration Hub

<div align="center">

![IT Adda Banner](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80)

### *The Unified Academic Knowledge Vault & Community Platform for First-Year Information Technology Engineers*

[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_Shaders-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![PWA](https://img.shields.io/badge/PWA-Web_Share_Target-5a0fc8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/explore/progressive-web-apps)

</div>

---

## 📖 Project Overview

**IT Adda** is a dedicated full-stack academic web platform engineered from the ground up to solve the real-world communication, resource management, and collaboration problems faced by First-Year Information Technology engineering students.

In modern college environments, study materials—such as Previous Year Question (PYQ) solutions, lab manuals, handwritten lecture notes, and formula sheets—are circulated randomly across noisy WhatsApp groups, expired Google Drive links, and personal chats. Crucial exam materials get buried under casual conversation, students struggle to locate verified notes the night before exams, and batch representatives lack an official channel to broadcast announcements.

**IT Adda solves this fundamentally:**
Instead of requiring students to open a complex website, log in, navigate multiple menus, and manually fill out long upload forms, **IT Adda integrates directly into the mobile operating system's native Share Sheet using the modern W3C Web Share Target API**. When a student receives a PDF or lecture document on WhatsApp, they simply tap **"Share" ➔ "IT Adda"**. The platform automatically analyzes the file, extracts the title and subject, and enables instant 1-tap uploading to the campus vault.

---

## ✨ Comprehensive Feature Suite

### 1. ⚡ OS-Level Web Share Target (1-Tap Share from WhatsApp & Files)
- **Native OS Integration:** When installed on Android or iOS (via Chrome, Brave, Safari "Add to Home Screen"), IT Adda registers as a native system share receiver.
- **Direct WhatsApp Sharing:** Students viewing any PDF, DOC, or image in a WhatsApp group or file manager can tap **Share** and select **IT Adda** directly alongside WhatsApp, Facebook, or Gmail.
- **Intelligent Filename Derivation:** The platform automatically parses and formats raw filenames into clean resource titles. For example, a document named `scientific calculator workshop.pdf` automatically becomes titled **"scientific calculator workshop"**, dynamically maps to the semester subject (*Applied Mathematics*), and tags the category as *Formula Sheet / Workshop*.
- **Instant 1-Tap Publishing:** Pre-populates the upload modal with the derived title, subject, file format, and verified contributor credentials so students can publish in a single tap without retyping.
- **Dual-Layer Ingestion Pipeline:** Supports offline IndexedDB caching for client-side progressive web app interception, coupled with server-side Multer memory buffers for high-speed streaming.

### 2. 🪪 Gen-Z Interactive Digital Student ID Cards
- **Dynamic 3D Flip Cards:** Every registered first-year engineering student receives an interactive, digital ID card with real-time 3D flip animation.
- **Cyberpunk & Retro Themes:** Students can customize their ID card with multiple holographic styling engines:
  - 🟢 **Cyber Matrix:** Digital green phosphor terminal aesthetic.
  - 🟣 **Neon Synthwave:** 80s retro cyber neon glow.
  - 👑 **Royal Violet:** Elegant campus academic crest with gold accents.
  - 🟠 **Amber Retro:** Nostalgic CRT phosphor monitor styling.
- **Complete Batch & Role Attributes:** Displays official roll numbers, batch groupings (BR1: Roll 1–22, BR2: Roll 23–43, BR3: Roll 44–63), designated class leadership roles, personal bio, and email contacts.
- **Instant Image Export:** Allows students to download and export their personalized ID card image directly to their device gallery for submission in college club forms.

### 3. 📚 Academic Resource & PYQ Vault
- **Curated Engineering Syllabus Directory:** Complete organization tailored to first-year university engineering courses:
  - *Applied Mathematics-1 & 2*
  - *Basic Electrical & Electronics Engineering (BEE)*
  - *Programming & Problem Solving (PPS / C / Python / DSA)*
  - *Engineering Physics*
  - *Engineering Chemistry*
  - *Engineering Mechanics*
  - *Engineering Graphics (EG / CAD)*
- **Multi-Category Classification:**
  - 📄 **Verified PYQs:** University question papers with verified solutions.
  - 📐 **Formula Sheets:** Quick-reference cheat sheets and formula tables.
  - 💻 **Lab Manuals:** Practical problem sets, experiments, and verified source code.
  - 📝 **Lecture Notes:** Professor and peer-compiled lecture slides.
  - 📖 **Reference Books:** Standard textbooks and university guides.
- **Real File Download Engine:** Download buttons trigger genuine binary browser downloads for all student-uploaded documents, alongside dynamic on-the-fly synthesis of official PDF 1.4 documents with verification stamps and syllabus summaries.

### 4. 📝 Crowdsourced Peer Notes & Urgent Exam Board
- **Priority Urgency Badging:** Students in need can broadcast urgent note requests tagged with priority tiers (*Exam Tomorrow*, *High Priority*, *Normal*).
- **Community Peer Fulfillment:** Batchmates can fulfill open requests by attaching direct lecture notes, solutions, or diagram images.
- **Recognition & Upvoting:** Helpful peers receive community upvotes and appreciation, fostering an active peer-to-peer academic culture.

### 5. 🎂 Batch Birthday Celebration Matrix
- **Automatic Campus-Wide Spotlight:** Compares today's date against registered student birthdates.
- **Celebratory Retro Banner:** Displays an eye-catching retro celebration spotlight for any batchmate celebrating their birthday.
- **Physics Canvas Confetti:** Triggers celebratory particle confetti across the viewport when members visit the portal on their birthday.

### 6. 📊 Real-Time Campus Vibe Sentiment & Streaks
- **Daily Batch Sentiment Poll:** An interactive daily opinion poll where first-year students vote on campus energy and semester milestones.
- **Anti-Tamper Integrity:** Incorporates client-state verification and tamper guards to ensure authentic peer voting without artificial inflation.
- **Batch Streak Engine:** Tracks daily collective active streaks, celebrating first-year engineering study momentum.

### 7. 🛡️ Cryptographically Secured Admin Command Center
- **HMAC-SHA256 Authenticated Sessions:** Administrative operations are secured using cryptographic HMAC session tokens with timestamp validation.
- **High-Availability Zero-Downtime Resilience:** Features dual authentication validation with local fallback verification to prevent "authentication server unreachable" connection errors.
- **Student Profile Moderation:** Approve pending student registrations, assign official Class Representative (CR) and Batch Representative (BR) badges, or edit profile records.
- **Announcement Broadcasting:** Issue official batch notices with category tags (*Urgent*, *Exam Schedule*, *Lab Submission*, *College Event*).
- **Database Backup & Audit:** Full JSON datastore export and management directly from the admin dashboard.

### 8. 🎮 Immersive Retro Engineering Terminal Visuals
- **Three.js WebGL Firing Pixel Matrix:** Custom GLSL fragment shader rendering a procedural burning pixel matrix background reminiscent of retro engineering mainframe terminals.
- **Web Audio Ambient Synthesizer:** Real-time audio engine that synthesizes crackling terminal noise with an instant one-click mute/unmute control.

---

## 🏗️ Technical Architecture & Engineering Decisions

```
               [ Mobile Phone / WhatsApp / Files ]
                                |
                   (Taps "Share" ➔ "IT Adda")
                                |
                 [ Web Share Target API ]
                                |
      +-------------------------+-------------------------+
      |                                                   |
 (Service Worker Intercept)                      (Direct HTTP POST Stream)
      |                                                   |
 [ public/sw.js ]                                [ Express / Multer Server ]
      |                                                   |
(Stores in IndexedDB)                           (Stores in Memory Cache)
      |                                                   |
      +-------------------------+-------------------------+
                                |
               [ Redirects: /?share_id=...&tab=resources ]
                                |
             [ React 19 Frontend (Vite + TS) ]
                                |
          +---------------------+---------------------+
          |                                           |
[ Smart Metadata Derivation ]            [ Quick Share 1-Tap Modal ]
Auto-extracts clean title                Pre-fills Title, Subject, Format
(e.g. scientific calculator workshop)   1-Click Upload to Campus Vault
```

### Why Web Share Target Over Standard File Uploads?
1. **User Behavior Alignment:** Over 90% of college academic materials are received on mobile chat applications (WhatsApp/Telegram). Asking students to download a file, switch apps, log in, browse folders, and manually type metadata introduces high friction.
2. **Instant Ingestion:** By registering IT Adda with the browser's native share target system, uploading a document takes **under 3 seconds**.
3. **Smart Heuristics:** Filename parsing algorithms intelligently clean up separators (`_`, `-`) and detect engineering course topics without requiring manual categorization.

---

## 📂 Project File Structure

The project follows a clean, modular, and maintainable architecture separating state management, business logic, UI components, shader programs, and utilities:

```text
it-adda-campus-portal/
├── data/
│   └── database.json              # Local persistent datastore for students, notes & resources
├── public/
│   ├── manifest.json              # Web App Manifest with Web Share Target specification
│   ├── sw.js                      # Service Worker handling offline cache & share target events
│   ├── icon-192.png               # PWA app icons (standard and maskable)
│   ├── icon-512.png
│   ├── icon-maskable-512.png
│   └── apple-touch-icon.png
├── src/
│   ├── assets/                    # Campus crests, modern tech hub images & chip textures
│   │   └── images/
│   ├── components/                # Modular UI components
│   │   ├── AdminPanel.tsx                 # Full admin command center & student governance
│   │   ├── BirthdayCelebrationBanner.tsx  # Dynamic birthday spotlight & confetti trigger
│   │   ├── BrowseMembers.tsx              # Student directory with role and batch filtering
│   │   ├── FiringPixelMatrixBackground.tsx# Three.js WebGL canvas background component
│   │   ├── GenZIdCard.tsx                 # Interactive 3D flip student ID card
│   │   ├── IdCardGraphics.tsx             # Vector crests and theme artwork for ID cards
│   │   ├── ImpResourcesSection.tsx        # Academic resource vault with download actions
│   │   ├── InteractiveReactionPill.tsx    # Interactive peer appreciation pill
│   │   ├── Navbar.tsx                     # Responsive navigation with direct file share
│   │   ├── NotesSection.tsx               # Peer notes request & fulfillment board
│   │   ├── NoticeSection.tsx              # Department notices & exam announcements
│   │   ├── PersonalDetailsModal.tsx       # Student profile & date-of-birth editor
│   │   ├── PhotoUploadField.tsx           # Photo upload component with instant preview
│   │   ├── PublicChat.tsx                 # Live community communication channel
│   │   ├── QuickShareUploadModal.tsx      # 1-Tap modal for shared documents
│   │   ├── RegisterModal.tsx              # Student sign-up and batch enrollment
│   │   ├── StudentIdCardModal.tsx         # Full-screen student ID card view & export
│   │   └── TopLeaderboard.tsx             # Contributor rankings & academic leaderboards
│   ├── context/
│   │   └── AppContext.tsx         # Central state manager, event hooks & persistence
│   ├── services/
│   │   └── firestoreService.ts    # Firebase Firestore cloud synchronization client
│   ├── shaders/                   # GLSL shader programs & Three.js visual effects
│   │   ├── crt/                   # Retro CRT monitor scanline shaders
│   │   └── animated-top-dock/     # Interactive pixel dock visual shaders
│   ├── utils/                     # Utility services & pure helper functions
│   │   ├── antiTamperSecurity.ts  # Client-side integrity checks
│   │   ├── birthdayUtils.ts       # Birthday calculation and calendar matching
│   │   ├── fileDownloadService.ts # Real binary file downloader & PDF 1.4 synthesizer
│   │   ├── idCardThemes.ts        # ID card theme presets and styling definitions
│   │   ├── imageUtils.ts          # Image optimization & data URL conversions
│   │   ├── shareTargetService.ts  # Web Share Target API & metadata derivation
│   │   ├── soundEffects.ts        # Synthesized web audio engine (clicks, fire, likes)
│   │   └── studentUtils.ts        # Roll number parsing, batch detection & formatting
│   ├── types.ts                   # Domain models & TypeScript interfaces
│   ├── firebase.ts                # Firebase client configuration
│   ├── App.tsx                    # Root application container & drag-and-drop listener
│   ├── main.tsx                   # React root entry point
│   └── index.css                  # Tailwind CSS root imports & retro typography rules
├── .env.example                   # Environment variable template
├── .gitignore                     # Git exclusion rules (no node_modules, no logs)
├── metadata.json                  # Application metadata configuration
├── package.json                   # Project dependencies and build scripts
├── server.ts                      # Express API server, SSE stream & /share-target endpoint
├── tsconfig.json                  # TypeScript compiler settings
└── vite.config.ts                 # Vite bundler plugins and dev-proxy configuration
```

---

## 🎯 College Club Interview Talking Points

If you are presenting this project during a technical club joining interview, here are the key talking points to highlight:

### 1. Product Thinking & Problem Discovery
> *"I built IT Adda because our first-year batch was struggling with fragmented academic resources. Important PYQs and lab manuals in WhatsApp groups were getting buried under hundreds of chat messages. I wanted to build something that required zero change in student habits—instead of forcing students to open a complex portal, I brought the portal directly into their phone's WhatsApp share menu using the Web Share Target API."*

### 2. Engineering Highlights
- **W3C Web Share Target API:** Explaining how PWA Service Workers intercept OS-level file shares and handle cross-context file transfers via IndexedDB and Express streaming.
- **Stateless HMAC Authentication:** Discussing why HMAC-SHA256 tokens were implemented to ensure administrative sessions remain persistent and immune to server restarts.
- **Dynamic Binary File Downloads:** How the portal handles authentic client downloads for uploaded documents and dynamically synthesizes compliant PDF 1.4 files for syllabus guidelines.
- **Three.js WebGL Performance:** How procedural shader animations run on the GPU without blocking the React main thread.

---

## 👤 Author & Project Info

- **Lead Developer:** Priyanshu Gupta ([@guptapriyanshu0101](mailto:guptapriyanshu0101@gmail.com))
- **Cohort:** First-Year Information Technology Engineering
- **Project Purpose:** Campus Knowledge Exchange & Peer Academic Collaboration
