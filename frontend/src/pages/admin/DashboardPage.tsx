export default function AdminDashboardPage() {
  return (
    <div className="bg-surface font-body text-on-surface">
      <header className="bg-[#f8f9fa] dark:bg-[#191c1d] docked full-width top-0 sticky z-50 flex justify-between items-center w-full px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#1A73E8] dark:text-[#4874cf]">school</span>
          <h1 className="font-['Manrope'] font-bold text-lg tracking-tight text-on-surface">Editorial Intelligence</h1>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6">
            <a className="text-[#1A73E8] font-bold font-label text-sm" href="#">Dashboard</a>
            <a className="text-[#414754] dark:text-[#c1c6d6] hover:bg-[#e7e8e9] dark:hover:bg-[#3e4243] transition-colors font-label text-sm px-2 py-1 rounded" href="#">Modules</a>
            <a className="text-[#414754] dark:text-[#c1c6d6] hover:bg-[#e7e8e9] dark:hover:bg-[#3e4243] transition-colors font-label text-sm px-2 py-1 rounded" href="#">Schedule</a>
            <a className="text-[#414754] dark:text-[#c1c6d6] hover:bg-[#e7e8e9] dark:hover:bg-[#3e4243] transition-colors font-label text-sm px-2 py-1 rounded" href="#">Alerts</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full transition-colors">search</button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
            <img alt="User Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADJzQNiFxyqvd24NGWbD1W1qLqtt0bwKtIjlNnFHFoVyICCh-YmzXvGUFtGJsbGwj-SxyxOnyhh3BiNKi3DSMSLwU5LaKPOaKAJyxIUDq0VEeWNTmIGpXwaiDGCV5-x3YAvOZWZaETq7_LIOwMbQuidBj8rwf37KyQ5uUYLB67VsVIGhjJD4lN_tMyWhazwEL1t41HRagQvzoDTnjSOWzd930k7oz7_1tAdv8O6g7KFDdpLR5d0nrb1m4cz6NFsZjA8GrFso1vbKBr" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-10 pb-32">
        <div className="mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Administrative Portal</span>
          <h2 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight">Institutional Oversight</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-6 rounded-xl border-none">
              <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Active Teachers</p>
              <div className="flex items-end justify-between">
                <span className="font-headline font-bold text-3xl">142</span>
                <span className="text-tertiary font-bold text-sm flex items-center">+4% <span className="material-symbols-outlined text-sm ml-1">trending_up</span></span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border-none">
              <p className="font-label text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4">Pending Admissions</p>
              <div className="flex items-end justify-between">
                <span className="font-headline font-bold text-3xl">28</span>
                <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
              </div>
            </div>
            <div className="bg-primary bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl border-none text-on-primary">
              <p className="font-label text-xs font-medium text-on-primary/80 uppercase tracking-wider mb-4">Capacity</p>
              <div className="flex items-end justify-between">
                <span className="font-headline font-bold text-3xl">92%</span>
                <span className="material-symbols-outlined opacity-50">analytics</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 bg-secondary-container p-6 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="font-headline font-bold text-xl text-on-secondary-container mb-2">Priority Task</h3>
              <p className="text-sm text-on-secondary-container/80 leading-relaxed mb-6">You have 12 teacher certification renewals pending review this week.</p>
            </div>
            <button className="bg-on-secondary-container text-surface-container-lowest py-3 px-6 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">Launch Audit</button>
          </div>
          <section className="md:col-span-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="font-headline font-bold text-2xl">Faculty Directory</h3>
                <p className="text-on-surface-variant text-sm mt-1">Manage departmental roles and credentials.</p>
              </div>
              <div className="flex gap-3">
                <button className="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined text-sm">filter_list</span> Filter
                </button>
                <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-sm">add</span> Add Faculty
                </button>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/10">
                    <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Faculty Member</th>
                    <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Department</th>
                    <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-surface-container-lowest">
                  <tr className="hover:bg-surface transition-colors border-b border-outline-variant/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center font-bold text-on-secondary-fixed">JD</div>
                        <div>
                          <p className="font-bold text-sm">Dr. Julianne Davis</p>
                          <p className="text-xs text-on-surface-variant">Senior Lecturer</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm font-medium">Quantum Physics</span></td>
                    <td className="px-6 py-4"><span className="bg-tertiary/10 text-tertiary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Active</span></td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-surface-container-high rounded transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant">edit</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface transition-colors border-b border-outline-variant/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center font-bold text-on-primary-fixed">MR</div>
                        <div>
                          <p className="font-bold text-sm">Marcus Rodriguez</p>
                          <p className="text-xs text-on-surface-variant">Adjunct Professor</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm font-medium">Classical Humanities</span></td>
                    <td className="px-6 py-4"><span className="bg-tertiary/10 text-tertiary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Active</span></td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-surface-container-high rounded transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant">edit</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center font-bold text-on-surface-variant">SK</div>
                        <div>
                          <p className="font-bold text-sm">Sarah Kessner</p>
                          <p className="text-xs text-on-surface-variant">Department Head</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm font-medium">Applied Mathematics</span></td>
                    <td className="px-6 py-4"><span className="bg-on-surface-variant/10 text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">On Leave</span></td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-surface-container-high rounded transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant">edit</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section className="md:col-span-12 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="font-headline font-bold text-2xl">Admissions Pipeline</h3>
                <p className="text-on-surface-variant text-sm mt-1">Current enrollment cycle documentation tracking.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-primary">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-primary-fixed text-on-primary-fixed-variant px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Phase: Verification</span>
                  <span className="text-xs text-on-surface-variant font-medium">2 hours ago</span>
                </div>
                <h4 className="font-bold text-lg mb-1">Eleanor Vance</h4>
                <p className="text-xs text-on-surface-variant mb-4">Postgraduate · Philosophy</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-xs font-medium">Academic Records Received</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-sm">pending</span>
                    <span className="text-xs font-medium">Identity Verification Pending</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                  <button className="text-primary text-xs font-bold hover:underline">Review Dossier</button>
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">more_horiz</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-tertiary">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Phase: Finalizing</span>
                  <span className="text-xs text-on-surface-variant font-medium">5 hours ago</span>
                </div>
                <h4 className="font-bold text-lg mb-1">Liam Thorne</h4>
                <p className="text-xs text-on-surface-variant mb-4">Undergraduate · Engineering</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-xs font-medium">All Documents Validated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-xs font-medium">Fees Deposited</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                  <button className="bg-tertiary text-on-tertiary px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">Issue Letter</button>
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">more_horiz</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-6 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-high transition-colors">
                <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-primary">person_add</span>
                </div>
                <h4 className="font-bold text-lg mb-1">New Enrollment</h4>
                <p className="text-xs text-on-surface-variant">Initiate a new student admission workflow.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <nav className="bg-[#ffffff] dark:bg-[#1f2122] fixed bottom-0 w-full z-50 rounded-t-2xl shadow-[0_-4px_32px_rgba(25,28,29,0.04)] flex justify-around items-center h-20 pb-safe px-4 md:hidden">
        <div className="flex flex-col items-center justify-center bg-[#cfe6f2] dark:bg-[#2b5ab5]/20 text-[#2b5ab5] dark:text-[#4874cf] rounded-xl px-4 py-1 transition-all duration-200 ease-out">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Dashboard</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1 transition-all duration-200 ease-out hover:bg-[#f3f4f5] dark:hover:bg-[#2a2d2e]">
          <span className="material-symbols-outlined">extension</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Modules</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1 transition-all duration-200 ease-out hover:bg-[#f3f4f5] dark:hover:bg-[#2a2d2e]">
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Schedule</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1 transition-all duration-200 ease-out hover:bg-[#f3f4f5] dark:hover:bg-[#2a2d2e]">
          <span className="material-symbols-outlined">notifications_active</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Alerts</span>
        </div>
      </nav>
    </div>
  );
}
