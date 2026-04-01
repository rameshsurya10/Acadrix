export default function StudentDashboardPage() {
  return (
    <div className="bg-[#f8f9fa] text-on-surface min-h-screen">
      {/* TopAppBar */}
      <header className="bg-[#f8f9fa] dark:bg-[#191c1d] top-0 sticky z-50 flex justify-between items-center w-full px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#1A73E8] dark:text-[#4874cf]">school</span>
          <span className="text-xl font-black text-[#1A73E8] dark:text-[#4874cf] font-['Manrope']">Editorial Intelligence</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 mr-8">
            <a className="text-[#1A73E8] font-bold font-['Manrope']" href="#">Dashboard</a>
            <a className="text-[#414754] dark:text-[#c1c6d6] font-['Manrope'] hover:bg-[#e7e8e9] transition-colors px-2 py-1 rounded" href="#">Modules</a>
            <a className="text-[#414754] dark:text-[#c1c6d6] font-['Manrope'] hover:bg-[#e7e8e9] transition-colors px-2 py-1 rounded" href="#">Schedule</a>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest border-2 border-primary/10">
            <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSdcsM-xvec_lxXCfbtXEo8_gkYEVjtvP_3eo1QrkatvQQ-0IMBcVSxs5-LYbSMCY_i--fe70b1IZOabGozIPKAeYR8QT6Fr6Rb_zW0-6Q7LbgjISS7FbNJOF7YoxycO59OQdDTNicjlGpAaV31eMd59xBOiDFChTOffw9L71XJxLJfifuDIG-28YZB_Y_W0WUv4JQCWwvL9XWShxqe1r-cxIzgBYnmGrLMYVwJ00DWpr7e0UlhmvPH98zQTnNbN1Uk0Qj6YwmGovG" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 pb-32">
        {/* Hero Section: Student Identity */}
        <section className="mb-10 flex flex-col md:flex-row gap-8 items-end">
          <div className="flex-1">
            <p className="text-[0.75rem] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2 font-['Inter']">Student Profile</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">Julian Thorne</h1>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-sm font-medium">Grade 11-B</span>
              <span className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-full text-sm font-medium">ID: #STU-99210</span>
              <span className="px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-sm font-medium">Honor Roll</span>
            </div>
          </div>
          <div className="w-full md:w-auto flex gap-4">
            <div className="flex-1 md:w-48 p-4 bg-surface-container-lowest rounded-xl">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Attendance</p>
              <p className="text-2xl font-bold text-primary">98.4%</p>
            </div>
            <div className="flex-1 md:w-48 p-4 bg-surface-container-lowest rounded-xl">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1">GPA</p>
              <p className="text-2xl font-bold text-tertiary">3.92</p>
            </div>
          </div>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Performance Section: Main Card */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Academic Performance</h2>
              <button className="text-primary text-sm font-semibold hover:underline">View Full Report</button>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-semibold text-on-surface">Advanced Mathematics</span>
                  <span className="text-sm font-bold text-primary">94/100</span>
                </div>
                <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-semibold text-on-surface">Theoretical Physics</span>
                  <span className="text-sm font-bold text-primary">89/100</span>
                </div>
                <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-semibold text-on-surface">English Literature</span>
                  <span className="text-sm font-bold text-primary">92/100</span>
                </div>
                <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-semibold text-on-surface">Macroeconomics</span>
                  <span className="text-sm font-bold text-primary">85/100</span>
                </div>
                <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
            {/* Visual Chart Placeholder */}
            <div className="mt-10 p-6 bg-surface-container-low rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">trending_up</span>
                <span className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Yearly Progress</span>
              </div>
              <div className="h-32 flex items-end justify-between gap-2">
                <div className="w-full bg-primary/20 rounded-t-lg" style={{ height: '60%' }}></div>
                <div className="w-full bg-primary/30 rounded-t-lg" style={{ height: '75%' }}></div>
                <div className="w-full bg-primary/40 rounded-t-lg" style={{ height: '70%' }}></div>
                <div className="w-full bg-primary/60 rounded-t-lg" style={{ height: '85%' }}></div>
                <div className="w-full bg-primary/80 rounded-t-lg" style={{ height: '92%' }}></div>
                <div className="w-full bg-primary rounded-t-lg" style={{ height: '98%' }}></div>
              </div>
              <div className="flex justify-between mt-2 px-1 text-[10px] font-bold text-outline uppercase tracking-tighter">
                <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span>
              </div>
            </div>
          </div>

          {/* Health Status Side Column */}
          <div className="md:col-span-4 space-y-6">
            {/* Health Card */}
            <div className="bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold tracking-tight">Health Status</h3>
                <div className="w-3 h-3 rounded-full bg-tertiary animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-container-low p-4 rounded-lg">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Height</p>
                  <p className="text-lg font-bold">178 <span className="text-sm font-normal text-outline">cm</span></p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-lg">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Weight</p>
                  <p className="text-lg font-bold">72 <span className="text-sm font-normal text-outline">cm</span></p>
                </div>
              </div>
              <div className="p-4 bg-tertiary/10 rounded-lg border border-tertiary/5">
                <p className="text-xs font-semibold text-tertiary mb-1">Recent Check: Jan 15, 2024</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">All vitals are normal. Recommended: increase water intake during sports.</p>
              </div>
            </div>
            {/* Extracurricular Card */}
            <div className="bg-surface-container-low rounded-xl p-6">
              <h3 className="text-xl font-bold tracking-tight mb-6">Extracurricular</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container">sports_soccer</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Varsity Football</p>
                    <p className="text-xs text-on-surface-variant">Team Captain • Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container">palette</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Digital Arts Club</p>
                    <p className="text-xs text-on-surface-variant">Member • Friday 4PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container">menu_book</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Debate Society</p>
                    <p className="text-xs text-on-surface-variant">Regional Finalist</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-surface-container-highest rounded-lg text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-colors">
                Discover More
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Preview Ribbon */}
        <section className="mt-10">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Upcoming Schedule</h3>
          <div className="flex overflow-x-auto gap-4 pb-4">
            <div className="min-w-[280px] bg-surface-container-lowest p-5 rounded-xl border-l-4 border-primary">
              <p className="text-[0.65rem] font-bold text-primary mb-1 uppercase">Today • 10:30 AM</p>
              <h4 className="font-bold mb-1">Advanced Calculus Exam</h4>
              <p className="text-sm text-on-surface-variant">Room 402 • Block B</p>
            </div>
            <div className="min-w-[280px] bg-surface-container-lowest p-5 rounded-xl border-l-4 border-secondary">
              <p className="text-[0.65rem] font-bold text-secondary mb-1 uppercase">Today • 02:00 PM</p>
              <h4 className="font-bold mb-1">Football Practice</h4>
              <p className="text-sm text-on-surface-variant">East Field</p>
            </div>
            <div className="min-w-[280px] bg-white/80 backdrop-blur-[20px] p-5 rounded-xl border-l-4 border-tertiary">
              <p className="text-[0.65rem] font-bold text-tertiary mb-1 uppercase">Tomorrow • 09:00 AM</p>
              <h4 className="font-bold mb-1">Literature Review</h4>
              <p className="text-sm text-on-surface-variant">Library Hall</p>
            </div>
            <div className="min-w-[280px] bg-surface-container-lowest p-5 rounded-xl border-l-4 border-primary">
              <p className="text-[0.65rem] font-bold text-primary mb-1 uppercase">Feb 12 • 11:45 AM</p>
              <h4 className="font-bold mb-1">Guest Lecture: AI</h4>
              <p className="text-sm text-on-surface-variant">Main Auditorium</p>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-2xl bg-[#ffffff] dark:bg-[#1f2122] shadow-[0_-4px_32px_rgba(25,28,29,0.04)] flex justify-around items-center h-20 px-4">
        <div className="flex flex-col items-center justify-center bg-[#cfe6f2] dark:bg-[#2b5ab5]/20 text-[#2b5ab5] dark:text-[#4874cf] rounded-xl px-4 py-1 transition-all duration-200 ease-out">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Dashboard</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1 transition-all duration-200 ease-out hover:bg-[#f3f4f5]">
          <span className="material-symbols-outlined">extension</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Modules</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1 transition-all duration-200 ease-out hover:bg-[#f3f4f5]">
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Schedule</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1 transition-all duration-200 ease-out hover:bg-[#f3f4f5]">
          <span className="material-symbols-outlined">notifications_active</span>
          <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Alerts</span>
        </div>
      </nav>

      {/* FAB */}
      <button className="fixed right-6 bottom-24 md:bottom-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-90 z-40">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
