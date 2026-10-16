# QUMI Technologies Admin Portal 🚀

Welcome to the **QUMI Technologies Admin Portal**, a bespoke management dashboard built to seamlessly control the QUMI ecosystem. This highly responsive, secure, and modern admin panel allows you to manage contact messages, job postings, candidate applications, and core company settings all from one unified interface.

## 🌟 Key Features

*   **📱 Master-Detail Mobile UI:** The entire dashboard features a premium, responsive architecture. Lists and details intelligently split on desktop and slide beautifully on mobile, ensuring a flawless experience on any device.
*   **🤖 AI-Powered Workflow (Mistral AI):** Draft hyper-professional email replies and instantly rewrite job descriptions into engaging copy with built-in one-click AI enhancements.
*   **📩 Seamless Communications:** Monitor and respond to all incoming enquiries straight from the website's contact form.
*   **💼 Job Board Management:** Create, edit, and instantly publish job openings to the live careers page.
*   **📄 Applicant Tracking System:** View incoming applications, candidate details, and download resumes securely.
*   **⚙️ Global Settings Control:** Manage company contact details and social links dynamically across the entire QUMI ecosystem.

## 🛠️ Technology Stack

*   **Framework:** [Next.js (App Router)](https://nextjs.org) - React framework for optimal performance and secure server actions.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com) - For rapid, utility-first styling with beautiful custom tokens.
*   **Database & Storage:** [Supabase](https://supabase.com) - Providing PostgreSQL database, secure Row Level Security (RLS) policies, and storage buckets for applicant resumes.
*   **AI Integration:** [Mistral AI](https://mistral.ai) - Powerful open-weight models for text enhancement.
*   **Icons:** [Lucide React](https://lucide.dev) - Clean, beautiful, and consistent iconography.

## 🚀 Getting Started

### Prerequisites

You need a `.env.local` file at the root of the project containing your secure access keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mistral AI (For Text Enhancement)
MISTRAL_API_KEY=your_mistral_api_key

# SMTP Configuration (For Email Replies)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
COMPANY_NAME=QUMI Technologies

# Cloudinary Configuration (For Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
# Alternatively: CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ma-nees/QUMI-TECHNOLOGIES-ADMIN.git
   cd QUMI-TECHNOLOGIES-ADMIN
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to access the admin portal.

## 📦 Deployment

This project is fully optimized for deployment on platforms like [Vercel](https://vercel.com).
Simply connect this GitHub repository to a new Vercel project, add your Environment Variables in the project settings, and Vercel will handle the rest!
