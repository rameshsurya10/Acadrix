export default function AssessmentsPage() {
  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* NavigationDrawer */}
      <aside className="hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 h-screen w-64 fixed left-0 top-0 bg-slate-50 dark:bg-slate-950 z-50">
        <div className="px-6 py-8">
          <h1 className="text-lg font-black text-blue-900 dark:text-blue-100 tracking-tight font-headline">Academic Suite</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-xs font-semibold uppercase tracking-wider font-label">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-all duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">quiz</span>
            <span className="text-xs font-semibold uppercase tracking-wider font-label">Assessment Lab</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">school</span>
            <span className="text-xs font-semibold uppercase tracking-wider font-label">Class Management</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-xs font-semibold uppercase tracking-wider font-label">Results</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">psychology</span>
            <span className="text-xs font-semibold uppercase tracking-wider font-label">AI Generator</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <main className="md:ml-64 pb-20 md:pb-0">
        {/* TopAppBar */}
        <header className="flex justify-between items-center px-6 py-4 w-full bg-slate-50 dark:bg-slate-950 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden">
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuApZspYUqDIwuZZRC-Lm2mGvwpZ_CXhcQmADQukf0ZwjT_fs1DepZWkTUaVBdbkVbSnxgsV0tILApkqhEFteIgh9dVsJahKw-9iQ2bydth4G-v8XgACq_oEj0XJ4oUm-fuv8_rrSq11-egA_mAWbY9nw7NA9P-FmDeZmQkDoVdBQ91oaaDMSXoZ29a3JMOD3amjdKJ-QK5-l37BEMB4iVhy9B9Hnjwjlc4_qnnRHH_i66dOZkMuhR-sO5pCRKTIKAFzn-33YBVujYkg"
              />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-blue-800 dark:text-blue-300 font-headline">Scholar Metric</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-colors active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        {/* Editorial Content Area */}
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
          {/* Page Header */}
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase font-label">Administrative Oversight</p>
            <h3 className="text-4xl md:text-5xl font-extrabold text-on-surface font-headline leading-tight">Admin: Assessment Oversight</h3>
          </div>

          {/* Bento Dashboard Layout */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Summary Stats Card (Asymmetric) */}
            <div className="md:col-span-8 bg-surface-container-lowest rounded-lg p-8 flex flex-col justify-between min-h-[240px] relative overflow-hidden group">
              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 font-label">Institutional Health</span>
                <h4 className="text-2xl font-bold mt-2 font-headline">Assessment Ecosystem</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 mt-8">
                <div>
                  <p className="text-3xl font-extrabold text-primary font-headline">142</p>
                  <p className="text-xs text-on-surface-variant font-medium">Total Tests</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-tertiary font-headline">28</p>
                  <p className="text-xs text-on-surface-variant font-medium">Drafts</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-on-surface font-headline">12</p>
                  <p className="text-xs text-on-surface-variant font-medium">Active Today</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-secondary font-headline">94%</p>
                  <p className="text-xs text-on-surface-variant font-medium">Compliance</p>
                </div>
              </div>
              {/* Background Visual Element */}
              <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
              </div>
            </div>

            {/* Action Hub (1/3 Width) */}
            <div className="md:col-span-4 bg-primary rounded-lg p-8 text-on-primary flex flex-col justify-center gap-6 shadow-xl shadow-primary/20 bg-gradient-to-br from-primary to-primary-container">
              <h4 className="text-xl font-bold font-headline">Strategic Controls</h4>
              <p className="text-sm opacity-90 leading-relaxed">Oversee teacher flows, audit curriculum alignment, and manage the institutional calendar from a single interface.</p>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-white text-primary font-bold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-surface-container-lowest transition-all">
                  <span className="material-symbols-outlined text-sm">event</span>
                  Full School Calendar
                </button>
                <button className="w-full py-3 px-4 border border-white/30 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  Audit All Drafts
                </button>
              </div>
            </div>

            {/* Master List Section */}
            <div className="md:col-span-12 space-y-6">
              <div className="flex items-end justify-between border-b border-outline-variant/20 pb-4">
                <div className="space-y-1">
                  <h5 className="text-xl font-bold font-headline">Master Test Inventory</h5>
                  <p className="text-sm text-on-surface-variant">Real-time oversight of all departmental assessments</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-surface-container-low px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">search</span>
                    <input className="bg-transparent border-none text-xs focus:ring-0 w-48 text-on-surface" placeholder="Search by teacher or class..." type="text" />
                  </div>
                  <button className="bg-surface-container-high p-2 rounded-full hover:bg-surface-container-highest transition-colors">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                </div>
              </div>

              {/* Clean Grid Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left bg-surface-container-low">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label rounded-l-lg">Assessment Title</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label">Faculty Member</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label">Department / Class</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label">Scheduled Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label rounded-r-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {/* Row 1 */}
                    <tr className="bg-surface-container-lowest hover:bg-surface transition-colors group">
                      <td className="px-6 py-5 rounded-l-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-lg">science</span>
                          </div>
                          <span className="font-semibold text-on-surface">Organic Chemistry Midterm</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant">Dr. Helena Vance</td>
                      <td className="px-6 py-5">
                        <span className="text-xs px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-medium">Science / Grade 11</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                          <span className="text-tertiary font-bold text-xs uppercase tracking-tighter">Live</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant">Oct 14, 2023</td>
                      <td className="px-6 py-5 rounded-r-lg">
                        <button className="text-primary hover:underline font-bold text-xs">VIEW FLOW</button>
                      </td>
                    </tr>
                    {/* Row 2 */}
                    <tr className="bg-surface hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-5 rounded-l-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center text-secondary">
                            <span className="material-symbols-outlined text-lg">history_edu</span>
                          </div>
                          <span className="font-semibold text-on-surface">Post-Colonial Lit Analysis</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant">Marcus Thorne</td>
                      <td className="px-6 py-5">
                        <span className="text-xs px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-medium">English / Grade 12</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-outline"></span>
                          <span className="text-on-surface-variant font-bold text-xs uppercase tracking-tighter">Draft</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant">TBD</td>
                      <td className="px-6 py-5 rounded-r-lg">
                        <button className="text-primary hover:underline font-bold text-xs">REVIEW</button>
                      </td>
                    </tr>
                    {/* Row 3 */}
                    <tr className="bg-surface-container-lowest hover:bg-surface transition-colors group">
                      <td className="px-6 py-5 rounded-l-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-lg">calculate</span>
                          </div>
                          <span className="font-semibold text-on-surface">Advanced Calculus Quiz 4</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant">Sarah Jenkins</td>
                      <td className="px-6 py-5">
                        <span className="text-xs px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-medium">Math / AP 1</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                          <span className="text-primary-container font-bold text-xs uppercase tracking-tighter">Scheduled</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant">Oct 18, 2023</td>
                      <td className="px-6 py-5 rounded-r-lg">
                        <button className="text-primary hover:underline font-bold text-xs">MANAGE</button>
                      </td>
                    </tr>
                    {/* Row 4 (Alert State) */}
                    <tr className="bg-error-container/20 hover:bg-error-container/30 transition-colors group">
                      <td className="px-6 py-5 rounded-l-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-error/10 flex items-center justify-center text-error">
                            <span className="material-symbols-outlined text-lg">warning</span>
                          </div>
                          <span className="font-semibold text-on-surface">World History Final Prep</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant">Julian Sacks</td>
                      <td className="px-6 py-5">
                        <span className="text-xs px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-medium">History / Grade 10</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                          <span className="text-error font-bold text-xs uppercase tracking-tighter">Overdue Approval</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant">Oct 12, 2023</td>
                      <td className="px-6 py-5 rounded-r-lg">
                        <button className="text-error hover:underline font-bold text-xs">AUDIT NOW</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="md:col-span-12 mt-4">
              <div className="bg-surface-container-low rounded-lg p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="space-y-1">
                    <h5 className="text-2xl font-bold font-headline">Institutional Testing Calendar</h5>
                    <p className="text-sm text-on-surface-variant">Visualizing conflict-free scheduling across all cohorts</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="p-2 bg-surface-container-lowest rounded-full shadow-sm"><span className="material-symbols-outlined">chevron_left</span></button>
                    <span className="font-bold text-lg font-headline">October 2023</span>
                    <button className="p-2 bg-surface-container-lowest rounded-full shadow-sm"><span className="material-symbols-outlined">chevron_right</span></button>
                  </div>
                </div>
                {/* Schedule Ribbon */}
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {/* Day Cards */}
                  <div className="min-w-[140px] bg-surface-container-lowest p-4 rounded-lg flex flex-col gap-4 border-l-4 border-primary">
                    <p className="text-xs font-bold opacity-40">MON 14</p>
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded">Chemistry</div>
                      <div className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-1 rounded">Spanish B</div>
                    </div>
                  </div>
                  <div className="min-w-[140px] bg-white/80 backdrop-blur-xl p-4 rounded-lg flex flex-col gap-4 border-l-4 border-tertiary ring-2 ring-primary/20">
                    <p className="text-xs font-bold text-primary">TUE 15 (TODAY)</p>
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold bg-tertiary/10 text-tertiary px-2 py-1 rounded">Comp Sci Final</div>
                      <div className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded">Calculus AP</div>
                      <div className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-1 rounded">Visual Arts</div>
                    </div>
                  </div>
                  <div className="min-w-[140px] bg-surface-container-lowest p-4 rounded-lg flex flex-col gap-4">
                    <p className="text-xs font-bold opacity-40">WED 16</p>
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-1 rounded">Algebra II</div>
                    </div>
                  </div>
                  <div className="min-w-[140px] bg-surface-container-lowest p-4 rounded-lg flex flex-col gap-4">
                    <p className="text-xs font-bold opacity-40">THU 17</p>
                    <div className="space-y-2">
                      <p className="text-[10px] italic opacity-40">No assessments</p>
                    </div>
                  </div>
                  <div className="min-w-[140px] bg-surface-container-lowest p-4 rounded-lg flex flex-col gap-4 border-l-4 border-primary/40">
                    <p className="text-xs font-bold opacity-40">FRI 18</p>
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded">Physics Mid</div>
                      <div className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded">Logic 101</div>
                    </div>
                  </div>
                  <div className="min-w-[140px] bg-surface-container-lowest p-4 rounded-lg flex flex-col gap-4">
                    <p className="text-xs font-bold opacity-40">SAT 19</p>
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-1 rounded">SAT Prep</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50">
        <a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500" href="#">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium font-label">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30 rounded-xl px-3 py-1" href="#">
          <span className="material-symbols-outlined">assignment</span>
          <span className="text-[10px] font-medium font-label">Tests</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500" href="#">
          <span className="material-symbols-outlined">auto_awesome</span>
          <span className="text-[10px] font-medium font-label">AI Gen</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500" href="#">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-medium font-label">Profile</span>
        </a>
      </nav>
    </div>
  );
}
