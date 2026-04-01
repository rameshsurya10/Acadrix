export default function StudentProfilePage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24 md:pb-0">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-50 bg-[#f8f9fa] flex items-center justify-between px-6 py-4 w-full">
        <div className="flex items-center gap-3">
          <img className="w-10 h-10 rounded-full object-cover" alt="User Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_ahn9Swha6fp6ZoTQ8WrvDgIQbWVVvKNm7zJmmSWR-PHyfSJFCOPsfLnqf1A7bAklI33Cesgvy_hGtgv2r78xuzYeQNB_0Jj6-22MYuVavO1CedJHsQSbUYuJqFBx1Ei4KyO8IEenssS_Befp-nyTkGiayFTIgi1UGT4mz-JMm3vwg8v6_9DokGcBgeodK0nGiTJ-auXWQqNMJyV_h3IwjW9r7nDAFljfOXgnA67BBAtCq0y8il33lnpXygklGRBgOF_qO66X-2yq" />
          <span className="text-[#2b5ab5] font-manrope font-extrabold tracking-tight text-xl">Scholar Metric</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-[#e7e8e9] transition-colors scale-95 active:transition-transform">
            <span className="material-symbols-outlined text-[#2b5ab5]">search</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Section: Editorial Contrast */}
        <div className="mb-10">
          <p className="font-inter text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-1">Academic Profile</p>
          <h1 className="font-manrope font-bold text-4xl text-on-surface">Student Records</h1>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Profile & Core Info: Asymmetric 5/12 */}
          <div className="md:col-span-5 space-y-8">
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-primary-container">
                    <img className="w-full h-full rounded-full object-cover bg-white" alt="Julian Thorne" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK9eD9n7_WV1FZIdXfhJ4hwPC_SDTzSs5qRawKI3UHL71hK9ju0bIg1MJUHHw5KuLRRnxBwTABpSOiRmofUyI7pRa6XaQRyKOLUw-q4kzHM5sPuWbeHiZFjvIz5Rf4YXpVKRe2D2NgARR2T2zXIdVbLjyp5DI4vI7XUWsrXzJTemFFof2I6zpW3CDAZ0Wk0XQ_Andq9r8pqu2buiPsEGbVirlHqaI559G2D0BcILFTHRRXcuc6DHEXTRtGhHyiMTq7TQiygWJf5et8" />
                  </div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-tertiary rounded-full border-4 border-surface-container-lowest"></div>
                </div>
                <h2 className="text-2xl font-manrope font-bold text-on-surface">Julian Thorne</h2>
                <p className="text-on-surface-variant font-medium mb-6">Student ID: #SM-2024-8892</p>
                <div className="w-full grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-surface-container-low p-4 rounded-lg text-left">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Current Grade</p>
                    <p className="text-xl font-manrope font-bold text-primary">11th Grade</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-lg text-left">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">House</p>
                    <p className="text-xl font-manrope font-bold text-tertiary">Aquila</p>
                  </div>
                </div>
                <button className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-transform active:scale-95">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  Contact Student
                </button>
              </div>
            </div>
            {/* Attendance Pulse */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Attendance Record</p>
                <p className="text-3xl font-manrope font-bold text-on-surface">98.4%</p>
              </div>
              <div className="flex items-center gap-2 bg-tertiary/10 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-tertiary rounded-full animate-pulse"></div>
                <span className="text-tertiary text-xs font-bold uppercase tracking-tighter">Excellent Status</span>
              </div>
            </div>
          </div>

          {/* Metrics & Documents: Asymmetric 7/12 */}
          <div className="md:col-span-7 space-y-8">
            {/* GPA Glassmorphic Card */}
            <div className="relative h-48 rounded-xl overflow-hidden bg-primary p-8 flex items-end">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container"></div>
              <div className="absolute top-0 right-0 p-8">
                <span className="material-symbols-outlined text-6xl text-white/20">school</span>
              </div>
              <div className="relative z-10">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Cumulative Grade Point Average</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-6xl font-manrope font-extrabold text-white">3.9</h3>
                  <span className="text-white/60 text-2xl font-manrope">/ 4.0</span>
                </div>
              </div>
            </div>
            {/* Academic Documents Section */}
            <div className="bg-surface-container-low rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-manrope font-bold text-on-surface">Verification Documents</h3>
                <span className="text-xs font-medium text-primary hover:underline cursor-pointer">Upload New</span>
              </div>
              <div className="space-y-3">
                {/* Doc 1 */}
                <div className="bg-surface-container-lowest p-4 rounded-lg flex items-center justify-between group hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-secondary-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Birth Certificate</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">PDF • 1.2 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Verified</span>
                    <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                </div>
                {/* Doc 2 */}
                <div className="bg-surface-container-lowest p-4 rounded-lg flex items-center justify-between group hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-secondary-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Address Proof</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">JPG • 2.4 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Verified</span>
                    <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                </div>
                {/* Doc 3 (Pending State) */}
                <div className="bg-surface-container-lowest p-4 rounded-lg flex items-center justify-between group hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-secondary-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">history_edu</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Previous Academic Transcript</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">PDF • 4.8 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">In Review</span>
                    <span className="material-symbols-outlined text-outline text-sm">schedule</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#ffffff]/80 backdrop-blur-xl border-t border-[#c1c6d6]/20 shadow-[0_-4px_32px_rgba(25,28,29,0.04)] z-50 rounded-t-2xl">
        <div className="flex flex-col items-center justify-center text-[#414754] px-3 py-1 transition-all duration-300 ease-in-out hover:text-[#2b5ab5]">
          <span className="material-symbols-outlined mb-1">grid_view</span>
          <span className="font-inter text-[10px] font-medium uppercase tracking-wider">Dashboard</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] px-3 py-1 transition-all duration-300 ease-in-out hover:text-[#2b5ab5]">
          <span className="material-symbols-outlined mb-1">chat_bubble</span>
          <span className="font-inter text-[10px] font-medium uppercase tracking-wider">Messages</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#414754] px-3 py-1 transition-all duration-300 ease-in-out hover:text-[#2b5ab5]">
          <span className="material-symbols-outlined mb-1">group</span>
          <span className="font-inter text-[10px] font-medium uppercase tracking-wider">Directory</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#cfe6f2] text-[#2b5ab5] rounded-xl px-3 py-1 transition-all duration-300 ease-in-out">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="font-inter text-[10px] font-medium uppercase tracking-wider">Profile</span>
        </div>
      </nav>
    </div>
  );
}
