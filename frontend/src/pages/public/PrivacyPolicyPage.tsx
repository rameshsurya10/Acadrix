import { Link } from 'react-router-dom'

const EFFECTIVE_DATE = 'April 1, 2026'
const CONTACT_EMAIL = 'ryxtechie@gmail.com'

export default function PrivacyPolicyPage() {
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

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
        <div className="mb-10">
          <h1 className="font-headline font-bold text-3xl sm:text-4xl text-on-surface mb-3">Privacy Policy</h1>
          <p className="text-sm text-on-surface-variant">Effective Date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-on-surface-variant text-[15px] leading-relaxed">
          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">1. Introduction</h2>
            <p>
              Acadrix ("we," "our," or "the Platform") is an academic management platform designed for educational institutions. We are committed to protecting the privacy and security of personal information collected from students, teachers, administrators, parents, and other users of our platform. This Privacy Policy explains how we collect, use, store, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">2. Information We Collect</h2>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">2.1 Account Information</h3>
            <p>When your institution registers you on Acadrix, we collect:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Full name, email address, and phone number</li>
              <li>Institutional role (student, teacher, administrator, principal, or parent)</li>
              <li>Profile photo (optional)</li>
              <li>Institutional ID or enrollment number</li>
            </ul>

            <h3 className="font-semibold text-on-surface mt-4 mb-2">2.2 Academic Data</h3>
            <p>Through normal use of the platform, we process:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Grades, test scores, and assessment results</li>
              <li>Attendance records and class schedules</li>
              <li>Course enrollments and academic progress</li>
              <li>Teacher evaluations and gradebook entries</li>
            </ul>

            <h3 className="font-semibold text-on-surface mt-4 mb-2">2.3 Financial Data</h3>
            <p>For tuition and fee management:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Payment transaction records and fee schedules</li>
              <li>Scholarship and financial aid information</li>
            </ul>
            <p className="mt-2 text-sm italic">Note: We do not store credit card numbers or bank account details. All payment processing is handled by certified third-party payment processors.</p>

            <h3 className="font-semibold text-on-surface mt-4 mb-2">2.4 Usage Data</h3>
            <p>We automatically collect:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Login timestamps and session duration</li>
              <li>Device type, browser version, and operating system</li>
              <li>IP address (for security and fraud prevention)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Platform Operations:</strong> To provide academic management services including grade tracking, attendance, assessments, and communication</li>
              <li><strong>Authentication:</strong> To verify your identity and manage secure access to your account</li>
              <li><strong>Communication:</strong> To send institutional notifications, academic updates, and system alerts</li>
              <li><strong>Analytics:</strong> To generate academic performance insights and institutional reports</li>
              <li><strong>Security:</strong> To detect and prevent unauthorized access, fraud, and abuse</li>
              <li><strong>Improvement:</strong> To enhance platform features and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal information. We share data only with:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li><strong>Your Institution:</strong> Administrators and authorized faculty access academic and operational data as part of their institutional role</li>
              <li><strong>Parents/Guardians:</strong> May access their child's academic records, attendance, and financial information through authorized parent accounts</li>
              <li><strong>Service Providers:</strong> Trusted third parties who assist with hosting, email delivery, and payment processing, bound by data protection agreements</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect the safety of our users</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Role-based access control ensuring users only access data relevant to their role</li>
              <li>Secure password hashing and JWT-based authentication</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Database backups and disaster recovery procedures</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">6. Data Retention</h2>
            <p>
              We retain your personal data for as long as your institution maintains an active account with Acadrix. Academic records may be retained for the duration required by educational regulations and institutional policies. Upon account deactivation, personal data is anonymized or deleted within 90 days, unless retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">7. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your data (subject to institutional and legal obligations)</li>
              <li>Object to certain types of data processing</li>
              <li>Data portability — receive your data in a structured, machine-readable format</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact your institution's administrator or reach us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.</p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">8. Children's Privacy</h2>
            <p>
              Acadrix may process data of students under 18 as part of institutional academic management. This data is managed by the educational institution, which acts as the data controller. Parental consent is obtained through the institution's enrollment process. We do not knowingly collect personal information from children outside of an institutional context.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">9. Third-Party Services</h2>
            <p>
              Acadrix integrates with Google OAuth for authentication. When you sign in with Google, Google's Privacy Policy governs the data collected during authentication. We only receive your name, email address, and profile picture from Google — no other Google data is accessed.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy to reflect changes in our practices or legal requirements. Material changes will be communicated through the platform and to institutional administrators. Continued use of Acadrix after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">11. Contact Us</h2>
            <p>
              For privacy-related questions or concerns, contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/15 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-on-surface-variant/60">
          <span>&copy; 2026 Acadrix. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/help" className="hover:text-primary transition-colors">Help Center</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
