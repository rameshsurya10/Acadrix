import PageLayout from '@/components/layout/PageLayout'

export default function QuestionGeneratorPage() {
  return (
    <PageLayout sidebar>
      <main className="pb-20 md:pb-8">
        <div className="px-6 py-8 max-w-7xl mx-auto space-y-10">
          {/* Hero / Header Section */}
          <section className="space-y-2">
            <p className="text-[0.75rem] font-bold text-primary uppercase tracking-[0.2em] font-label">Content Intelligence</p>
            <h2 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">Principal's Question Generator</h2>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed">Leverage state-of-the-art AI to curate curriculum-aligned assessments from your source materials in seconds.</p>
          </section>

          {/* Upload & Config Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Panel */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-container"></div>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-lg p-12 bg-surface-container-low transition-all hover:bg-surface-container-high group-hover:border-primary/40">
                <span className="material-symbols-outlined text-5xl text-primary mb-4">upload_file</span>
                <h3 className="text-xl font-bold text-on-surface mb-2 font-headline">Upload Source Document</h3>
                <p className="text-on-surface-variant text-center mb-6 max-w-sm">Drop your textbook PDF, syllabus, or lecture scans here (Max 50MB).</p>
                <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all scale-95 active:scale-90 active:duration-100">
                  Select Files
                </button>
              </div>
            </div>

            {/* Parameters Panel */}
            <div className="bg-surface-container-low rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-bold font-headline">Generator Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Subject Context</label>
                  <select className="w-full bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20">
                    <option>Modern History - Grade 11</option>
                    <option>Advanced Physics - Grade 12</option>
                    <option>Economics - IGCSE</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">2-Mark Qs</label>
                    <input className="w-full bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20" type="number" defaultValue="10" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">5-Mark Qs</label>
                    <input className="w-full bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20" type="number" defaultValue="5" />
                  </div>
                </div>
                <div className="pt-4">
                  <button className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-colors">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Generate Questions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Result Area */}
          <section className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold font-headline">Draft Pool</h3>
                <span className="bg-primary-container/20 text-primary px-3 py-1 rounded-full text-xs font-bold">15 Generated</span>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 text-primary font-bold text-sm px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export All
                </button>
                <button className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2 rounded-lg font-bold shadow-sm hover:shadow-md transition-all">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Approve All
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {/* Question Item: 2 Mark */}
              <div className="bg-surface-container-lowest rounded-xl p-6 transition-all hover:bg-white shadow-sm hover:shadow-md group">
                <div className="flex gap-6 items-start">
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Marks</span>
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-primary">02</div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="bg-tertiary/10 text-tertiary text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">History: World War II</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-surface-container-high rounded-full text-slate-500"><span className="material-symbols-outlined">edit</span></button>
                        <button className="p-2 hover:bg-error/10 rounded-full text-error"><span className="material-symbols-outlined">delete</span></button>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-on-surface leading-snug">Explain the term "Appeasement Policy" and its significance in the context of the Munich Agreement.</p>
                    <div className="pt-2 border-t border-dashed border-outline-variant/20">
                      <p className="text-xs text-on-surface-variant italic"><span className="font-bold not-italic text-[10px] uppercase mr-2">Key Answer:</span> A diplomatic policy of making political or material concessions to an aggressive power in order to avoid conflict.</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button className="w-10 h-10 rounded-full border-2 border-outline-variant/30 flex items-center justify-center hover:bg-tertiary hover:text-on-tertiary hover:border-tertiary transition-all">
                      <span className="material-symbols-outlined">done</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Item: 5 Mark */}
              <div className="bg-surface-container-lowest rounded-xl p-6 transition-all hover:bg-white shadow-sm hover:shadow-md group relative">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-full"></div>
                <div className="flex gap-6 items-start">
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Marks</span>
                    <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center font-bold text-primary">05</div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="bg-tertiary/10 text-tertiary text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">History: Cold War</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-surface-container-high rounded-full text-slate-500"><span className="material-symbols-outlined">edit</span></button>
                        <button className="p-2 hover:bg-error/10 rounded-full text-error"><span className="material-symbols-outlined">delete</span></button>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-on-surface leading-snug">Critically analyze the socio-economic impacts of the Marshall Plan on Western Europe's recovery post-1945.</p>
                    <div className="pt-2 border-t border-dashed border-outline-variant/20 space-y-2">
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Grading Rubric:</p>
                      <ul className="text-xs text-on-surface-variant list-disc pl-4 space-y-1">
                        <li>Identification of Economic Reconstruction (2 marks)</li>
                        <li>Political stability and prevention of Communism (2 marks)</li>
                        <li>Integration of European markets (1 mark)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button className="w-10 h-10 rounded-full border-2 border-outline-variant/30 flex items-center justify-center hover:bg-tertiary hover:text-on-tertiary hover:border-tertiary transition-all">
                      <span className="material-symbols-outlined">done</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Item: 2 Mark */}
              <div className="bg-surface-container-lowest rounded-xl p-6 transition-all hover:bg-white shadow-sm hover:shadow-md group">
                <div className="flex gap-6 items-start">
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Marks</span>
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-primary">02</div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="bg-tertiary/10 text-tertiary text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">History: Rise of Dictators</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-surface-container-high rounded-full text-slate-500"><span className="material-symbols-outlined">edit</span></button>
                        <button className="p-2 hover:bg-error/10 rounded-full text-error"><span className="material-symbols-outlined">delete</span></button>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-on-surface leading-snug">State two primary objectives of the Nazi-Soviet Non-Aggression Pact of 1939.</p>
                    <div className="pt-2 border-t border-dashed border-outline-variant/20">
                      <p className="text-xs text-on-surface-variant italic"><span className="font-bold not-italic text-[10px] uppercase mr-2">Key Answer:</span> 1. Avoid two-front war for Germany. 2. Secret division of Poland and Eastern Europe.</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button className="w-10 h-10 rounded-full border-2 border-outline-variant/30 flex items-center justify-center hover:bg-tertiary hover:text-on-tertiary hover:border-tertiary transition-all">
                      <span className="material-symbols-outlined">done</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </PageLayout>
  );
}
