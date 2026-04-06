import PageLayout from '@/components/layout/PageLayout'

export default function GradebookPage() {
  return (
    <PageLayout>
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Editorial Header Section */}
        <section className="mb-10 mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="font-label text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-2">Classroom Overview</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight">Class 10-A Gradebook</h1>
          </div>
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4 min-w-[160px]">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">analytics</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Class Avg</p>
                <p className="text-xl font-headline font-bold text-on-surface">84.2%</p>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4 min-w-[200px]">
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary">workspace_premium</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Top Student</p>
                <p className="text-xl font-headline font-bold text-on-surface">Elena Rodriguez</p>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative w-full lg:w-1/3">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Search student by name or ID..." type="text" />
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-2/3 lg:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-tighter">Subject:</span>
              <select className="bg-surface-container-low border-none rounded-lg text-sm font-medium py-2 px-4 focus:ring-primary/20">
                <option>Mathematics</option>
                <option>Science</option>
                <option>English Literature</option>
                <option>World History</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-tighter">Assessment:</span>
              <select className="bg-surface-container-low border-none rounded-lg text-sm font-medium py-2 px-4 focus:ring-primary/20">
                <option>Mid-term Exam</option>
                <option>Final Exam</option>
                <option>Monthly Quiz</option>
                <option>Lab Report</option>
              </select>
            </div>
            <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Apply Filters
            </button>
          </div>
        </section>

        {/* Gradebook Table */}
        <section className="bg-surface-container-low rounded-2xl overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant/10">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Student Details</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Student ID</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Marks (100)</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {/* Student Row 1 */}
                <tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">AA</div>
                      <div>
                        <p className="font-semibold text-on-surface">Adrian Abbott</p>
                        <p className="text-xs text-on-surface-variant">Honor Roll</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono text-sm text-on-surface-variant">#SM-2024-001</td>
                  <td className="px-6 py-5">
                    <span className="bg-tertiary/10 text-tertiary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">Excellent</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-transparent hover:border-primary/30 transition-all cursor-pointer">
                      <span className="font-headline font-bold text-lg text-primary">92</span>
                      <span className="material-symbols-outlined text-sm opacity-30 group-hover:opacity-100">edit</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
                {/* Student Row 2 */}
                <tr className="bg-surface hover:bg-surface-container transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">BL</div>
                      <div>
                        <p className="font-semibold text-on-surface">Beatrice Lowe</p>
                        <p className="text-xs text-on-surface-variant">Regular</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono text-sm text-on-surface-variant">#SM-2024-042</td>
                  <td className="px-6 py-5">
                    <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">Good</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-transparent hover:border-primary/30 transition-all cursor-pointer">
                      <span className="font-headline font-bold text-lg text-on-surface">78</span>
                      <span className="material-symbols-outlined text-sm opacity-30 group-hover:opacity-100">edit</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
                {/* Student Row 3 */}
                <tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">ER</div>
                      <div>
                        <p className="font-semibold text-on-surface">Elena Rodriguez</p>
                        <p className="text-xs text-on-surface-variant">Top Performer</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono text-sm text-on-surface-variant">#SM-2024-015</td>
                  <td className="px-6 py-5">
                    <span className="bg-tertiary/10 text-tertiary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">Outstanding</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-transparent hover:border-primary/30 transition-all cursor-pointer">
                      <span className="font-headline font-bold text-lg text-tertiary">98</span>
                      <span className="material-symbols-outlined text-sm opacity-30 group-hover:opacity-100">edit</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
                {/* Student Row 4 (Alert State) */}
                <tr className="bg-surface hover:bg-surface-container transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">MT</div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full border-2 border-surface animate-pulse"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">Marcus Thorne</p>
                        <p className="text-xs text-on-surface-variant">Academic Alert</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono text-sm text-on-surface-variant">#SM-2024-108</td>
                  <td className="px-6 py-5">
                    <span className="bg-error/10 text-error text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">Needs Review</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-transparent hover:border-primary/30 transition-all cursor-pointer">
                      <span className="font-headline font-bold text-lg text-error">45</span>
                      <span className="material-symbols-outlined text-sm opacity-30 group-hover:opacity-100">edit</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Table Pagination / Footer */}
          <div className="px-8 py-4 flex justify-between items-center text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
            <span>Showing 4 of 28 Students</span>
            <div className="flex gap-4">
              <button className="hover:text-primary transition-colors">Previous</button>
              <button className="hover:text-primary transition-colors">Next</button>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
