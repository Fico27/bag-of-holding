# Bag of Holding 

A stripped-down personal file storage app inspired by Google Drive

**Bag of Holding** lets authenticated users upload files, organize them into folders, view file details, download files, and (extra credit!) generate time-limited share links for folders that anyone can access without logging in.


## Features

- **User Authentication** — Secure session-based login/signup with Passport.js + Prisma session store
- **File Upload** — Upload files directly to cloud storage (Cloudinary / Supabase) with Multer handling
- **Folder Management** — Full CRUD for folders (create, read, update, delete)
- **File Organization** — Upload files into specific folders
- **File Details Page** — View filename, size, upload date + direct download button
- **File Validation** — Restricts file types and maximum size (customizable)
- **Folder Sharing** — Generate expiring public share links for folders (and all contents) — e.g. `/share/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: Prisma ORM (PostgreSQL recommended)
- **Authentication**: Passport.js (local strategy) + connect-pg-simple (Prisma-compatible session store)
- **File Handling**: Multer (local temp storage) + Supabase Storage
- **Frontend**: EJS templates 
- **Other**: bcrypt for passwords, dotenv, etc.

## Live Demo → (https://bag-of-holding-production.up.railway.app/) 

