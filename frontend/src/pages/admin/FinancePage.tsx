export default function FinancePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="bg-[#f8f9fa] dark:bg-[#191c1d] sticky top-0 z-50 flex justify-between items-center w-full px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#1A73E8] dark:text-[#4874cf]">school</span>
          <h1 className="font-['Manrope'] font-bold text-lg tracking-tight text-[#191c1d] dark:text-white">Editorial Intelligence</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-[#414754] dark:text-[#c1c6d6] font-['Inter'] font-medium text-sm hover:bg-[#e7e8e9] dark:hover:bg-[#3e4243] transition-colors px-3 py-1 rounded" href="#">Dashboard</a>
          <a className="text-[#414754] dark:text-[#c1c6d6] font-['Inter'] font-medium text-sm hover:bg-[#e7e8e9] dark:hover:bg-[#3e4243] transition-colors px-3 py-1 rounded" href="#">Modules</a>
          <a className="text-[#414754] dark:text-[#c1c6d6] font-['Inter'] font-medium text-sm hover:bg-[#e7e8e9] dark:hover:bg-[#3e4243] transition-colors px-3 py-1 rounded" href="#">Schedule</a>
          <a className="text-[#1A73E8] font-bold font-['Inter'] text-sm px-3 py-1 rounded" href="#">Billing</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-[#e7e8e9] dark:hover:bg-[#3e4243] rounded-full transition-colors active:scale-90">
            <span className="material-symbols-outlined text-[#414754] dark:text-[#c1c6d6]">search</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-container overflow-hidden">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOBY7DOoV5h5PLYamDb9twE6ZrRVov6SWimDyMIMCRrczZR2QC6M0mRpRah63RBZ8C4Lg-WfwCIvj3W4FNJKRwqd4WzObpR-ywUQD_UfPK0RVxCzamiQjI1UZcM0hbNP4L85acK2nLfxE1M9yX8nMiHZMSM6te62rpzqjkK5C9D0aaryXLCmH5NMFLP0-WRIy0qayCugweVo6zYFlGtFh7434eURt-2xiy17Mpo_Os9cWkDRlm-gx9e7BcHDSCOtOa-FzugsnFuiOX"
            />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-10 pb-32">
        {/* Dashboard Header */}
        <section className="mb-12">
          <p className="font-['Inter'] text-[0.75rem] font-bold uppercase tracking-widest text-on-surface-variant mb-2">FINANCIAL OVERVIEW</p>
          <h2 className="font-['Manrope'] text-4xl font-extrabold text-on-surface tracking-tight">Institutional Billing</h2>
        </section>

        {/* Metrics Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
          {/* Total Revenue Card */}
          <div className="md:col-span-2 lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 bg-secondary-container rounded-lg">
                  <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                </span>
                <span className="text-tertiary font-bold flex items-center gap-1 text-sm">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +12.4%
                </span>
              </div>
              <p className="font-['Inter'] text-sm font-medium text-on-surface-variant">Total Annual Revenue</p>
              <h3 className="font-['Manrope'] text-5xl font-black text-on-surface mt-2">$2,840,500</h3>
            </div>
            <div className="mt-6 flex gap-2">
              <span className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                <span className="block h-full bg-primary w-[75%]"></span>
              </span>
            </div>
          </div>

          {/* Collection Rate */}
          <div className="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between">
            <div>
              <p className="font-['Inter'] text-sm font-medium text-on-surface-variant mb-1">Collection Rate</p>
              <h3 className="font-['Manrope'] text-3xl font-bold text-on-surface">94.2%</h3>
            </div>
            <div className="relative pt-4 h-24">
              <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1 h-full">
                <div className="bg-primary/20 w-full h-[40%] rounded-t-sm"></div>
                <div className="bg-primary/20 w-full h-[60%] rounded-t-sm"></div>
                <div className="bg-primary/20 w-full h-[55%] rounded-t-sm"></div>
                <div className="bg-primary w-full h-[94%] rounded-t-sm"></div>
              </div>
            </div>
          </div>

          {/* Outstanding Balance */}
          <div className="bg-error-container p-8 rounded-xl flex flex-col justify-between">
            <div>
              <p className="font-['Inter'] text-sm font-medium text-on-error-container mb-1">Outstanding</p>
              <h3 className="font-['Manrope'] text-3xl font-bold text-error">$164,200</h3>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
              <p className="text-[10px] uppercase tracking-tighter font-bold text-on-error-container">14 Urgent Accounts</p>
            </div>
          </div>
        </div>

        {/* Controls & Actions Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="w-full md:w-96 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-lg focus:ring-2 focus:ring-primary/20 font-['Inter'] text-sm placeholder:text-outline-variant"
              placeholder="Search accounts, students, or IDs..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface font-semibold text-sm rounded-lg">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filters
            </button>
            <button className="flex-1 md:flex-none bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/10">
              <span className="material-symbols-outlined text-sm">add</span>
              Create Invoice
            </button>
          </div>
        </div>

        {/* Student Accounts Table */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-['Inter']">
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Student / Account</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Billing Cycle</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Amount Due</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {/* Row 1 */}
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary font-['Manrope']">JS</div>
                    <div>
                      <p className="font-semibold text-on-surface text-sm">Julian Sterling</p>
                      <p className="text-xs text-on-surface-variant">ID: #SCH-88219</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-tertiary-container/10 text-tertiary text-[10px] font-bold uppercase tracking-tighter">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm text-on-surface">Fall 2023 Monthly</p>
                </td>
                <td className="px-6 py-5 font-['Manrope'] font-bold text-on-surface">$1,250.00</td>
                <td className="px-6 py-5">
                  <button className="text-primary hover:text-primary-container">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary font-['Manrope']">EM</div>
                    <div>
                      <p className="font-semibold text-on-surface text-sm">Elena Moretti</p>
                      <p className="text-xs text-on-surface-variant">ID: #SCH-11045</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-error-container text-error text-[10px] font-bold uppercase tracking-tighter">
                    Overdue
                  </span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm text-on-surface">Annual Lump Sum</p>
                </td>
                <td className="px-6 py-5 font-['Manrope'] font-bold text-error">$12,400.00</td>
                <td className="px-6 py-5">
                  <button className="text-primary hover:text-primary-container">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary font-['Manrope']">AK</div>
                    <div>
                      <p className="font-semibold text-on-surface text-sm">Arjun Kapoor</p>
                      <p className="text-xs text-on-surface-variant">ID: #SCH-99402</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-tighter">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm text-on-surface">Scholarship Adj.</p>
                </td>
                <td className="px-6 py-5 font-['Manrope'] font-bold text-on-surface">$450.00</td>
                <td className="px-6 py-5">
                  <button className="text-primary hover:text-primary-container">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          {/* Pagination footer */}
          <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center">
            <p className="text-xs text-on-surface-variant">Showing 3 of 1,240 student accounts</p>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-surface-container-high rounded disabled:opacity-30" disabled>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="p-1 hover:bg-surface-container-high rounded">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden bg-[#ffffff] dark:bg-[#1f2122] fixed bottom-0 w-full z-50 rounded-t-2xl shadow-[0_-4px_32px_rgba(25,28,29,0.04)] flex justify-around items-center h-20 px-4">
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1 hover:bg-[#f3f4f5] dark:hover:bg-[#2a2d2e] transition-all duration-200">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Dashboard</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1 hover:bg-[#f3f4f5] dark:hover:bg-[#2a2d2e] transition-all duration-200">
          <span className="material-symbols-outlined">extension</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Modules</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1 hover:bg-[#f3f4f5] dark:hover:bg-[#2a2d2e] transition-all duration-200">
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Schedule</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#cfe6f2] dark:bg-[#2b5ab5]/20 text-[#2b5ab5] dark:text-[#4874cf] rounded-xl px-4 py-1 transition-all duration-200">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Billing</span>
        </div>
      </nav>
    </div>
  );
}
