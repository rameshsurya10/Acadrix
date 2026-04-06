import PageLayout from '@/components/layout/PageLayout'

export default function MessagingPage() {
  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-6 py-8 pb-32">
        {/* Header */}
        <div className="mb-10">
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">Communications Hub</p>
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">Messaging Center</h2>
        </div>

        {/* Asymmetric Layout Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filter & Search Column */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Search Component */}
            <div className="bg-surface-container-lowest p-1 rounded-xl shadow-sm border border-outline-variant/20">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/50">search</span>
                <input className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm font-body" placeholder="Search conversations..." type="text" />
              </div>
            </div>

            {/* Filter Navigation */}
            <nav className="space-y-1">
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-secondary-container text-on-secondary-container font-semibold transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inbox</span>
                  <span className="font-body">All Messages</span>
                </div>
                <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full">12</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">group</span>
                  <span className="font-body">Internal</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">family_restroom</span>
                  <span className="font-body">Parents</span>
                </div>
                <span className="bg-error text-on-error text-[10px] px-2 py-0.5 rounded-full">3</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">notification_important</span>
                  <span className="font-body">System Alerts</span>
                </div>
              </button>
            </nav>

            {/* Quick Stats Bento Card */}
            <div className="bg-primary-container p-6 rounded-xl text-on-primary-container relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-label uppercase tracking-widest opacity-80 mb-1">Response Time</p>
                <p className="text-3xl font-headline font-bold">14 min</p>
                <p className="text-xs mt-4 opacity-90 leading-relaxed italic">"Your average response rate is 20% faster than last week."</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-9xl">bolt</span>
              </div>
            </div>
          </aside>

          {/* Conversations Column */}
          <section className="lg:col-span-8 space-y-4">
            {/* Conversation Card 1 (Unread) */}
            <div className="group bg-surface-container-lowest p-5 rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img className="w-12 h-12 rounded-full object-cover" alt="Principal James Decker" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9ncudET-k4QAeW70ZzIVX61e4AmvxfteeZBd79dSBTyTR66TmC4l4Nd7ewiQfr_5-IoY5vMTX3tnHpnIK8ZLa0370LjvpTQwElUJnH3iylbBQP-XnzrriWHMQqtJIAcSR7AOPGgE6jEbnYt611e-ht4nJKnTzxPVzgWwux3o2rVRqO4K41LLdZSfuFSXiNOHkW1uSDB3V5TgeWU2XONNwnNZomJPU2ddKn-nE9S5SOsaxr7Rn8vO5Q2Wwjqc5rcAJIA1Esq3AmfSH" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-tertiary border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-on-surface font-headline">Principal James Decker</h4>
                    <span className="text-[10px] font-label text-on-surface-variant/60 uppercase">2 mins ago</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1 italic">Internal • Staff Meeting</p>
                      <p className="text-sm text-on-surface-variant line-clamp-1 font-medium">I've reviewed the quarterly metrics you sent over. Let's discuss the... </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-lg">attach_file</span>
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Card 2 */}
            <div className="group bg-surface-container-low p-5 rounded-xl border-l-4 border-transparent hover:bg-surface-container-lowest transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <img className="w-12 h-12 rounded-full object-cover" alt="Sarah Miller" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnMIjhNE-zJspW7Mg-lkeL6L7GKAjQuXmSsJH6cKef-XqscSuWZpu9WkCznpG3fBXgiEwlJvyj5iXUu0ltyi5r0gyqW26WLj13hUYVXC3GIeJAYqYLfs3ao2Z8i7LuJ-HeyuJQTm_H42T0N6Nda5U9mE1hNte6t0Vv6b2UXsaIErcNn6rWRXXIEm7j6VkAWrr7TPNuBhI2k9jqNzSKibvUL3Hg0W1YdVXBoOdsLmCEt1tbuw1tsY05QD_5TxKRJhnR2VjMSBiUKgLt" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-on-surface font-headline">Sarah Miller (Parent)</h4>
                    <span className="text-[10px] font-label text-on-surface-variant/60 uppercase">1 hour ago</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-semibold text-secondary mb-1 italic">Parents • Grade 4-B</p>
                      <p className="text-sm text-on-surface-variant line-clamp-1">Thank you for the update on Leo's progress. We will be sure to attend the conference.</p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant/30 text-lg">done_all</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Card 3 (System Alert) */}
            <div className="group bg-surface-container-low p-5 rounded-xl border-l-4 border-transparent hover:bg-surface-container-lowest transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-on-surface font-headline text-error">System Security Alert</h4>
                    <span className="text-[10px] font-label text-on-surface-variant/60 uppercase">4 hours ago</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-semibold text-error mb-1 italic">System • Security</p>
                      <p className="text-sm text-on-surface-variant line-clamp-1">New login detected from an unrecognized device in Chicago, IL.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Card 4 */}
            <div className="group bg-surface-container-low p-5 rounded-xl border-l-4 border-transparent hover:bg-surface-container-lowest transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <img className="w-12 h-12 rounded-full object-cover" alt="Maria Rodriguez" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8CoyLd9DKKdWU4JEkStlOuGQlrGHwr11oaiZxy0Cyl3yfHn99u2vWoi8kB1DU4YJx4sWji0g9XETtB9Ywn-g-aHrgMirgI8LExO0yfhmqcxRIDyc1ZhM98uWZmyY2OAi6TFoSvXxoAqkKtAD1To9qFx386hy0I0LEsWbZuLPHuYWZpORr-hlhU3-eQYqpndvE0kzzGvhTxwwvHAmnzXAQ-QWBJdK9-Txcw-UZPgmkcklzzhXp1sPQrcZwBEavZjW5UnI1vQxeb90L" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-on-surface font-headline">Maria Rodriguez (Admin)</h4>
                    <span className="text-[10px] font-label text-on-surface-variant/60 uppercase">Yesterday</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1 italic">Internal • Payroll</p>
                      <p className="text-sm text-on-surface-variant line-clamp-1">The updated salary schedules have been uploaded to the portal for review.</p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant/30 text-lg">done_all</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Load More */}
            <div className="pt-4 flex justify-center">
              <button className="px-6 py-2 rounded-full border border-outline-variant/30 text-on-surface-variant font-medium text-sm hover:bg-surface-container-high transition-colors">
                View Older Conversations
              </button>
            </div>
          </section>
        </div>
      </main>
    </PageLayout>
  );
}
