import PageLayout from '@/components/layout/PageLayout'

export default function StudentTestResultsPage() {
  return (
    <PageLayout sidebar>
      <main className="flex-1 md:ml-64 pb-24 md:pb-8">
        {/* Main Content Canvas */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
          {/* Page Header */}
          <div className="space-y-1">
            <span className="text-[0.75rem] font-bold text-on-surface-variant uppercase tracking-widest font-label">Academic Record</span>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-on-surface tracking-tight">Student: Test Results &amp; Feedback</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-tertiary-container/10 rounded-full">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="text-xs font-bold text-tertiary uppercase tracking-wider font-label">Published</span>
              </div>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Primary Score Card: Large Display */}
            <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <span className="material-symbols-outlined text-primary/10 text-9xl select-none" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              </div>
              <div className="z-10 space-y-6">
                <div>
                  <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest font-label">Latest Exam: Mid-Term Series 2024</p>
                  <h3 className="text-6xl md:text-8xl font-black font-headline text-primary mt-2">A<span className="text-primary-container">+</span></h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                  <div className="space-y-1">
                    <p className="text-xs text-on-surface-variant font-medium">Overall Score</p>
                    <p className="text-xl font-bold font-headline">94.5%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-on-surface-variant font-medium">Class Rank</p>
                    <p className="text-xl font-bold font-headline">2nd / 32</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-on-surface-variant font-medium">Points Earned</p>
                    <p className="text-xl font-bold font-headline">472.5 / 500</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-on-surface-variant font-medium">Percentile</p>
                    <p className="text-xl font-bold font-headline">96th</p>
                  </div>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-slate-100 flex items-center gap-4">
                <div className="flex-1 bg-surface-container-low h-3 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-primary-container h-full w-[94.5%]"></div>
                </div>
                <span className="text-sm font-bold font-headline text-on-surface-variant">Class Avg: 78%</span>
              </div>
            </div>

            {/* Teacher Feedback Sidebar */}
            <div className="md:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble_outline</span>
                <h4 className="text-lg font-bold font-headline">Educator's Insight</h4>
              </div>
              <div className="flex-1 space-y-4 italic text-on-surface-variant text-sm leading-relaxed">
                <p>"Your performance in the Advanced Calculus section was exemplary. You've shown a significant improvement in theoretical application compared to last term."</p>
                <p>"Focus on refining your citation speed for the essay components. Overall, an outstanding effort that sets a high benchmark for the class."</p>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center overflow-hidden">
                  <img alt="Teacher" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtgnlnpHHtdeDYpSo5PFxENiMGF4f7LOKZd66rd768FeXFq8FdC6Tav-Q-N2jcg63uRWSyqmAWmYhy-hhRJLd4vCAFew-SjrqVTDMKf2ch9aayerzWhKuIZ7ncGecOpW1NNaVwuxrwm9b_lDvfTFHVYIJloS6_Qt2LXeGOD0bUDmqyglJF1oCzoXUU-i39bTQmXjPSSms7K8xNJiCtB37PL0sXnz_AwBcXnlXmiNqrOmywSb9yH9Emj1ycxh717baJHRtlomumq-2_" />
                </div>
                <div>
                  <p className="text-xs font-bold font-headline">Dr. Sarah Jenkins</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Senior Academic Lead</p>
                </div>
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest p-6 rounded-lg transition-colors hover:bg-surface-container-high cursor-default">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label">Mathematics</span>
                  <span className="text-tertiary font-bold font-headline">98%</span>
                </div>
                <h5 className="font-bold text-lg mb-4">Advanced Calculus</h5>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[98%]"></div>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Comparison: +12% above average</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-lg transition-colors hover:bg-surface-container-high cursor-default">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label">Science</span>
                  <span className="text-tertiary font-bold font-headline">91%</span>
                </div>
                <h5 className="font-bold text-lg mb-4">Quantum Physics</h5>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[91%]"></div>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Comparison: +15% above average</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-lg transition-colors hover:bg-surface-container-high cursor-default">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label">Humanities</span>
                  <span className="text-on-surface font-bold font-headline">84%</span>
                </div>
                <h5 className="font-bold text-lg mb-4">Modern History</h5>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full w-[84%]"></div>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Comparison: +5% above average</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-lg transition-colors hover:bg-surface-container-high cursor-default">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label">Languages</span>
                  <span className="text-on-surface font-bold font-headline">88%</span>
                </div>
                <h5 className="font-bold text-lg mb-4">Literature &amp; Rhetoric</h5>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full w-[88%]"></div>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Comparison: +8% above average</p>
              </div>
            </div>

            {/* Comparison Graph Context */}
            <div className="md:col-span-12 bg-surface-container-low rounded-xl overflow-hidden">
              <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <h4 className="text-2xl font-bold font-headline text-on-surface">Trend Analysis</h4>
                  <p className="text-on-surface-variant text-sm max-w-lg">Your performance has maintained a steady upward trajectory. Compared to the previous term, you have increased your overall proficiency by 7.2%, specifically in STEM subjects.</p>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg text-sm transition-all hover:shadow-lg">Download PDF Report</button>
                    <button className="px-6 py-3 bg-surface-container-lowest text-primary font-bold rounded-lg text-sm hover:bg-surface-container-high transition-colors">Detailed Analytics</button>
                  </div>
                </div>
                <div className="w-full md:w-1/3 aspect-video bg-surface-container-lowest rounded-lg p-6 flex items-end justify-around gap-2 shadow-sm border border-slate-100/50">
                  <div className="flex flex-col items-center gap-2 h-full justify-end">
                    <div className="bg-slate-200 w-8 rounded-t-sm h-[60%]"></div>
                    <span className="text-[8px] font-bold uppercase font-label">Term 1</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 h-full justify-end">
                    <div className="bg-slate-300 w-8 rounded-t-sm h-[75%]"></div>
                    <span className="text-[8px] font-bold uppercase font-label">Term 2</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 h-full justify-end">
                    <div className="bg-primary w-8 rounded-t-sm h-[95%]"></div>
                    <span className="text-[8px] font-bold uppercase font-label">Term 3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
