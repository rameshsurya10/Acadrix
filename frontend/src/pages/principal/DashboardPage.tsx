import PageLayout from '@/components/layout/PageLayout'

export default function PrincipalDashboardPage() {
  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Welcome & Editorial Header */}
        <section className="space-y-1">
          <p className="font-label text-[0.75rem] uppercase tracking-widest text-on-surface-variant font-medium">Institutional Overview</p>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">Principal's Intelligence Desk</h1>
        </section>

        {/* Bento Grid: Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Focus Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary-container p-8 rounded-xl text-on-primary flex flex-col justify-between shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed">analytics</span>
                <span className="font-label text-xs uppercase tracking-widest opacity-80">Academic Performance Index</span>
              </div>
              <h2 className="text-5xl font-extrabold font-headline">94.2%</h2>
            </div>
            <div className="mt-8 flex items-end justify-between">
              <div className="text-sm opacity-90 max-w-xs">
                Overall institution health is up 4% from previous quarter. Student engagement metrics showing peak performance in STEM modules.
              </div>
              <button className="bg-surface-container-lowest text-primary px-6 py-2 rounded-lg font-bold text-sm hover:scale-95 active:scale-90 transition-transform">
                Detailed Analytics
              </button>
            </div>
          </div>

          {/* Vertical Stats */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-tertiary">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label text-xs uppercase text-on-surface-variant mb-1">Attendance Today</p>
                  <h3 className="text-3xl font-bold font-headline">98.1%</h3>
                </div>
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-error">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label text-xs uppercase text-on-surface-variant mb-1">Pending Requests</p>
                  <h3 className="text-3xl font-bold font-headline">14</h3>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined text-error">notification_important</span>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
            <div className="bg-secondary-container p-6 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label text-xs uppercase text-on-secondary-container mb-1">Teacher Capacity</p>
                  <h3 className="text-3xl font-bold font-headline text-on-secondary-container">88%</h3>
                </div>
                <span className="material-symbols-outlined text-on-secondary-container">groups</span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Schedule Section */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="font-label text-[0.7rem] uppercase tracking-widest text-on-surface-variant font-bold">Real-time Coordination</p>
              <h2 className="text-2xl font-bold font-headline">Master Academic Schedule</h2>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
              <button className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">print</span>
              </button>
            </div>
          </div>

          {/* Clean Grid Schedule */}
          <div className="overflow-x-auto rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 font-label text-[0.75rem] text-on-surface-variant uppercase tracking-wider">Time Slot</th>
                  <th className="px-6 py-4 font-label text-[0.75rem] text-on-surface-variant uppercase tracking-wider">Science Wing</th>
                  <th className="px-6 py-4 font-label text-[0.75rem] text-on-surface-variant uppercase tracking-wider">Humanities</th>
                  <th className="px-6 py-4 font-label text-[0.75rem] text-on-surface-variant uppercase tracking-wider">Mathematics</th>
                  <th className="px-6 py-4 font-label text-[0.75rem] text-on-surface-variant uppercase tracking-wider">Arts &amp; PE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                <tr className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-5 font-medium text-sm text-primary">08:00 - 09:30</td>
                  <td className="px-4 py-2">
                    <div className="bg-primary-fixed/30 p-3 rounded-lg border-l-4 border-primary">
                      <p className="text-xs font-bold text-on-primary-fixed">Chemistry AP</p>
                      <p className="text-[10px] text-on-primary-fixed-variant">Dr. Aris (Lab 4)</p>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="bg-surface-container p-3 rounded-lg">
                      <p className="text-xs font-bold text-on-surface-variant">World History</p>
                      <p className="text-[10px] text-on-surface-variant">Mr. Cohen (Rm 201)</p>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="bg-tertiary-fixed/30 p-3 rounded-lg border-l-4 border-tertiary">
                      <p className="text-xs font-bold text-on-tertiary-fixed">Calculus BC</p>
                      <p className="text-[10px] text-on-tertiary-fixed-variant">Ms. Patel (Rm 105)</p>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <p className="text-xs italic text-on-surface-variant/50 px-3">Prep Period</p>
                  </td>
                </tr>
                <tr className="bg-surface-container-low/50">
                  <td className="px-6 py-5 font-medium text-sm text-primary">09:45 - 11:15</td>
                  <td className="px-6 py-3" colSpan={4}>
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-outline-variant/20 shadow-sm">
                      <span className="material-symbols-outlined text-secondary">coffee</span>
                      <span className="text-xs font-semibold uppercase tracking-widest text-secondary">All-School Assembly &amp; Break</span>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-5 font-medium text-sm text-primary">11:30 - 13:00</td>
                  <td className="px-4 py-2">
                    <div className="bg-surface-container p-3 rounded-lg">
                      <p className="text-xs font-bold text-on-surface-variant">Biology 101</p>
                      <p className="text-[10px] text-on-surface-variant">Mr. Vance (Lab 2)</p>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="bg-primary-fixed/30 p-3 rounded-lg border-l-4 border-primary">
                      <p className="text-xs font-bold text-on-primary-fixed">Literature</p>
                      <p className="text-[10px] text-on-primary-fixed-variant">Ms. Hayes (Rm 212)</p>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="bg-surface-container p-3 rounded-lg">
                      <p className="text-xs font-bold text-on-surface-variant">Geometry</p>
                      <p className="text-[10px] text-on-surface-variant">Dr. Kim (Rm 102)</p>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="bg-secondary-fixed/50 p-3 rounded-lg border-l-4 border-secondary">
                      <p className="text-xs font-bold text-on-secondary-fixed">Visual Arts</p>
                      <p className="text-[10px] text-on-secondary-fixed-variant">Mr. Rossi (Studio A)</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Media Gallery: Event Highlights */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-label text-[0.7rem] uppercase tracking-widest text-on-surface-variant font-bold">Visual Archive</p>
              <h2 className="text-2xl font-bold font-headline">Institutional Media</h2>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-lg">
                <span className="material-symbols-outlined text-xl">visibility</span>
                View All
              </button>
              <button className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-transform active:scale-95">
                <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
                Add Media
              </button>
            </div>
          </div>

          {/* Asymmetric Media Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-[500px]">
            <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-xl">
              <img
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1lQoqYQfECvI66lB0OSq1MyKB2X9sjOySLtuvkDABpOQLxdAa-1Wp5dzn0cKpCK6deYZgffIMn2cAmiWZFjk72UEivrARECveIwAWm76Y5qJFUHlRv7QvvXCDUbYPd9SBlfzcGvKinQCyWUmlDVl1VP5nSgcczq0xLZ-cq1dbezr5Ki2Q-bl-D54emG3iJ2RQlxuwKGPZNICPwjXyuvJs3Gdaq7aa1QfeRAym3IBDdGr__IRTt-BjWzIgSrUw5YU5ktc_8w1ragl5"
                alt="Annual Science Fair 2024"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-bold">Annual Science Fair 2024</p>
                <p className="text-white/80 text-xs">24 Photos • High Definition</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-xl">
              <img
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAJBKjGY481q696IKOMLn5PSZnh0O6s6SRGqdLn-KKzoZ0Th8okOIZtkeub7QruCCqySgAzvgBbjs9m_fKRx9aRfetJCqYWQci6kaCRN1lzE2kRJfaKXwhy3ZEvTUYl4t-CFunNV3nckl9Ve7W0SnouCnMsnzDJvSKMGHsVmbXWugN9QnAsa63S74wXdayTjKAccON421k-SvTE-c1wCReMdElUhV7m5PEIkV7P4dlZAZ0rD0Zp0ygeKsRWm9HsEAUw7q9STP6pFsS"
                alt="Student soccer match"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-xl">
              <img
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUJaOz18JkWbVY9d-G45VQnPvdaTTwaGx8h6x-xhO0WVjoqIN_tBLJfxTr7rHbw7UQ0RvgRSI_mQI7-n-usDG3mOWexZgIIgM4JeaoIlInrLNWG8najflG8WjL5JfvGDkKNLGG-3A32qt37YZRKm3oUhtpaIk5JnqZKxDWCEuSluoIberZXA_z_NcZxa49bRtaGeKCWKPQg3LFdV_U8040GM_yAK3rRY-4coJdsv-GDdJsnZkPgf07CVSxN-LiImuzfAd3PdCnEy_4"
                alt="Robotics workshop"
              />
            </div>
            <div className="relative group overflow-hidden rounded-xl">
              <img
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUXv4xhSNU448RNeMKt7KXLq2ugWgIfXL1uxs8cRQF9fK0l2GGH3YavoPjbYEvJof3N-_lVKlyMlW3Sur7KY5ODVEm2U_eizqovIoc_PD1z-_Uyx3Ydg_uh0HqNlJQhT-FPPBnJeX-o1ZVHR3Osz7u0p5Z2W_FQLYysP4i4AwNv3pvJMAaTY1HEFvMfTOayDZt78CjC_LVbewoLjwPTIUu4lWlY0X-YECqt2DJgIwXaPTgFi3rV820qHeIKtBct88mnbpzxpyC4SC1"
                alt="Student painting mural"
              />
            </div>
            <div className="bg-surface-container-high rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-surface-container-highest cursor-pointer transition-colors border-2 border-dashed border-outline-variant/30">
              <span className="material-symbols-outlined text-on-surface-variant text-3xl">collections</span>
              <span className="font-label text-xs uppercase text-on-surface-variant">Create Album</span>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
