export default function StudentTuitionPage() {
  return (
    <div className="text-on-surface">
      {/* TopAppBar */}
      <header className="bg-[#f8f9fa] dark:bg-[#191c1d] top-0 sticky z-50">
        <div className="flex justify-between items-center w-full px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#1A73E8] dark:text-[#4874cf] text-2xl">school</span>
            <h1 className="font-['Manrope'] font-bold text-lg tracking-tight text-on-surface">Editorial Intelligence</h1>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8">
              <a className="text-[#414754] dark:text-[#c1c6d6] font-['Inter'] font-medium text-sm hover:text-[#1A73E8] transition-colors" href="#">Dashboard</a>
              <a className="text-[#414754] dark:text-[#c1c6d6] font-['Inter'] font-medium text-sm hover:text-[#1A73E8] transition-colors" href="#">Modules</a>
              <a className="text-[#414754] dark:text-[#c1c6d6] font-['Inter'] font-medium text-sm hover:text-[#1A73E8] transition-colors" href="#">Schedule</a>
              <a className="text-[#1A73E8] font-bold font-['Inter'] text-sm" href="#">Billing</a>
            </nav>
            <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden">
              <img alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiIhPlRRdrx8tc6MJy5dMqicZH5FUEO8PXzb570gBBIzNnoxKh_ADk9h7ptb7lB6Q8kETvBvd8M1KjvPhKtxORGfepkLm-feG-eGPo_EgK1nqW7nfE_SxY33ns_tgxhMkl5L5w9-bIxejFO5YGRZFyF_WEeYSta-FQ-bY791084kbTy-mtUVxrg4nZ1uAKMUNtYigfuOT4MXXy_Lh2cbA9WonlcOsnhy1tTZ2diQIhkBS3QjFeNAUWcy5FslFWbHHo_l3QD_rJusxo" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 pb-32">
        {/* Editorial Header Section */}
        <div className="mb-12">
          <span className="font-label text-[0.75rem] font-medium uppercase tracking-widest text-on-surface-variant mb-2 block">Account Statement</span>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">Tuition &amp; Fees</h2>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed">Review your curated financial summary for the Fall 2024 Academic Period. Manage mandatory fees, outstanding balances, and historical records in one place.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Primary Billing (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Semester Summary Card */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary to-primary-container opacity-5 rounded-bl-full"></div>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Fall 2024 Balance</h3>
                  <p className="text-on-surface-variant text-sm mt-1">Due Date: October 15, 2024</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-headline font-extrabold text-primary">$12,450.00</span>
                  <div className="mt-2 flex items-center justify-end text-error gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    <span className="text-xs font-medium uppercase tracking-wider">Payment Pending</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-outline-variant/20">
                  <div>
                    <p className="font-medium text-on-surface">Undergraduate Tuition</p>
                    <p className="text-xs text-on-surface-variant">15 Credit Hours @ $650/hr</p>
                  </div>
                  <span className="font-headline font-bold">$9,750.00</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-outline-variant/20">
                  <div>
                    <p className="font-medium text-on-surface">Mandatory Technology Fee</p>
                    <p className="text-xs text-on-surface-variant">Annual Infrastructure Access</p>
                  </div>
                  <span className="font-headline font-bold">$1,200.00</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-outline-variant/20">
                  <div>
                    <p className="font-medium text-on-surface">Student Activity Fee</p>
                    <p className="text-xs text-on-surface-variant">Campus Services &amp; Events</p>
                  </div>
                  <span className="font-headline font-bold">$850.00</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <div>
                    <p className="font-medium text-on-surface">Health Insurance Waiver</p>
                    <p className="text-xs text-tertiary">Verified External Provider</p>
                  </div>
                  <span className="font-headline font-bold text-tertiary">-$350.00</span>
                </div>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
                  Pay Current Balance
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button className="bg-secondary-container text-on-secondary-container px-8 py-3 rounded-lg font-bold text-sm hover:bg-surface-container-high transition-colors">
                  Download PDF Invoice
                </button>
              </div>
            </section>

            {/* Payment History */}
            <section className="space-y-6">
              <h3 className="font-headline text-xl font-bold px-2">Payment History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-6 rounded-lg group hover:bg-surface-container-high transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-tertiary/10 rounded-lg text-tertiary">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <span className="font-headline font-bold text-on-surface">$4,200.00</span>
                  </div>
                  <p className="font-bold text-sm text-on-surface">Summer Session 2024</p>
                  <p className="text-xs text-on-surface-variant mt-1">Paid via Bank Transfer • June 12</p>
                </div>
                <div className="bg-surface-container-low p-6 rounded-lg group hover:bg-surface-container-high transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-tertiary/10 rounded-lg text-tertiary">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <span className="font-headline font-bold text-on-surface">$11,800.00</span>
                  </div>
                  <p className="font-bold text-sm text-on-surface">Spring Semester 2024</p>
                  <p className="text-xs text-on-surface-variant mt-1">Paid via Credit Card • Jan 05</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Contextual Actions & Alerts */}
          <aside className="space-y-8">
            {/* Financial Aid Quick Action */}
            <div className="bg-surface-container-highest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <h4 className="font-headline text-lg font-bold text-on-surface">Financial Support</h4>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">Seeking additional funding or a payment extension? Our editorial team reviews aid requests weekly.</p>
              </div>
              <button className="w-full bg-surface-container-lowest text-primary border border-primary/20 py-3 rounded-lg font-bold text-sm hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2">
                Request Financial Aid
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>

            {/* Financial Milestones */}
            <div className="bg-surface-container-low rounded-xl p-6">
              <h4 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">Financial Milestones</h4>
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container-lowest border-4 border-primary z-10"></div>
                  <p className="text-xs font-bold text-primary">OCT 15</p>
                  <p className="text-sm font-medium text-on-surface">Final Tuition Deadline</p>
                  <p className="text-xs text-on-surface-variant">Late fee of $150 applies after 5PM</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container-lowest border-4 border-outline-variant z-10"></div>
                  <p className="text-xs font-bold text-on-surface-variant">NOV 01</p>
                  <p className="text-sm font-medium text-on-surface">Housing Deposit Due</p>
                  <p className="text-xs text-on-surface-variant">Spring 2025 residency selection</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container-lowest border-4 border-outline-variant z-10"></div>
                  <p className="text-xs font-bold text-on-surface-variant">DEC 10</p>
                  <p className="text-sm font-medium text-on-surface">FAFSA Renewal Window</p>
                  <p className="text-xs text-on-surface-variant">Priority filing for next year</p>
                </div>
              </div>
            </div>

            {/* Health Alert Pulse */}
            <div className="bg-error-container/20 rounded-xl p-6 flex items-start gap-4">
              <div className="relative flex h-3 w-3 mt-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
              </div>
              <div>
                <p className="text-sm font-bold text-error">Missing Documentation</p>
                <p className="text-xs text-on-surface-variant mt-1">Your residency re-verification is outstanding. Complete this to avoid out-of-state surcharges.</p>
                <a className="text-xs font-bold text-error mt-3 inline-block hover:underline" href="#">Update Now</a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* BottomNavBar (Mobile only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-2xl bg-[#ffffff] dark:bg-[#1f2122] shadow-[0_-4px_32px_rgba(25,28,29,0.04)] h-20 px-4 flex justify-around items-center">
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1 hover:bg-[#f3f4f5] transition-all">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Dashboard</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1 hover:bg-[#f3f4f5] transition-all">
          <span className="material-symbols-outlined">extension</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Modules</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1 hover:bg-[#f3f4f5] transition-all">
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Schedule</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#cfe6f2] dark:bg-[#2b5ab5]/20 text-[#2b5ab5] dark:text-[#4874cf] rounded-xl px-4 py-1 transition-all">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Billing</span>
        </div>
      </nav>
    </div>
  );
}
