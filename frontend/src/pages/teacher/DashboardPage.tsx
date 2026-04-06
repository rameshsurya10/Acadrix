import PageLayout from '@/components/layout/PageLayout'

export default function TeacherDashboardPage() {
  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-6 py-10 pb-32">
        {/* Dashboard Header */}
        <div className="mb-10">
          <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Faculty Portal</span>
          <h2 className="text-4xl font-extrabold text-on-surface mt-1 mb-2">Teacher Dashboard</h2>
          <p className="text-on-surface-variant max-w-2xl">Curate your classroom environment. Manage assignments, track student wellness, and record academic growth in a streamlined editorial workspace.</p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Homework Management (2/3 width) */}
          <section className="md:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest p-8 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold tracking-tight">Homework Modules</h3>
                <span className="material-symbols-outlined text-primary">add_task</span>
              </div>
              <div className="flex gap-4 mb-8">
                <div className="flex-1 relative">
                  <input
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary-container outline-none transition-all placeholder:text-outline"
                    placeholder="Assign new task (e.g., 'Chapter 4 Analysis')..."
                    type="text"
                  />
                </div>
                <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-lg font-medium transition-transform active:scale-95">Publish</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <div>
                      <p className="font-semibold text-on-surface">Modernist Literature Review</p>
                      <p className="text-xs text-on-surface-variant">Due: Oct 24 • Grade 11-B</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-tertiary px-3 py-1 bg-tertiary/10 rounded-full">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    <div>
                      <p className="font-semibold text-on-surface">Calculus Differentiation Set</p>
                      <p className="text-xs text-on-surface-variant">Due: Oct 22 • Grade 12-A</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-outline px-3 py-1 bg-surface-container-highest rounded-full">DRAFT</span>
                </div>
              </div>
            </div>

            {/* Performance Entry Table */}
            <div className="bg-surface-container-lowest p-8 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold tracking-tight">Performance Entry</h3>
                <div className="flex gap-2">
                  <button className="text-xs font-bold px-3 py-1 bg-surface-container-low rounded-lg">Mid-Term</button>
                  <button className="text-xs font-bold px-3 py-1 bg-primary text-on-primary rounded-lg">Finals</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="p-4 font-label text-xs text-on-surface-variant uppercase tracking-wider rounded-tl-lg">Student Name</th>
                      <th className="p-4 font-label text-xs text-on-surface-variant uppercase tracking-wider">Mathematics</th>
                      <th className="p-4 font-label text-xs text-on-surface-variant uppercase tracking-wider">Physics</th>
                      <th className="p-4 font-label text-xs text-on-surface-variant uppercase tracking-wider rounded-tr-lg">English</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    <tr className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                      <td className="p-4 font-medium">Elena Richardson</td>
                      <td className="p-4"><input className="w-12 bg-transparent border-none p-0 focus:ring-0 text-primary font-bold" type="text" defaultValue="92" /></td>
                      <td className="p-4"><input className="w-12 bg-transparent border-none p-0 focus:ring-0" type="text" defaultValue="88" /></td>
                      <td className="p-4"><input className="w-12 bg-transparent border-none p-0 focus:ring-0" type="text" defaultValue="95" /></td>
                    </tr>
                    <tr className="bg-surface hover:bg-surface-container-low transition-colors">
                      <td className="p-4 font-medium">Marcus Thorne</td>
                      <td className="p-4"><input className="w-12 bg-transparent border-none p-0 focus:ring-0" type="text" defaultValue="78" /></td>
                      <td className="p-4"><input className="w-12 bg-transparent border-none p-0 focus:ring-0" type="text" defaultValue="81" /></td>
                      <td className="p-4"><input className="w-12 bg-transparent border-none p-0 focus:ring-0" type="text" defaultValue="74" /></td>
                    </tr>
                    <tr className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                      <td className="p-4 font-medium">Julianna Vane</td>
                      <td className="p-4"><input className="w-12 bg-transparent border-none p-0 focus:ring-0" type="text" defaultValue="85" /></td>
                      <td className="p-4"><input className="w-12 bg-transparent border-none p-0 focus:ring-0" type="text" defaultValue="90" /></td>
                      <td className="p-4"><input className="w-12 bg-transparent border-none p-0 focus:ring-0" type="text" defaultValue="89" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Sidebar Controls (1/3 width) */}
          <aside className="md:col-span-4 space-y-8">
            {/* Health Update Card */}
            <div className="bg-surface-container-lowest p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-error opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">Health Observation</h3>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Student Select</label>
                  <select className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container">
                    <option>Select student...</option>
                    <option>Elena Richardson</option>
                    <option>Marcus Thorne</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">Observation</label>
                  <textarea className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container h-24 resize-none" placeholder="Record symptoms or energy levels..."></textarea>
                </div>
                <button className="w-full py-3 bg-secondary-container text-on-secondary-container font-bold rounded-lg hover:bg-opacity-80 transition-all" type="submit">Log Observation</button>
              </form>
            </div>

            {/* Sports & Events Schedule */}
            <div className="bg-surface-container-lowest p-8 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold tracking-tight">Sports &amp; Events</h3>
                <span className="material-symbols-outlined text-on-surface-variant">calendar_today</span>
              </div>
              <div className="space-y-6">
                <div className="relative pl-6 border-l-2 border-primary-container/30">
                  <div className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-primary-container"></div>
                  <p className="text-xs font-bold text-primary-container uppercase mb-1">Tomorrow, 14:00</p>
                  <p className="font-bold text-on-surface">Regional Track Meet</p>
                  <p className="text-sm text-on-surface-variant mb-3">Athletics Field</p>
                  <div className="flex -space-x-2">
                    <img alt="Student" className="w-7 h-7 rounded-full border-2 border-surface-container-lowest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHQ2kna5bXIYBN4gZEb0lb73pzdROz7u-qunBNoEdR1gDlL-aQQUu6n7lC5wOHjBq9zFC8QplMCxsEUNa_i5eqeZRB3T573xUXjInfVNjXISKXd8B5gqWbM-yazVViR5_w5OaOIBbpGvSiBnYsUeTgBD9tH7J9ZznXwHwWnx87Y08tdIN_M4v4tjieYEqnuPgn2YtS6FvwIltzwEEKcfsKWJjNnV1OD_gJwGE2bKK7Bg7Xk5LBe2T56xxhFw5OnTnZ9sWpHgmlk-n-" />
                    <img alt="Student" className="w-7 h-7 rounded-full border-2 border-surface-container-lowest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYhN5aZAYL4_qXRcXQVPEyMG4ngG20ruXcgX4JYDPAja-43vqYsmeYeuwX1hoW-1lX1SV7H2g-73zRlcraYgCu-Q4bZSdbJXM7RAfyi52WSmMA7ya51Pc3dHmPASQgFIiABaBA24-7B2s50GF8Sz-bFqlDBeMgpHfi4-ELzIpdsKvEYLL_RqENFRGc7PSBsS990RAW-2NpIvI2iM-yvI7xnZ_SvetF-d-WBgAa4rmJ41FO_nca72GueFkgK0BYkVvv0XknNRZNRtvd" />
                    <button className="w-7 h-7 rounded-full bg-surface-container-low border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold">+</button>
                  </div>
                </div>
                <div className="relative pl-6 border-l-2 border-outline-variant/30">
                  <div className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-outline-variant"></div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Friday, 09:00</p>
                  <p className="font-bold text-on-surface">Science Symposium</p>
                  <p className="text-sm text-on-surface-variant mb-3">Auditorium C</p>
                  <button className="text-xs font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person_add</span> Add Participants
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-primary/5 backdrop-blur-xl border border-white/20 p-8 rounded-lg relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-8xl">trending_up</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Class Wellness</p>
              <p className="text-3xl font-black text-primary mb-4">94%</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">Attendance is up by 4% this week. Academic engagement remains stable.</p>
            </div>
          </aside>
        </div>
      </main>
    </PageLayout>
  );
}
