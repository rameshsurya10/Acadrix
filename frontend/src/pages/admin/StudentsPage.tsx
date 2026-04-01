export default function StudentsPage() {
  return (
    <div className="bg-background text-on-background">
      {/* TopAppBar */}
      <header className="bg-[#f8f9fa] flex justify-between items-center w-full px-8 py-4 fixed top-0 z-50">
        <div className="flex items-center gap-4">
          <img
            alt="User Profile"
            className="w-10 h-10 rounded-full bg-surface-container-high object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJD4ITVW-Z4aDqW4k9g5ZcUDr8uYhOdrd6OFo04vIiR2T5638RgEv9MOsAfzdiOhkQpAP2Zdc5Iq-qcSNSf5BaA6pV7_QGfooH-zxfrf1gdM52A3aC9FW64PqGuoCU4JWY-iiqvdtMAzzK9bM9rqHSrj0iFQHMwalD0IT2HAkPc0iZmeDCcUhbGCBVeLMnuJC1QA9X5wMAhGLxMB4ulUA5Izeco5LZcMiMTeb86JnHGUulSCjIZcobgq3hc_xq8YTsYDK7PRnJAfUx"
          />
          <h1 className="text-2xl font-bold tracking-tight text-[#191c1d] font-headline">Scholar Metric</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4 items-center">
            <span className="text-[#2b5ab5] font-bold font-headline text-sm cursor-pointer">Directory</span>
            <span className="text-[#414754] font-headline text-sm cursor-pointer hover:bg-[#e7e8e9] transition-colors px-3 py-1 rounded-lg">Reports</span>
            <span className="text-[#414754] font-headline text-sm cursor-pointer hover:bg-[#e7e8e9] transition-colors px-3 py-1 rounded-lg">Admissions</span>
          </div>
          <span className="material-symbols-outlined text-[#2b5ab5] text-2xl cursor-pointer">search</span>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="mb-10">
          <span className="font-inter text-[0.75rem] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Administrative Oversight</span>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface tracking-tight">Master Student Registry</h2>
              <p className="text-on-surface-variant mt-2 max-w-xl">A comprehensive architectural view of the 2023-2024 academic body. Manage documentation, academic standing, and financial compliance in one curated view.</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-primary-container text-on-primary px-6 py-3 rounded-lg font-headline font-bold text-sm shadow-sm flex items-center gap-2 hover:scale-95 duration-150">
                <span className="material-symbols-outlined text-sm">person_add</span>
                New Enrollment
              </button>
            </div>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="bg-surface-container-lowest/80 backdrop-blur-xl p-4 rounded-xl mb-8 flex flex-wrap gap-4 items-center">
          <div className="flex-grow min-w-[300px] relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm" placeholder="Search by name, ID, or parent contact..." type="text" />
          </div>
          <div className="flex gap-2">
            <select className="bg-surface-container-low border-none rounded-lg py-3 px-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant focus:ring-primary cursor-pointer">
              <option>Grade: All</option>
              <option>Grade 10</option>
              <option>Grade 11</option>
              <option>Grade 12</option>
            </select>
            <select className="bg-surface-container-low border-none rounded-lg py-3 px-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant focus:ring-primary cursor-pointer">
              <option>Section: All</option>
              <option>Section A</option>
              <option>Section B</option>
            </select>
            <select className="bg-surface-container-low border-none rounded-lg py-3 px-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant focus:ring-primary cursor-pointer">
              <option>Year: 2024</option>
              <option>Year: 2023</option>
            </select>
          </div>
        </section>

        {/* Bento Grid / Data List */}
        <div className="space-y-4">
          {/* Student Row 1 */}
          <div className="group bg-surface-container-lowest hover:bg-surface-container-high transition-colors p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-lg bg-surface-container-low flex items-center justify-center overflow-hidden">
                <img alt="Student" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjwMASPl0w3Q2Js7IUcf67_kftNw56ItgmSaezk9e3nAtS9Zez4mZrG2sgmAURlnSHQwJC6IMm1rkE1TdmpZqi8GNRTTw2JU1bB4welfI62U42zjmYG5hwflysPp0BQN8T9jdcSvz0DAWGWVWpBfHEgwaXQ2qmn_J7KwJTy9p-TFc7vRRHrwgNcL9JQo7Qu26GIQcZY9-B7lo7nnMiSteOYIabbVlgNSFMP2qyt2KbBjhfNny5-KQUdN7YLL21OIzMrx2-DUx1OQsK" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Julianne De Marco</h3>
                <p className="text-xs text-on-surface-variant font-medium">ID: SM-2024-0891</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-grow max-w-3xl">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Grade / Sec</p>
                <p className="font-inter font-semibold text-sm">11th • Section A</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Overall GPA</p>
                <p className="font-inter font-bold text-sm text-tertiary">3.92 / 4.0</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Doc Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span className="font-inter font-medium text-xs text-on-surface">All Proofs Submitted</span>
                </div>
              </div>
              <div className="flex lg:justify-end gap-4">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Billing</p>
                  <span className="text-xs font-bold text-tertiary">Paid In Full</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:border-l border-outline-variant/20 lg:pl-6">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" title="Full Profile">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" title="Academic Records">
                <span className="material-symbols-outlined">analytics</span>
              </button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" title="Payment History">
                <span className="material-symbols-outlined">receipt_long</span>
              </button>
            </div>
          </div>

          {/* Student Row 2 */}
          <div className="group bg-surface-container-lowest hover:bg-surface-container-high transition-colors p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-lg bg-surface-container-low flex items-center justify-center overflow-hidden">
                <img alt="Student" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuTS4Z7w_vY10iVn9edCJDEZET-MMZIx0r7lzjniYspCFqvi67E5jdmT07-NUtFDC6WoeESCap1a3TQxpHEUmFdwa5bGNAyGu-wMrEFaAOKueO_5LhhG7Y3hzH_TkqX3kuGVcvVaZQj_kgGWO4vl5Pu54r3Cna-BKuLhQgDAE9n1P6DtpNyeuJW947zaby3IkkEBt8EuvJ8EkB9I7FVZKoaBjeDhk5GRusxA2GONeZbuXZqkflQxY_J9kKV1LExv04z-qF9zWhDmen" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Aiden Blackwell</h3>
                <p className="text-xs text-on-surface-variant font-medium">ID: SM-2024-0422</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-grow max-w-3xl">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Grade / Sec</p>
                <p className="font-inter font-semibold text-sm">10th • Section B</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Overall GPA</p>
                <p className="font-inter font-bold text-sm text-on-surface-variant">2.84 / 4.0</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Doc Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  <span className="font-inter font-medium text-xs text-error">Missing Medical</span>
                </div>
              </div>
              <div className="flex lg:justify-end gap-4">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Billing</p>
                  <span className="text-xs font-bold text-error">Overdue</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:border-l border-outline-variant/20 lg:pl-6">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">account_circle</span></button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">analytics</span></button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">receipt_long</span></button>
            </div>
          </div>

          {/* Student Row 3 */}
          <div className="group bg-surface-container-lowest hover:bg-surface-container-high transition-colors p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-lg bg-surface-container-low flex items-center justify-center overflow-hidden">
                <img alt="Student" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi4KnJoThsxLAEdAnwsFN_VVAOPJWxXM4aUWp3afGP0KWHikiltBwKtlEuAPDS2n4aTGlRNECuGZQSj1aI9MTRfVJ2walrKyentLXfAE3R1EsAjZxO_mrAnOHGqBZWzhzZMjrYlF6wEla3sadg9lncmHM7RN00-Hq8gOjtzuxFkSE_W-OHjlM2pbIdiQYUbF8HNsaM4NNQ8LfFA1lAbIRumvp-RGjlydmqxoWFc8mAi8JbvvidqUjTqYpEC1PLUovGJpje781-M3Co" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Lila Laurent</h3>
                <p className="text-xs text-on-surface-variant font-medium">ID: SM-2024-0115</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-grow max-w-3xl">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Grade / Sec</p>
                <p className="font-inter font-semibold text-sm">12th • Section A</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Overall GPA</p>
                <p className="font-inter font-bold text-sm text-tertiary">4.0 / 4.0</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Doc Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span className="font-inter font-medium text-xs text-on-surface">All Proofs Submitted</span>
                </div>
              </div>
              <div className="flex lg:justify-end gap-4">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Billing</p>
                  <span className="text-xs font-bold text-on-surface-variant">Installment Plan</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:border-l border-outline-variant/20 lg:pl-6">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">account_circle</span></button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">analytics</span></button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">receipt_long</span></button>
            </div>
          </div>

          {/* Student Row 4 */}
          <div className="group bg-surface-container-lowest hover:bg-surface-container-high transition-colors p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-lg bg-surface-container-low flex items-center justify-center overflow-hidden">
                <img alt="Student" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDga7RKjuWwzgpCcD44b4UW82x93MhK8n-oVAV8ZrNgll6qux5x6pmsm9z7pz7UVjxHK32i8JypJ_UMIrkrPDd9PVOIgfQu_KP2PM9yJYdsnwjrj0FPyLQqHXmBBJQoaLBThHlXX0XUEyua9tj_KhnA0pDAEsknXEI8XbzNNTG8eg5lrtvHI75M_aachzLS6xAbT2GHr3-KdZfGV9OmUdhS57w2Ul4vHjDhtUHUpvQmfUPJGK6qk0uCKT2ePwb3xVw06Vq06RyaZOc_" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Ronin Wu</h3>
                <p className="text-xs text-on-surface-variant font-medium">ID: SM-2024-0012</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-grow max-w-3xl">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Grade / Sec</p>
                <p className="font-inter font-semibold text-sm">11th • Section C</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Overall GPA</p>
                <p className="font-inter font-bold text-sm text-on-surface-variant">3.15 / 4.0</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Doc Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  <span className="font-inter font-medium text-xs text-error">Birth Cert Missing</span>
                </div>
              </div>
              <div className="flex lg:justify-end gap-4">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Billing</p>
                  <span className="text-xs font-bold text-tertiary">Paid In Full</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:border-l border-outline-variant/20 lg:pl-6">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">account_circle</span></button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">analytics</span></button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">receipt_long</span></button>
            </div>
          </div>
        </div>

        {/* Pagination / Load More */}
        <div className="mt-12 flex justify-center">
          <button className="bg-surface-container-highest text-on-surface-variant px-8 py-3 rounded-full font-headline font-bold text-sm hover:bg-surface-container-high transition-all">
            Load 25 More Students
          </button>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_-4px_32px_rgba(25,28,29,0.04)]">
        <div className="flex flex-col items-center justify-center text-[#2b5ab5] dark:text-[#4874cf] scale-110 cursor-pointer active:scale-90 transition-transform">
          <span className="material-symbols-outlined">edit_note</span>
          <span className="font-inter text-[10px] font-medium">Grades</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-500 cursor-pointer hover:opacity-80 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">cloud_upload</span>
          <span className="font-inter text-[10px] font-medium">Entry</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-500 cursor-pointer hover:opacity-80 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">payments</span>
          <span className="font-inter text-[10px] font-medium">Staff</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] dark:text-slate-500 cursor-pointer hover:opacity-80 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">folder_shared</span>
          <span className="font-inter text-[10px] font-medium">Directory</span>
        </div>
      </nav>
    </div>
  );
}
