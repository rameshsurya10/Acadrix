export default function AdmissionsPage() {
  return (
    <div className="bg-background text-on-background min-h-screen pb-24">
      {/* TopAppBar */}
      <header className="bg-[#f8f9fa] dark:bg-slate-950 flex justify-between items-center w-full px-8 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm overflow-hidden">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPHBkfS7PwzoRMQqNNP91QtbArvYfURvdT3Ri7TRw8SbcA8gTIWUFLg4gnA2QoVNEdVz_wSWaVXa4xBfn3fwWuc7jARL6CtmE5zpvslnDDv-DB-BPYYM8_iavXS-1kU6fbGGJbOMr3velJXihVtqu7U1LxC2u6ZdL_bQXK42MLWzIl-94f59SjY5aIn8SZ50t74MZmdLVPV6Xj4XT1QeJkO2_Kxs2BhJCEDZEqDNj7nm4_kHzuhV_VrgusUcksF6-7MXhJprWHMRJW"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191c1d] dark:text-slate-100 font-headline">Scholar Metric</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8">
            <span className="text-[#2b5ab5] font-bold font-body text-sm cursor-pointer">Admissions</span>
            <span className="text-[#414754] dark:text-slate-400 hover:text-[#191c1d] font-body text-sm cursor-pointer transition-colors">Students</span>
            <span className="text-[#414754] dark:text-slate-400 hover:text-[#191c1d] font-body text-sm cursor-pointer transition-colors">Faculty</span>
            <span className="text-[#414754] dark:text-slate-400 hover:text-[#191c1d] font-body text-sm cursor-pointer transition-colors">Gradebook</span>
          </div>
          <button className="material-symbols-outlined text-[#2b5ab5] p-2 hover:bg-[#e7e8e9] rounded-full transition-all">search</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Hero / Header Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="space-y-2">
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Academic Session 2024-25</p>
            <h2 className="font-headline font-extrabold text-4xl lg:text-5xl text-on-surface">New Admissions Portal</h2>
            <p className="text-on-surface-variant max-w-lg">Manage pending applications, verify student documentation, and finalize enrollments for the upcoming semester.</p>
          </div>
          <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg hover:shadow-primary/20 active:scale-95 transition-all">
            <span className="material-symbols-outlined">person_add</span>
            Add New Student
          </button>
        </section>

        {/* Search & Filter Bar */}
        <div className="bg-surface-container-low rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
              placeholder="Search by name, ID or guardian..."
              type="text"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-5 py-3 bg-surface-container-lowest text-on-surface-variant rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Status: All
            </button>
            <button className="px-5 py-3 bg-surface-container-lowest text-on-surface-variant rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              Date Applied
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Applications List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-headline font-bold text-lg">Recent Applications</h3>
              <span className="text-xs font-semibold text-primary px-3 py-1 bg-primary-fixed rounded-full">12 Pending Action</span>
            </div>

            {/* Application Item 1 (Selected) */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl border-l-4 border-primary shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center font-bold text-primary">EJ</div>
                <div>
                  <p className="font-bold text-on-surface">Elena Jenkins</p>
                  <p className="text-xs text-on-surface-variant">ID: #ADM-2024-0892</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className="flex items-center gap-2 text-xs font-bold text-tertiary bg-tertiary-fixed/30 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Verified
                </span>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">chevron_right</span>
              </div>
            </div>

            {/* Application Item 2 */}
            <div className="bg-surface p-5 rounded-2xl hover:bg-surface-container-high transition-colors flex items-center justify-between gap-4 cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant">MB</div>
                <div>
                  <p className="font-bold text-on-surface group-hover:text-primary transition-colors">Marcus Bennington</p>
                  <p className="text-xs text-on-surface-variant">ID: #ADM-2024-0901</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className="flex items-center gap-2 text-xs font-bold text-primary bg-primary-fixed/30 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Pending
                </span>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </div>
            </div>

            {/* Application Item 3 */}
            <div className="bg-surface p-5 rounded-2xl hover:bg-surface-container-high transition-colors flex items-center justify-between gap-4 cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant">SC</div>
                <div>
                  <p className="font-bold text-on-surface group-hover:text-primary transition-colors">Sophia Chen</p>
                  <p className="text-xs text-on-surface-variant">ID: #ADM-2024-0915</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className="flex items-center gap-2 text-xs font-bold text-error bg-error-container/50 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Missing Documents
                </span>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </div>
            </div>

            {/* Application Item 4 */}
            <div className="bg-surface p-5 rounded-2xl hover:bg-surface-container-high transition-colors flex items-center justify-between gap-4 cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant">RT</div>
                <div>
                  <p className="font-bold text-on-surface group-hover:text-primary transition-colors">Robert Taylor</p>
                  <p className="text-xs text-on-surface-variant">ID: #ADM-2024-0920</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className="flex items-center gap-2 text-xs font-bold text-primary bg-primary-fixed/30 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Pending
                </span>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </div>
            </div>
          </div>

          {/* Detail Section (Selected Student) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-2xl bg-surface-container-low p-1 mb-4">
                  <img
                    alt="Student Photo"
                    className="w-full h-full object-cover rounded-xl"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGLXvvZkWRjtojs4E-AI-I2-oRZIlfNrFSi_ib1H8-pr1co7pwrHhltjj7tV_2zY9nKgkx1KViNKOpZPGhMH52LCfy-xbi2hyFi29gwnpW-jjtj9hucrrxHusbL8_ZdzxvNg0j_XjqoLwAbsYlvcPze0I7wNuBjYYYKV_apGZr9Iy1pgHRJQOvnXkXiks_eQ-S9wX_WyrBrzgQg3VBlPc618yICzRwLnOPAQ33nKGTPIQstZNeSSYA2WRFz-FwoeTJ2cH7N3GJv9w4"
                  />
                </div>
                <h3 className="font-headline font-bold text-2xl text-on-surface">Elena Jenkins</h3>
                <p className="text-on-surface-variant font-medium">Grade 9 Enrollment</p>
              </div>

              <div className="space-y-6">
                <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Document Verification Checklist</h4>

                {/* Doc 1 */}
                <div className="flex items-center justify-between p-4 bg-surface rounded-xl group hover:bg-surface-container-high transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-tertiary-fixed w-8 h-8 rounded-full flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <span className="text-sm font-semibold text-on-surface">Birth Certificate</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container-lowest" title="Download Document">download</button>
                    <button className="material-symbols-outlined text-tertiary p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }} title="Document Verified">verified_user</button>
                  </div>
                </div>

                {/* Doc 2 */}
                <div className="flex items-center justify-between p-4 bg-surface rounded-xl group hover:bg-surface-container-high transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-tertiary-fixed w-8 h-8 rounded-full flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <span className="text-sm font-semibold text-on-surface">Address Proof</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container-lowest" title="Download Document">download</button>
                    <button className="material-symbols-outlined text-tertiary p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }} title="Document Verified">verified_user</button>
                  </div>
                </div>

                {/* Doc 3 */}
                <div className="flex items-center justify-between p-4 bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-surface-container-highest w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-lg">description</span>
                    </div>
                    <span className="text-sm font-semibold text-on-surface">Transfer Certificate</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container-lowest">download</button>
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container-lowest">verified</button>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button className="flex-1 py-4 bg-tertiary text-on-tertiary rounded-xl font-bold shadow-md hover:opacity-90 transition-all active:scale-95">Complete Admission</button>
                <button className="px-4 py-4 bg-secondary-container text-on-secondary-container rounded-xl font-bold hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>

            {/* Admin Insight Card */}
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary">info</span>
                <h5 className="font-headline font-bold text-on-surface">Editorial Insight</h5>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Elena's application is 90% complete. Once the Transfer Certificate is uploaded and verified, her profile will be moved to the Active Students directory automatically.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_-4px_32px_rgba(25,28,29,0.04)]">
        <a className="flex flex-col items-center justify-center text-[#2b5ab5] dark:text-[#4874cf] scale-110 group" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="font-inter text-[10px] font-bold mt-1">Grades</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-500 hover:opacity-80 active:scale-90 transition-transform" href="#">
          <span className="material-symbols-outlined">edit_note</span>
          <span className="font-inter text-[10px] font-medium mt-1">Entry</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-500 hover:opacity-80 active:scale-90 transition-transform" href="#">
          <span className="material-symbols-outlined">payments</span>
          <span className="font-inter text-[10px] font-medium mt-1">Staff</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-500 hover:opacity-80 active:scale-90 transition-transform" href="#">
          <span className="material-symbols-outlined">folder_shared</span>
          <span className="font-inter text-[10px] font-medium mt-1">Directory</span>
        </a>
      </nav>
    </div>
  );
}
