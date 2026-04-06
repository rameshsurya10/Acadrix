import { Link } from 'react-router-dom'

const EFFECTIVE_DATE = 'April 1, 2026'
const CONTACT_EMAIL = 'ryxtechie@gmail.com'

export default function TermsOfServicePage() {
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
          <h1 className="font-headline font-bold text-3xl sm:text-4xl text-on-surface mb-3">Terms of Service</h1>
          <p className="text-sm text-on-surface-variant">Effective Date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-on-surface-variant text-[15px] leading-relaxed">
          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Acadrix ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform. Your institution's agreement with Acadrix governs the institutional relationship; these terms govern your individual use.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">2. Platform Description</h2>
            <p>
              Acadrix is an academic management platform that provides educational institutions with tools for student information management, grade tracking, attendance monitoring, assessment creation, financial management, and institutional communication. Access is provided through your educational institution.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">3. User Accounts</h2>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">3.1 Account Creation</h3>
            <p>
              Accounts are created by your institution's administrator. You will receive login credentials through your institution. You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h3 className="font-semibold text-on-surface mt-4 mb-2">3.2 Account Security</h3>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>You must not share your login credentials with anyone</li>
              <li>You must notify your institution immediately if you suspect unauthorized access</li>
              <li>You are responsible for all activity that occurs under your account</li>
              <li>Use a strong, unique password and enable available security features</li>
            </ul>

            <h3 className="font-semibold text-on-surface mt-4 mb-2">3.3 Account Types</h3>
            <p>
              Access levels are determined by your institutional role: Administrator, Principal, Teacher, Student, or Parent. Each role has specific permissions and access to relevant features and data as configured by your institution.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">4. Acceptable Use</h2>
            <p>When using Acadrix, you agree to:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Use the Platform only for legitimate academic and institutional purposes</li>
              <li>Provide accurate information and maintain the integrity of academic records</li>
              <li>Respect the privacy of other users including students, staff, and parents</li>
              <li>Comply with your institution's policies and applicable educational regulations</li>
              <li>Not attempt to access accounts, data, or features beyond your authorized role</li>
            </ul>

            <h3 className="font-semibold text-on-surface mt-4 mb-2">4.1 Prohibited Activities</h3>
            <p>You must not:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Tamper with, modify, or falsify academic records, grades, or attendance data</li>
              <li>Use the platform to harass, bully, or intimidate other users</li>
              <li>Share confidential student or institutional data outside the platform</li>
              <li>Attempt to reverse-engineer, decompile, or exploit the platform's code or infrastructure</li>
              <li>Use automated scripts, bots, or scrapers to access platform data</li>
              <li>Upload malicious files, viruses, or harmful content</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">5. Academic Integrity</h2>
            <p>
              Acadrix supports academic integrity by providing secure assessment tools, AI-powered question generation, and grade management. Users are expected to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Not share assessment content, questions, or answers with unauthorized persons</li>
              <li>Not use the platform to facilitate academic dishonesty</li>
              <li>Report any suspected breaches of academic integrity to their institution</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">6. Intellectual Property</h2>
            <p>
              The Acadrix platform, including its design, code, features, and branding, is the intellectual property of Acadrix. Content created by users (such as questions, assessments, and course materials) remains the intellectual property of the institution or the creating user, subject to the institution's policies.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">7. Service Availability</h2>
            <p>
              We strive to maintain high availability but do not guarantee uninterrupted access. Scheduled maintenance will be communicated in advance when possible. We are not liable for data loss, academic disruptions, or damages resulting from service outages, whether planned or unplanned.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Acadrix shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability for any claim shall not exceed the amount paid by your institution for platform access during the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">9. Account Termination</h2>
            <p>
              Your institution may deactivate your account at any time based on their policies (such as graduation, transfer, or employment changes). We may suspend or terminate accounts that violate these Terms. Upon termination, your access to the platform and its data will cease, subject to data retention obligations outlined in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">10. Changes to Terms</h2>
            <p>
              We may modify these Terms of Service at any time. Material changes will be communicated through the platform and to institutional administrators at least 30 days before taking effect. Continued use of the platform after changes become effective constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws applicable in the jurisdiction where your institution operates, without regard to conflict of law provisions. Any disputes shall be resolved through the dispute resolution mechanism agreed upon between Acadrix and your institution.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">12. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
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
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/help" className="hover:text-primary transition-colors">Help Center</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
