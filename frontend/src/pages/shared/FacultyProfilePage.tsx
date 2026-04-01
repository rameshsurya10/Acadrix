export default function FacultyProfilePage() {
  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-50 bg-[#f8f9fa] dark:bg-slate-900 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high">
            <img alt="User Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDd1iMP6YfawIJFOcEXPxaG9BcYSlihQr4Ei4csZJZRt4ITWcivCOrPZVwqVVdijvJFJfAF80S9oC0FgrtsIrtzQ1tDHrg7IODPLUEqiTkA1BiNvmgc2zWNXbvFUQkrqducDLFOBx9lUpGxVfwY89sDBU0FhCgk-0g5V6BUcTM7XMNBZeCAEyi3BQQ8qP9MX6OLAare2CcAu1EY0UEY-aUK3upK0D6s2O30wUnQ_3748UBKzyEZaPiTlyzwh8Yuv4_Qyl8OJ-Q1jPlv" />
          </div>
          <span className="text-[#2b5ab5] dark:text-[#4874cf] font-manrope font-extrabold tracking-tight text-xl">Scholar Metric</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-[#e7e8e9] dark:hover:bg-slate-700 transition-colors text-[#414754] dark:text-slate-400">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 pb-32">
        {/* Profile Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Identity Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_32px_rgba(25,28,29,0.04)] text-center">
              <div className="relative inline-block mb-6">
                <div className="w-40 h-40 rounded-full overflow-hidden mx-auto border-4 border-surface-container-low">
                  <img alt="Dr. Eleanor Vance" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDk15kb8WPjCwKyu2Gj3w_13kPDQl7EEGbAif686LjqSM4FXP91FypiRrz3-HXarRCSKPYZDoPq3NBDLdIWKvIthody0VGiA_O9-C29E6JBBFYfTLM7TxQ02jxTbN2fhDe7MIWGN3kZgsd3mVpMLN8bXjCZAbHs7jE1PlL_6yMD55Y2WgNruchEwr6YTFTIQgaKZFN_EnIFx0GsS2tLju1Mu8Y7oFi7FBJ3xLcP3r6QBvL2zfT8rKIPq7MmRZBxIkIwp9qun-h_QhiW" />
                </div>
                <div className="absolute bottom-2 right-2 bg-tertiary p-1.5 rounded-full border-2 border-surface-container-lowest">
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>
              <h1 className="font-headline font-bold text-2xl text-on-surface">Dr. Eleanor Vance</h1>
              <p className="font-label text-sm uppercase tracking-wider text-on-surface-variant mt-1">Quantum Physics Department</p>
              <div className="mt-6 flex justify-center gap-4">
                <button className="flex-1 bg-gradient-to-r from-primary to-primary-container text-on-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-transform active:scale-95">
                  <span className="material-symbols-outlined text-xl">chat_bubble</span>
                  Message
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low rounded-xl p-4 text-center">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Performance</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="font-headline font-extrabold text-xl text-primary">4.9</span>
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">Out of 5.0</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-4 text-center">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Monthly Salary</p>
                <p className="font-headline font-extrabold text-xl text-on-surface">$6,850.00</p>
                <p className="text-[10px] text-tertiary mt-1 font-medium">+4.2% YoY</p>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Schedule */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bento Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Research Focus Card */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_32px_rgba(25,28,29,0.04)]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary">science</span>
                  <h3 className="font-headline font-bold text-lg">Research Focus</h3>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Specializing in quantum entanglement and non-linear dynamics. Currently leading the 'Project Chronos' laboratory initiative for deep-space communication protocols.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-medium uppercase tracking-wider">Entanglement</span>
                  <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-medium uppercase tracking-wider">Astrophysics</span>
                </div>
              </div>

              {/* Health Status Pulse */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_32px_rgba(25,28,29,0.04)] relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-tertiary">ecg_heart</span>
                    <h3 className="font-headline font-bold text-lg">Administrative Health</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
                    </span>
                    <span className="text-xs font-medium text-tertiary">Excellent</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Attendance Rate</span>
                    <span className="font-bold">98.4%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full">
                    <div className="bg-tertiary h-1.5 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Grade Submission Speed</span>
                    <span className="font-bold">2.4 Days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Ribbon */}
            <div className="bg-surface-container-low rounded-xl p-1 overflow-hidden">
              <div className="px-5 py-4 flex justify-between items-center">
                <h3 className="font-headline font-bold text-lg">Teaching Schedule</h3>
                <div className="flex gap-2">
                  <button className="p-1 rounded-lg hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
                  </button>
                  <button className="p-1 rounded-lg hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="flex overflow-x-auto gap-4 px-5 pb-6">
                {/* Monday */}
                <div className="min-w-[200px] flex-shrink-0 bg-surface-container-lowest p-4 rounded-xl border-l-4 border-primary shadow-sm">
                  <p className="font-label text-[10px] uppercase text-on-surface-variant mb-2">Mon • 09:00 AM</p>
                  <p className="font-bold text-sm mb-1">Advanced Mechanics</p>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    Hall 4B
                  </div>
                </div>
                {/* Tuesday - Active Now */}
                <div className="min-w-[200px] flex-shrink-0 bg-primary/5 dark:bg-primary/20 p-4 rounded-xl border-l-4 border-tertiary shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <span className="bg-tertiary text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Now</span>
                  </div>
                  <p className="font-label text-[10px] uppercase text-tertiary mb-2">Tue • 11:30 AM</p>
                  <p className="font-bold text-sm mb-1 text-primary">Quantum Theory II</p>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    Lab 701
                  </div>
                </div>
                {/* Wednesday */}
                <div className="min-w-[200px] flex-shrink-0 bg-surface-container-lowest p-4 rounded-xl border-l-4 border-outline shadow-sm">
                  <p className="font-label text-[10px] uppercase text-on-surface-variant mb-2">Wed • 14:00 PM</p>
                  <p className="font-bold text-sm mb-1">Seminar: Dark Matter</p>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    Annex Room 12
                  </div>
                </div>
                {/* Thursday */}
                <div className="min-w-[200px] flex-shrink-0 bg-surface-container-lowest p-4 rounded-xl border-l-4 border-outline shadow-sm">
                  <p className="font-label text-[10px] uppercase text-on-surface-variant mb-2">Thu • 10:00 AM</p>
                  <p className="font-bold text-sm mb-1">Introduction to Particles</p>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    Lecture Hall A
                  </div>
                </div>
              </div>
            </div>

            {/* Department Contributions */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_32px_rgba(25,28,29,0.04)]">
              <div className="p-6 border-b border-surface-container-low">
                <h3 className="font-headline font-bold text-lg">Department Contributions</h3>
              </div>
              <div className="divide-y divide-surface-container-low">
                <div className="p-4 hover:bg-surface-container-low transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary-container p-2 rounded-lg">
                      <span className="material-symbols-outlined text-on-secondary-container">description</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">Quantum Optics Research Paper</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Submitted • 2 days ago</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant opacity-40">chevron_right</span>
                </div>
                <div className="p-4 hover:bg-surface-container-low transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary-container p-2 rounded-lg">
                      <span className="material-symbols-outlined text-on-secondary-container">groups</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">Peer Review Committee</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Active Meeting • Yesterday</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant opacity-40">chevron_right</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#ffffff]/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-[#c1c6d6]/20 shadow-[0_-4px_32px_rgba(25,28,29,0.04)] z-50 md:hidden">
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-400 px-3 py-1 transition-all duration-300 ease-in-out hover:text-[#2b5ab5]">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-inter text-[10px] font-medium uppercase tracking-wider mt-1">Dashboard</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-400 px-3 py-1 transition-all duration-300 ease-in-out hover:text-[#2b5ab5]">
          <span className="material-symbols-outlined">chat_bubble</span>
          <span className="font-inter text-[10px] font-medium uppercase tracking-wider mt-1">Messages</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-400 px-3 py-1 transition-all duration-300 ease-in-out hover:text-[#2b5ab5]">
          <span className="material-symbols-outlined">group</span>
          <span className="font-inter text-[10px] font-medium uppercase tracking-wider mt-1">Directory</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#cfe6f2] dark:bg-[#2b5ab5]/20 text-[#2b5ab5] dark:text-[#4874cf] rounded-xl px-3 py-1 transition-all duration-300 ease-in-out">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="font-inter text-[10px] font-medium uppercase tracking-wider mt-1">Profile</span>
        </div>
      </nav>
    </div>
  );
}
