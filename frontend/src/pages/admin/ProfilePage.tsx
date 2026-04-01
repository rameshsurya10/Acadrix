export default function AdminProfilePage() {
  return (
    <div className="min-h-screen pb-24">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-40 bg-[#f8f9fa] dark:bg-slate-900 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden">
            <img
              alt="Admin Portrait"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8ByfXQsHXLpTwV_7Qolf2qU1ulF7isJ5h1IZVGFawJfWj9nLJfn6P1eV1rWLGRu4aB1HGyF9_AxPotCQMsAuoqN5JwedXJsV4VcdY_LOMa9F6d9tNW3Nw4jehU_Z3ROlmurrVBksnLYoXfY3oRp8Nc6kz34ngQ6g1OAzDIM11oggEInHmmgzdRrMTxwhhVoKKJjFlLjKVYHw6BsOJ0QM7nLEL-KSjw1WMTMbv_z0-0HZeT-UZ5oPkP5HOeQW-pey3nFgDxRp0rWgW"
            />
          </div>
          <span className="text-[#2b5ab5] dark:text-[#4874cf] font-headline font-extrabold tracking-tight text-xl">Scholar Metric</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-[#e7e8e9] dark:hover:bg-slate-700 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-[#2b5ab5] dark:text-[#4874cf]">search</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Header Bento Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Main Identity Card */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-sm">
              <img
                alt="Principal Portrait"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJl8S2ZTli70oragPcZVbYaz2GXLqfv_lnTf7KU7BztDOQDWns8xxPnbfNk8m8gRAyTPuCAGDPEDS6GjzOFj_jZpawwl6Ub8hfpxksEpCvpbG8nYs7b6FOcnbl1AxC0-jHfM_ZZSJZP6hx-DR-zWLshdTLuOvRQTVgC9l8dld3scWyBSxQLWIlpOYtVh_pUKyZmeK8LkimxPCxKelsff07oAwtGw1yo23fINyGWLwpl5hfPYgtf-E_79yJU82EFk-yxe6V5sII2LIG"
              />
            </div>
            <div className="relative z-10 flex-1">
              <div className="inline-block px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                Senior Administration
              </div>
              <h1 className="text-4xl font-headline font-extrabold text-on-surface mb-2">Dr. Alistair Vance</h1>
              <p className="text-on-surface-variant font-medium text-lg mb-6">Executive Principal &amp; Institutional Director</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-[10px] font-label font-bold uppercase text-outline mb-1 tracking-wider">Department</p>
                  <p className="text-on-surface font-semibold">Central Oversight</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-[10px] font-label font-bold uppercase text-outline mb-1 tracking-wider">ID Number</p>
                  <p className="text-on-surface font-semibold">ADM-992-04</p>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6">
            <h3 className="text-sm font-label font-bold uppercase text-outline tracking-widest mb-6">System Permissions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
                  <span className="text-sm font-medium">Financial Authority</span>
                </div>
                <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">group_add</span>
                  <span className="text-sm font-medium">HR Management</span>
                </div>
                <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">clinical_notes</span>
                  <span className="text-sm font-medium">Curriculum Audit</span>
                </div>
                <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <button className="w-full py-3 text-primary font-bold text-sm bg-surface-container-high rounded-lg hover:bg-surface-dim transition-colors">
                Request Elevation
              </button>
            </div>
          </div>
        </section>

        {/* Oversight Stats & Metrics */}
        <section className="mb-10">
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Institutional Oversight
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 border-l-4 border-primary shadow-sm">
              <p className="text-[10px] font-label font-bold uppercase text-outline tracking-wider mb-2">Total Revenue (Q3)</p>
              <h4 className="text-2xl font-headline font-extrabold text-on-surface">$1,482,900</h4>
              <div className="mt-4 flex items-center gap-1 text-tertiary text-xs font-bold">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                <span>12.4% vs last quarter</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 border-l-4 border-primary-container shadow-sm">
              <p className="text-[10px] font-label font-bold uppercase text-outline tracking-wider mb-2">Teacher Capacity</p>
              <h4 className="text-2xl font-headline font-extrabold text-on-surface">94.2%</h4>
              <div className="mt-4 w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary-container h-full w-[94.2%]"></div>
              </div>
              <p className="mt-2 text-[10px] text-on-surface-variant font-medium text-right">186/200 Active Staff</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 border-l-4 border-secondary shadow-sm">
              <p className="text-[10px] font-label font-bold uppercase text-outline tracking-wider mb-2">Enrollment Velocity</p>
              <h4 className="text-2xl font-headline font-extrabold text-on-surface">+242</h4>
              <p className="mt-4 text-xs font-medium text-on-surface-variant">New students this month</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 border-l-4 border-tertiary shadow-sm">
              <p className="text-[10px] font-label font-bold uppercase text-outline tracking-wider mb-2">Health Index</p>
              <div className="flex items-center gap-3 mt-1">
                <h4 className="text-2xl font-headline font-extrabold text-on-surface text-tertiary">Optimal</h4>
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-on-surface-variant">All subsystems nominal</p>
            </div>
          </div>
        </section>

        {/* Official Messages Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-headline font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">mail</span>
                Official Messages
              </h2>
              <button className="text-primary font-bold text-sm hover:underline">Mark all as read</button>
            </div>
            <div className="space-y-4">
              {/* Message Item 1 */}
              <div className="bg-surface-container-lowest p-6 rounded-xl flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-secondary-fixed">gavel</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">Board of Trustees Directive #402</h4>
                    <span className="text-[10px] font-medium text-outline">2 HOURS AGO</span>
                  </div>
                  <p className="text-sm text-on-surface-variant line-clamp-2">The quarterly audit for infrastructure expenditure has been finalized. Please review the attached findings regarding the North Wing expansion...</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-error-container text-on-error-container text-[10px] font-bold rounded uppercase">High Priority</span>
                    <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded uppercase">Audit</span>
                  </div>
                </div>
              </div>

              {/* Message Item 2 */}
              <div className="bg-surface-container-lowest p-6 rounded-xl flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-primary-fixed">campaign</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">System Maintenance Schedule</h4>
                    <span className="text-[10px] font-medium text-outline">1 DAY AGO</span>
                  </div>
                  <p className="text-sm text-on-surface-variant line-clamp-2">Scholar Metric servers will undergo routine maintenance this Saturday between 02:00 and 04:00 UTC. Grade submission modules will be offline.</p>
                </div>
              </div>

              {/* Message Item 3 */}
              <div className="bg-surface-container-lowest p-6 rounded-xl flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer group opacity-75">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant">assignment_ind</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">Teacher Contract Renewals</h4>
                    <span className="text-[10px] font-medium text-outline">3 DAYS AGO</span>
                  </div>
                  <p className="text-sm text-on-surface-variant line-clamp-2">Processing for the annual faculty review cycle has commenced. 14 contracts are awaiting electronic signature in the HR portal.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-xl font-headline font-bold text-on-surface">Administrative Tools</h2>
            <div className="bg-surface-container-lowest rounded-xl p-6">
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-lg hover:bg-primary-fixed group transition-all">
                  <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">description</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Reports</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-lg hover:bg-primary-fixed group transition-all">
                  <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">settings</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Setup</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-lg hover:bg-primary-fixed group transition-all">
                  <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">supervised_user_circle</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Staff</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-lg hover:bg-primary-fixed group transition-all">
                  <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">receipt_long</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Billing</span>
                </button>
              </div>
            </div>
            <div className="bg-primary p-6 rounded-xl text-on-primary">
              <h5 className="font-headline font-bold mb-2">Academic Calendar</h5>
              <p className="text-sm opacity-90 mb-4">Mid-term evaluation cycle starts in 3 days. Ready for audit?</p>
              <button className="w-full py-2 bg-on-primary text-primary font-bold rounded-lg text-sm hover:bg-primary-fixed transition-colors">
                View Schedule
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#ffffff]/80 dark:bg-slate-900/80 backdrop-blur-xl z-50 rounded-t-2xl shadow-[0_-4px_32px_rgba(25,28,29,0.04)] border-t border-[#c1c6d6]/20 md:hidden">
        <a className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-400 px-3 py-1 hover:text-[#2b5ab5] transition-all duration-300" href="#">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-inter text-[10px] font-medium uppercase tracking-wider mt-1">Dashboard</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-400 px-3 py-1 hover:text-[#2b5ab5] transition-all duration-300" href="#">
          <span className="material-symbols-outlined">chat_bubble</span>
          <span className="font-inter text-[10px] font-medium uppercase tracking-wider mt-1">Messages</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-400 px-3 py-1 hover:text-[#2b5ab5] transition-all duration-300" href="#">
          <span className="material-symbols-outlined">group</span>
          <span className="font-inter text-[10px] font-medium uppercase tracking-wider mt-1">Directory</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-[#cfe6f2] dark:bg-[#2b5ab5]/20 text-[#2b5ab5] dark:text-[#4874cf] rounded-xl px-3 py-1 transition-all duration-300" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="font-inter text-[10px] font-medium uppercase tracking-wider mt-1">Profile</span>
        </a>
      </nav>
    </div>
  );
}
