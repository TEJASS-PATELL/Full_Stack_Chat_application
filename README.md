# 💬 ChatLock 🔒  

**ChatLock** is a modern **real-time chat application** powered by the **MERN stack** with **PostgreSQL** as the database.  
What makes it stand out is the **Chat Lock feature**, giving you an extra layer of privacy for selected conversations.  

Designed to be **secure, fast, and minimal**, ChatLock focuses on what truly matters —  
smooth messaging without any unwanted clutter. 🚀  

## ✨ Key Features

- 🔐 **Secure Authentication** – Passwords encrypted with bcrypt.js  
- ⚡ **Real-Time Messaging** – Instant delivery with Socket.io  
- 💾 **Persistent Chats** – Messages stored in PostgreSQL (never lost)  
- 👀 **Online/Offline Status** – See who’s active  
- ⌨️ **Typing Indicator** – Know when someone is typing  
- ⏳ **Last Seen** – Shows when a user was last online  
- 🔒 **Lock Your Chat** – Secure private chats with a double-click  
- 😀 **Emoji Support** – Express yourself better  
- 🖼️ **Image Sharing** – Send and receive images  
- 🖼️ **Profile Picture** – Set your own avatar  
- 🗑️ **Delete Account** – Full control over your data  
- 📱 **Responsive Design** – Works across devices  

---

## 🛠️ Tech Stack

**Frontend:** React.js, CSS, Hooks
**Backend:** Node.js, Express.js  
**Database:** PostgreSQL  
**Real-time:** Socket.io  
**Authentication:** JWT + Cookies, bcrypt.js  
**Cloud Storage:** Cloudinary  
**Security:** Rate Limiter, Secure Password Hashing  
**Hosting:**  
- Frontend → Vercel  
- Backend + DB → Render  

---

## 🌐 Live Demo  

🔗 **Live App:** [ChatLock](https://full-stack-chat-application-seven.vercel.app)  
💻 **Source Code:** [GitHub Repository](https://github.com/TEJASS-PATELL/Full_Stack_Chat_application.git)  

---


## 🚀 Installation Guide

Clone the repo and install dependencies:

```bash
# Clone repository
git clone https://github.com/TEJASS-PATELL/Full_Stack_Chat_application.git

# Navigate into project
cd Full_Stack_Chat_application

# Install server dependencies
cd Backend
npm install
npm run dev

# Install client dependencies
cd Frontend
npm install
npm run dev
