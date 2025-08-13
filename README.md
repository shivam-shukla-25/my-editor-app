# Image Text Composer

A web-based tool to create, edit, and export images with custom text layers — built using **Next.js**, **React**, and **Konva**.

## 🚀 What You Do in This App
- Upload or select a background image.
- Add text layers with custom styling.
- Move and resize text elements directly on the canvas.
- Export the final composition as a high-resolution PNG image.
- State is saved locally, so your progress is not lost on refresh.

---

## 📂 Project Folder Structure

```
image-text-composer/
│
├── public/               # Static assets like images, icons, etc.
├── src/
│   ├── components/       # React components (CanvasStage, TextNode, etc.)
│   ├── hooks/            # Custom hooks (useEditorState)
│   ├── pages/            # Next.js pages (index.tsx, _app.tsx)
│   ├── styles/           # Global and Tailwind styles
│
├── .gitignore            # Git ignored files
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Documentation
```

---

## 📦 Tech Stack

| Technology       | Purpose |
|------------------|---------|
| **Next.js**      | React framework for SSR & static site generation. |
| **React**        | Component-based UI development. |
| **Konva + react-konva** | Canvas rendering for high-performance graphics editing. |
| **use-image**    | React hook for image loading. |
| **uuid**         | Generate unique IDs for text layers. |
| **Tailwind CSS** | Utility-first CSS styling. |
| **TypeScript**   | Static typing for maintainable code. |

---

## ⚙️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/image-text-composer.git
cd image-text-composer

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit: **http://localhost:3000**

---

## 📦 Build & Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```
 deployed on **Vercel**,  https://my-editor-app-4s9w.vercel.app/

---

## ⚖️ Design Choices
- **Next.js** for easy SSR/SSG and deployment on Vercel.
- **react-konva** for smooth canvas-based text/image rendering.
- **Local storage** for persistence without a backend.
- **Tailwind CSS** for faster UI development.
