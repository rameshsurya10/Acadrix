import { useState } from 'react'
import { Link } from 'react-router-dom'

const CONTACT_EMAIL = 'ryxtechie@gmail.com'

interface FAQItem {
  question: string
  answer: string
}

const FAQ_SECTIONS: { title: string; icon: string; items: FAQItem[] }[] = [
  {
    title: 'Getting Started',
    icon: 'rocket_launch',
    items: [
      {
        question: 'How do I get my Acadrix login credentials?',
        answer: 'Your login credentials are created by your institution\'s administrator. Contact your school or college administration office to receive your email and temporary password. Upon first login, you will be prompted to set a new password.',
      },
      {
        question: 'Can I sign in with my Google account?',
        answer: 'Yes, if your institutional email is a Google account (Gmail or Google Workspace), you can use the "Sign in with Google" option on the login page. Your Google email must match the email registered in Acadrix by your institution.',
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click "Forgot Password?" on the login page and enter your registered email address. You will receive a password reset link. If you don\'t receive the email, check your spam folder or contact your institution\'s administrator.',
      },
      {
        question: 'What devices and browsers are supported?',
        answer: 'Acadrix works on any modern web browser including Chrome, Firefox, Safari, and Edge. The platform is fully responsive and works on desktops, laptops, tablets, and smartphones.',
      },
    ],
  },
  {
    title: 'For Students',
    icon: 'school',
    items: [
      {
        question: 'How do I view my grades and test results?',
        answer: 'Navigate to the Dashboard for an overview of your recent grades, or go to Test Results for detailed score breakdowns, subject-wise performance, and historical trends.',
      },
      {
        question: 'How do I check my attendance record?',
        answer: 'Your attendance summary is displayed on your Dashboard. For detailed attendance by date and subject, your teacher or administrator can provide individual reports.',
      },
      {
        question: 'How do I view my tuition and fee details?',
        answer: 'Go to the Tuition section to see your fee structure, payment history, outstanding balances, and upcoming due dates.',
      },
      {
        question: 'How do I update my profile information?',
        answer: 'Go to your Profile page to update your phone number, profile photo, and other editable fields. Some fields like name and enrollment number can only be changed by your institution\'s administrator.',
      },
    ],
  },
  {
    title: 'For Teachers',
    icon: 'person',
    items: [
      {
        question: 'How do I enter grades in the gradebook?',
        answer: 'Navigate to Gradebook, select the class and subject, then enter grades for individual students. You can save as draft or publish grades. Published grades become visible to students and parents.',
      },
      {
        question: 'How do I create tests and assessments?',
        answer: 'Go to Test Creation to build new assessments. You can create questions manually or use the AI-powered question generator to auto-generate questions based on topic, difficulty level, and question type.',
      },
      {
        question: 'How does the AI question generator work?',
        answer: 'The AI question generator creates questions based on the topic, subject, difficulty level, and question type you specify. It generates multiple-choice, short answer, and essay questions. You can review, edit, and approve generated questions before adding them to assessments.',
      },
    ],
  },
  {
    title: 'For Administrators',
    icon: 'admin_panel_settings',
    items: [
      {
        question: 'How do I add new students or staff?',
        answer: 'Go to the Students or Faculty Directory section and use the "Add" function. Enter the required details including name, email, role, and department. The system will send login credentials to the new user\'s email.',
      },
      {
        question: 'How do I manage admissions?',
        answer: 'Navigate to Admissions to view, process, and track admission applications. You can update application status, assign enrollment numbers, and create student accounts for accepted applicants.',
      },
      {
        question: 'How do I view financial reports?',
        answer: 'The Finance section provides an overview of fee collection, outstanding balances, and payment trends. You can filter by date range, class, or individual student.',
      },
    ],
  },
  {
    title: 'Account & Security',
    icon: 'shield',
    items: [
      {
        question: 'How do I change my password?',
        answer: 'Go to your Profile page and select "Change Password." Enter your current password, then your new password. Use a strong password with at least 8 characters including uppercase, lowercase, numbers, and symbols.',
      },
      {
        question: 'Why was my account locked?',
        answer: 'Accounts are temporarily locked after multiple failed login attempts to protect against unauthorized access. Wait 15 minutes and try again, or contact your institution\'s administrator to unlock your account.',
      },
      {
        question: 'Is my data secure on Acadrix?',
        answer: 'Yes. Acadrix uses industry-standard encryption (TLS/SSL), role-based access control, and secure authentication. Your data is stored in encrypted databases with regular backups. Read our Privacy Policy for full details.',
      },
    ],
  },
]

export default function HelpCenterPage() {
  const [expandedSection, setExpandedSection] = useState<number>(0)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  function toggleItem(key: string) {
    setExpandedItem(prev => prev === key ? null : key)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="border-b border-outline-variant/15 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <Link to="/login" className="flex items-center no-underline">
            <img src="/logo_name.png" alt="Acadrix" className="h-9 w-auto" />
          </Link>
          <Link to="/login" className="text-sm font-semibold text-primary hover:underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-outline-variant/15">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14 text-center">
          <h1 className="font-headline font-bold text-3xl sm:text-4xl text-on-surface mb-3">Help Center</h1>
          <p className="text-on-surface-variant text-base max-w-lg mx-auto">
            Find answers to common questions about using Acadrix. Can't find what you need?{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">Contact support</a>.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-12 w-full">
        {/* Section tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FAQ_SECTIONS.map((section, i) => (
            <button
              key={section.title}
              onClick={() => { setExpandedSection(i); setExpandedItem(null) }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                expandedSection === i
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                  : 'bg-white text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{section.icon}</span>
              {section.title}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        <div className="space-y-2">
          {FAQ_SECTIONS[expandedSection].items.map((item, i) => {
            const key = `${expandedSection}-${i}`
            const isOpen = expandedItem === key
            return (
              <div
                key={key}
                className="bg-white rounded-xl border border-outline-variant/15 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(key)}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left hover:bg-surface-container-lowest transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-[15px] text-on-surface pr-4">{item.question}</span>
                  <span className={`material-symbols-outlined text-on-surface-variant text-xl flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 text-sm sm:text-[15px] text-on-surface-variant leading-relaxed border-t border-outline-variant/10 pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Contact card */}
        <div className="mt-12 bg-white rounded-xl border border-outline-variant/15 p-6 sm:p-8 text-center">
          <span className="material-symbols-outlined text-primary text-4xl mb-3 block">support_agent</span>
          <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Still need help?</h3>
          <p className="text-sm text-on-surface-variant mb-5 max-w-md mx-auto">
            If you couldn't find the answer you're looking for, reach out to our support team. We typically respond within 24 hours on business days.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Acadrix Support Request`}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15"
          >
            <span className="material-symbols-outlined text-lg">mail</span>
            Email Support
          </a>
          <p className="text-xs text-on-surface-variant/60 mt-3">{CONTACT_EMAIL}</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/15 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-on-surface-variant/60">
          <span>&copy; 2026 Acadrix. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
