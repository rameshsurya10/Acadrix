export default function FacultyDirectoryPage() {
  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 md:pb-0 md:pl-64">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 flex-col p-6 gap-4 bg-[#f3f4f5] dark:bg-slate-900 z-40">
        <div className="mb-8">
          <span className="font-manrope text-lg font-bold text-[#191c1d]">Editorial Intelligence</span>
        </div>
        <nav className="space-y-2">
          <a className="flex items-center gap-3 px-4 py-3 text-[#414754] dark:text-slate-400 hover:text-[#191c1d] hover:bg-[#e7e8e9] dark:hover:bg-slate-800 transition-all" href="#">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="font-manrope uppercase tracking-widest text-[10px] font-semibold">Gradebook</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[#414754] dark:text-slate-400 hover:text-[#191c1d] hover:bg-[#e7e8e9] dark:hover:bg-slate-800 transition-all" href="#">
            <span className="material-symbols-outlined">how_to_reg</span>
            <span className="font-manrope uppercase tracking-widest text-[10px] font-semibold">Admissions</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 text-[#2b5ab5] dark:text-[#4874cf] rounded-lg shadow-sm translate-x-1 duration-200" href="#">
            <span className="material-symbols-outlined">badge</span>
            <span className="font-manrope uppercase tracking-widest text-[10px] font-semibold">Faculty</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[#414754] dark:text-slate-400 hover:text-[#191c1d] hover:bg-[#e7e8e9] dark:hover:bg-slate-800 transition-all" href="#">
            <span className="material-symbols-outlined">group</span>
            <span className="font-manrope uppercase tracking-widest text-[10px] font-semibold">Students</span>
          </a>
        </nav>
      </aside>

      {/* Top App Bar */}
      <header className="flex justify-between items-center w-full px-8 py-4 bg-[#f8f9fa] dark:bg-slate-950 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high">
            <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLARFgUtSSuYqfM98HbcV4yvi0_iWnSzM15-13mrJLmisG8QzcsOZS5qJRORLHRMgwDzIhXZ7ktLWaDzVP85uFFsjlgtl_X8kgBWSHdaNDUhi6RlwbCi7EYeBc52h56i-33JrHXu3hdXSzzjgWaAzGRFiN8AeJshhoh7qmRGO9TJDpz_ITsZsrdh6tr0wfzpmhC5Y5vuj4IUbHIX5YMrEqhX73p5igGysFkABbSOB19aAC3_5ruZD-R9hrbEfiue93lp1CsScZouRU" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191c1d] dark:text-slate-100 font-headline">Scholar Metric</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#414754] dark:text-slate-400 hover:bg-[#e7e8e9] dark:hover:bg-slate-800 rounded-full transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-lg font-medium shadow-sm active:scale-95 duration-150">
            <span className="material-symbols-outlined text-sm">add</span>
            <span className="text-sm">Add New Staff</span>
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="max-w-7xl mx-auto px-6 py-8 md:px-12">
        {/* Editorial Header Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="font-label text-[0.75rem] uppercase tracking-[0.2em] text-on-surface-variant font-semibold mb-2">Academic Operations</p>
              <h2 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">Faculty &amp; Staff Registry</h2>
            </div>
            {/* Filters Glass Module */}
            <div className="bg-white/80 backdrop-blur-[20px] p-2 rounded-xl flex items-center gap-2 shadow-sm border border-outline-variant/10">
              <select className="bg-transparent border-none focus:ring-0 text-sm font-medium text-on-surface-variant cursor-pointer">
                <option>All Departments</option>
                <option>Physics</option>
                <option>Arts &amp; Design</option>
                <option>Mathematics</option>
              </select>
              <div className="w-px h-4 bg-outline-variant/30"></div>
              <select className="bg-transparent border-none focus:ring-0 text-sm font-medium text-on-surface-variant cursor-pointer">
                <option>Employment Status</option>
                <option>Full-time</option>
                <option>Part-time</option>
              </select>
            </div>
          </div>
        </section>

        {/* Faculty Bento Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          {/* Card 1: Featured Faculty (Asymmetric Balance) */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_32px_rgba(25,28,29,0.02)] transition-all">
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/3 relative h-64 md:h-auto">
                <img className="absolute inset-0 w-full h-full object-cover" alt="Dr. Eleanor Vance" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDe2AT-rd67yTEsVqziZqyVh4FE2FzdGBdJd8oZQZZcvLY5XAErEgUe_q6ztS3B5-14I5T7ZGppPDOVYpWK0NE5nsy4KmPeBADXJfzc0IteVIAx2afe2-4jwcFib3ozHLOeOhMXgTzbU_9oO6uhLiRrHx-w9uxC7tTzzORk41OEdCW-Dc_AogKsg6atqCuG4SuGlk6b3rf8-blI8Trjzx2TfSlV5ZVJs1c_Nvt_msFjVlgfrs-fauh9pAPm9GEf1-QtGkA3v3shuT67" />
                <div className="absolute top-4 left-4">
                  <span className="bg-tertiary text-on-tertiary text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Full-time</span>
                </div>
              </div>
              <div className="md:w-2/3 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold font-headline mb-1">Dr. Eleanor Vance</h3>
                      <p className="text-on-surface-variant font-medium text-sm">Head of Quantum Physics Department</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-tertiary-container font-bold">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span>4.9/5</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Performance Score</p>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6">Expert in non-linear optics and crystalline structures. Overseeing 14 active research projects for the 2024 academic cycle.</p>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-surface-container-low rounded-lg mb-6">
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-semibold mb-1">Monthly Salary</p>
                      <p className="text-lg font-bold text-primary font-headline">$6,850.00</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-semibold mb-1">Tenure</p>
                      <p className="text-lg font-bold text-on-surface font-headline">8.5 Years</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant text-xs font-bold rounded-lg transition-colors">Edit Profile</button>
                  <button className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant text-xs font-bold rounded-lg transition-colors">Performance Report</button>
                  <button className="px-4 py-2 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-lg transition-colors">Manage Payments</button>
                </div>
              </div>
            </div>
          </div>

          {/* Side Card: Quick Statistics */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl text-on-primary">
              <span className="material-symbols-outlined text-3xl mb-4">payments</span>
              <h4 className="text-sm font-semibold opacity-80 uppercase tracking-widest mb-1">Total Faculty Payroll</h4>
              <p className="text-3xl font-extrabold font-headline">$142,400.00</p>
              <p className="text-xs mt-2 opacity-70">Next disbursement scheduled for June 28th</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_32px_rgba(25,28,29,0.02)]">
              <h4 className="text-sm font-bold font-headline mb-4">Department Health</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-on-surface-variant">Physics</span>
                  <div className="flex gap-1">
                    <div className="w-8 h-1 bg-tertiary rounded-full"></div>
                    <div className="w-8 h-1 bg-tertiary rounded-full"></div>
                    <div className="w-8 h-1 bg-tertiary rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-on-surface-variant">Arts &amp; Design</span>
                  <div className="flex gap-1">
                    <div className="w-8 h-1 bg-tertiary rounded-full"></div>
                    <div className="w-8 h-1 bg-tertiary rounded-full"></div>
                    <div className="w-8 h-1 bg-surface-container-high rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-on-surface-variant">Mathematics</span>
                  <div className="flex gap-1">
                    <div className="w-8 h-1 bg-tertiary rounded-full"></div>
                    <div className="w-8 h-1 bg-surface-container-high rounded-full"></div>
                    <div className="w-8 h-1 bg-surface-container-high rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* More Faculty Members */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_32px_rgba(25,28,29,0.02)] border border-transparent hover:border-primary-container/20 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" alt="Julian Rossi" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxIQOUs5cWFG1VmW72V651kZ9twsVNfaDaiImI18g5lwyNKumufq5VRAQi1PrHASDmqmlb_cxPGnFWwous06ksC8GBYPfEmAtNRu86Rh99-TB0Br_epRnReienz0-R1T_5tRfDBaCt4ZR2uuIBwXBlmbOxtWU6ErLkpFTHZaIb9DYkyBtaE_gxelrjTNwOHTZzkNTLVpbYF4DH6hBcJt4X331cPqsjI0fB3OyIsX7fmD0-xnFbqrzE1y1ltxFTxWGkno-jOYdkhK7A" />
              </div>
              <div>
                <h4 className="font-bold font-headline">Julian Rossi</h4>
                <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Fine Arts</p>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Salary</p>
                <p className="text-lg font-bold font-headline">$4,200</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Performance</p>
                <p className="text-lg font-bold font-headline text-tertiary-container">4.8</p>
              </div>
            </div>
            <button className="w-full py-2 bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded group-hover:bg-primary-container group-hover:text-white transition-all">Manage Faculty</button>
          </div>

          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_32px_rgba(25,28,29,0.02)] border border-transparent hover:border-primary-container/20 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" alt="Dr. Sarah Okafor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhMGeFiumS8RKGml6Kxx-hgfAh1fcOzy_mhxjptdq59h1OcRatLTUgwvD4omUf8fdkDITLnS0LDvWMc0-JG50CEhSuBOOQEb5vCrCpI_PmzrToVy-JEV5dr3uL_YRnDWsxmYETZUM_I4lKHrAk_v5lPidwAbzt-7Ndj-WLdvxFfnfKsEzyLx5AEXG7Nhs1axfayQ5msXnd8QDxNcluij4aTlZ741_Uxlnh0M4k08u_uGipNMeACQRr6__V4R3bTGv5RcpCjdMFTR5u" />
              </div>
              <div>
                <h4 className="font-bold font-headline">Dr. Sarah Okafor</h4>
                <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Mathematics</p>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Salary</p>
                <p className="text-lg font-bold font-headline">$5,150</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Performance</p>
                <p className="text-lg font-bold font-headline text-tertiary-container">4.7</p>
              </div>
            </div>
            <button className="w-full py-2 bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded group-hover:bg-primary-container group-hover:text-white transition-all">Manage Faculty</button>
          </div>

          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_32px_rgba(25,28,29,0.02)] border border-transparent hover:border-primary-container/20 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" alt="Mark Thompson" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCul4U0Dvc2wm58yxRLI93ilc88NPv_hH1yAO8aU14xMFYIziODnFKoV-ZjPuJcpjlik0zFp-UQpIS6GNdD5Xv6wyNk21zNj5MBfMkxxXmM3f38Qnmtb1XQep0joBa2vUMuJU56iWSld6_nPZk5rukKn6fjiqT7rEWea0VBz3pq-NO9bfbaoeqWpbpS5E2xeEu6JQmStD8heP2vOKtF2F9wF5I6OhzceAHsG4Ix0jMs35_Z-O7TekCvtCM6u1X_9xd5eNoOU-7fr0fV" />
              </div>
              <div>
                <h4 className="font-bold font-headline">Mark Thompson</h4>
                <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Lab Sciences</p>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Salary</p>
                <p className="text-lg font-bold font-headline">$3,900</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Performance</p>
                <p className="text-lg font-bold font-headline text-tertiary-container">4.2</p>
              </div>
            </div>
            <button className="w-full py-2 bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded group-hover:bg-primary-container group-hover:text-white transition-all">Manage Faculty</button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation Bar (Mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_-4px_32px_rgba(25,28,29,0.04)] rounded-t-2xl">
        <a className="flex flex-col items-center justify-center text-[#2b5ab5] dark:text-[#4874cf] scale-110 active:scale-90 transition-transform" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
          <span className="font-inter text-[10px] font-medium">Grades</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-500 hover:opacity-80 active:scale-90 transition-transform" href="#">
          <span className="material-symbols-outlined">cloud_upload</span>
          <span className="font-inter text-[10px] font-medium">Entry</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-500 hover:opacity-80 active:scale-90 transition-transform" href="#">
          <span className="material-symbols-outlined">payments</span>
          <span className="font-inter text-[10px] font-medium">Staff</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-500 hover:opacity-80 active:scale-90 transition-transform" href="#">
          <span className="material-symbols-outlined">folder_shared</span>
          <span className="font-inter text-[10px] font-medium">Directory</span>
        </a>
      </nav>
    </div>
  );
}
