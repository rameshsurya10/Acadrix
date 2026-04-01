export default function TestCreationPage() {
  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* NavigationDrawer (Desktop) */}
      <aside className="hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 h-screen w-64 fixed left-0 top-0 bg-slate-50 dark:bg-slate-950 z-50">
        <div className="px-6 py-8">
          <span className="text-lg font-black text-blue-900 dark:text-blue-100">Academic Suite</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-all duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Assessment Lab</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">school</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Class Management</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Results</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">psychology</span>
            <span className="text-xs font-semibold uppercase tracking-wider">AI Generator</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Canvas */}
      <main className="md:ml-64 pb-24 md:pb-8">
        {/* TopAppBar */}
        <header className="flex justify-between items-center px-6 py-4 w-full bg-slate-50 dark:bg-slate-950 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-fixed overflow-hidden">
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfnDaPu-9t5sWLj0kVrS50sH9Xldf21bJ08RKNL428IxyNseSysqQfr2HW2bN_U_zgOs0_thE2Ks7ApmASwzId_0caMZVv9WxyB4vPb6RvRR7wfgTink9tWVvCtDsKbWFkiTq18B2z6psjrKS_-9FSql9f1oRKUi_nDcU0MEer1pFetH1JiAb60eBrC8ePviM0yfOJFmJve-IV8TeySwJHMXKMu7sT4iBMpjW3U7h4omZ6amI1uLtJzSzWFL301RJFW6NUVC_6YuiU"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-blue-800 dark:text-blue-300 font-headline">Scholar Metric</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors active:duration-100">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">notifications</span>
            </button>
          </div>
        </header>

        {/* Page Header */}
        <section className="px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[0.75rem] font-bold tracking-[0.1em] uppercase text-on-surface-variant mb-1 block">Assessment Lab</span>
              <h2 className="text-4xl font-extrabold text-on-surface font-headline leading-tight">Teacher: Test Creation &amp; Publishing</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-2.5 bg-surface-container-low text-on-secondary-container font-semibold rounded-lg hover:bg-surface-container-high transition-colors">
                Save Draft
              </button>
              <button className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95">
                Publish Test
              </button>
            </div>
          </div>
        </section>

        {/* Bento Grid Layout */}
        <section className="px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Test Configuration (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Config Card */}
            <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold font-headline mb-6 text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">settings</span>
                Test Configuration
              </h3>
              <div className="space-y-6">
                {/* Class Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Target Class</label>
                  <div className="relative">
                    <select className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium">
                      <option>Select a Class</option>
                      <option>10-A (Honors)</option>
                      <option>10-B</option>
                      <option>11-C (Advanced)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-slate-400">expand_more</span>
                  </div>
                </div>
                {/* Subject Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Subject</label>
                  <div className="relative">
                    <select className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium">
                      <option>Select Subject</option>
                      <option>Mathematics</option>
                      <option>Physics</option>
                      <option>Advanced Calculus</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-slate-400">expand_more</span>
                  </div>
                </div>
                {/* Toggles Area */}
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">Special Class Status</span>
                      <span className="text-xs text-on-surface-variant">Enable advanced proctoring</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input defaultChecked className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">Shuffle Questions</span>
                      <span className="text-xs text-on-surface-variant">Randomize for each student</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Principal Status Card */}
            <div className="bg-primary/5 p-6 rounded-lg border-2 border-dashed border-primary/20">
              <div className="flex items-start gap-4">
                <div className="bg-primary-container p-2 rounded-full text-on-primary">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div>
                  <h4 className="font-bold text-primary font-headline">Compliance Ready</h4>
                  <p className="text-xs text-on-surface-variant mt-1">This test uses 100% principal-approved AI generated questions from the institutional repository.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Question Selection (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Search & Filters */}
            <div className="flex items-center gap-4 bg-surface-container-lowest p-2 rounded-lg shadow-sm">
              <div className="flex-1 flex items-center px-4 gap-3">
                <span className="material-symbols-outlined text-slate-400">search</span>
                <input className="w-full bg-transparent border-none focus:ring-0 text-sm py-3" placeholder="Search approved AI questions..." type="text" />
              </div>
              <div className="h-8 w-[1px] bg-slate-200"></div>
              <button className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-high rounded-lg text-sm font-semibold transition-colors">
                <span className="material-symbols-outlined text-lg">filter_list</span>
                Topics
              </button>
            </div>

            {/* Question List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-on-surface-variant px-2">Approved Questions Inventory</h3>

              {/* Question Card 1 */}
              <div className="group bg-surface-container-lowest p-6 rounded-lg hover:ring-2 hover:ring-primary/10 transition-all cursor-pointer">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2 py-1 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded uppercase">Algebra</span>
                      <span className="px-2 py-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold rounded uppercase">Hard</span>
                      <span className="text-[10px] text-slate-400 font-medium">Ref: AI-MATH-772</span>
                    </div>
                    <p className="text-on-surface font-medium leading-relaxed">Given the quadratic equation x² - 5x + 6 = 0, determine the sum of the squares of its roots without solving the equation directly.</p>
                  </div>
                  <button className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>

              {/* Question Card 2 (Selected) */}
              <div className="group bg-blue-50/50 ring-2 ring-primary/40 p-6 rounded-lg transition-all">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2 py-1 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded uppercase">Calculus</span>
                      <span className="px-2 py-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold rounded uppercase">Medium</span>
                      <span className="text-[10px] text-slate-400 font-medium">Ref: AI-MATH-104</span>
                    </div>
                    <p className="text-on-surface font-medium leading-relaxed">Find the derivative of f(x) = sin(x) * e^x and evaluate it at x = 0.</p>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined">check</span>
                  </button>
                </div>
              </div>

              {/* Question Card 3 */}
              <div className="group bg-surface-container-lowest p-6 rounded-lg hover:ring-2 hover:ring-primary/10 transition-all cursor-pointer">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2 py-1 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded uppercase">Geometry</span>
                      <span className="px-2 py-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold rounded uppercase">Easy</span>
                      <span className="text-[10px] text-slate-400 font-medium">Ref: AI-MATH-339</span>
                    </div>
                    <p className="text-on-surface font-medium leading-relaxed">Calculate the surface area of a sphere with a radius of 7 units. (Use π ≈ 3.14)</p>
                  </div>
                  <button className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>

              {/* Question Card 4 */}
              <div className="group bg-surface-container-lowest p-6 rounded-lg hover:ring-2 hover:ring-primary/10 transition-all cursor-pointer">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2 py-1 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded uppercase">Probability</span>
                      <span className="px-2 py-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold rounded uppercase">Medium</span>
                      <span className="text-[10px] text-slate-400 font-medium">Ref: AI-MATH-921</span>
                    </div>
                    <p className="text-on-surface font-medium leading-relaxed">A bag contains 5 red balls and 3 blue balls. If two balls are drawn at random without replacement, what is the probability that both are red?</p>
                  </div>
                  <button className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-4">
              <button className="px-10 py-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-full transition-colors border border-primary/20">
                View more approved questions
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50 flex justify-around items-center px-4 pb-4 pt-2 shadow-lg">
        <a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 scale-90 duration-150" href="#">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30 rounded-xl px-3 py-1 scale-90 duration-150" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
          <span className="text-[10px] font-medium">Tests</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 scale-90 duration-150" href="#">
          <span className="material-symbols-outlined">auto_awesome</span>
          <span className="text-[10px] font-medium">AI Gen</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 scale-90 duration-150" href="#">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-medium">Profile</span>
        </a>
      </nav>
    </div>
  );
}
