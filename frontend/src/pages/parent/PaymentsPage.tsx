export default function ParentPaymentsPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24 md:pb-0">
      {/* TopAppBar */}
      <header className="bg-[#f8f9fa] dark:bg-[#191c1d] top-0 sticky z-50">
        <div className="flex justify-between items-center w-full px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#1A73E8] dark:text-[#4874cf]">school</span>
            <span className="text-xl font-black text-[#1A73E8] dark:text-[#4874cf] font-['Manrope']">Editorial Intelligence</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-[#414754] dark:text-[#c1c6d6] font-medium hover:text-[#1A73E8] transition-colors" href="#">Dashboard</a>
            <a className="text-[#414754] dark:text-[#c1c6d6] font-medium hover:text-[#1A73E8] transition-colors" href="#">Modules</a>
            <a className="text-[#414754] dark:text-[#c1c6d6] font-medium hover:text-[#1A73E8] transition-colors" href="#">Schedule</a>
            <a className="text-[#1A73E8] font-bold" href="#">Billing</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
              <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDa70A3eFWDdJJncztEnGquQdpC3E212E8vSz8RUnslDZovnDpieDc2ydAtQsuu-J8YnSfl4x36eFQANhhIZiyB_B1HsqkOo9LTVbCsxrugAgDt3lrY1OjVi-QCRob6NCYTr8n1Tf6z4YGyBS-hJS8zGy-zJiIw4p3sVvlQjeLprayxngb1HwY-KGwMLmUrblPqx7p0pSUviq5i9GUC0zxEx8nuVSB5nmrY0Z5tfHXuRMwhA55MUa5arij7xdJPA3j-9JdIhfsL6eHL" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Editorial Header */}
        <div className="mb-12">
          <p className="font-label text-[0.75rem] uppercase tracking-widest text-on-surface-variant font-medium mb-2">FINANCIAL OVERVIEW</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>Payment Gateway</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Balances & Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Student Selection Bento */}
            <section className="bg-surface-container-low rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                <span className="material-symbols-outlined text-primary">group</span>
                Select Students
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student Card 1 - Selected */}
                <div className="bg-surface-container-lowest p-4 rounded-lg flex items-center justify-between border-2 border-primary">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary-container flex items-center justify-center">
                      <img alt="Student" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoAsHZ3NQK-p3nKZGu8GJSYerE3Rfa4KGooPRBdJ5JEIPdaG5kJG42T3XAU363GMFPLL9paupbXmKlM-OBGYAJ0KCp5nJHE2PGjcv1n1ZIm3y3RQ30J51H-vYVnVyYgZGox2aQdPUUVEzhd4Tk1IeDtGdFy7FLuzmkCy6BNb1_SnbngXoHc_NpxSOEvWJSDdN5Z2yoFvBvCdOnRCBQukAfFJdwUyAmN7Ae7Sm6F5Jkq8xbWk_6b73UDD0C2_7IKaZS4nCHJgzcwexc" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Marcus Thompson</p>
                      <p className="text-sm text-on-surface-variant">Grade 11 • ID: 29401</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                {/* Student Card 2 */}
                <div className="bg-surface-container-lowest p-4 rounded-lg flex items-center justify-between hover:bg-surface-container-high transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary-container flex items-center justify-center">
                      <img alt="Student" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_ZycPhhdYIqym72UPS2KSf7hVwRwndTj6CO8F1fBicOdCIvLYxksT1PFl96yJzE_8AedILPSZhhJReZrl-0jvBiK_f_lDI9M5P-7LgEtUHnuPwQ9wFSRLZt69k9AZFI_lzHDclcZ8fQKX4FM5ZQeJDK14_H57btS_CQhpFO4n5d-GzlY7diXMyj-u4AYP83s3mR139fOeyhMfLb0zC0_z_XWPDgi2p76qqArz1_mccfXvobZTdNMFmp6VXuS3tPnKAeF_JNB2v_T2" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Elena Thompson</p>
                      <p className="text-sm text-on-surface-variant">Grade 8 • ID: 31055</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant">radio_button_unchecked</span>
                </div>
              </div>
            </section>

            {/* Outstanding Fees Table */}
            <section className="bg-surface-container-lowest rounded-xl overflow-hidden">
              <div className="p-6 bg-surface-container-low flex justify-between items-center">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>Outstanding Balances</h2>
                <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-xs font-bold">3 UNPAID ITEMS</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="text-left py-4 px-6 font-label text-xs uppercase tracking-widest text-on-surface-variant">Fee Description</th>
                      <th className="text-left py-4 px-6 font-label text-xs uppercase tracking-widest text-on-surface-variant">Due Date</th>
                      <th className="text-right py-4 px-6 font-label text-xs uppercase tracking-widest text-on-surface-variant">Amount</th>
                      <th className="text-center py-4 px-6 font-label text-xs uppercase tracking-widest text-on-surface-variant">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    <tr className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-on-surface">Tuition Fees - Semester 2</div>
                        <div className="text-xs text-on-surface-variant">Marcus Thompson</div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">Oct 15, 2023</td>
                      <td className="py-4 px-6 text-right font-bold text-on-surface">$2,450.00</td>
                      <td className="py-4 px-6 text-center">
                        <input defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-on-surface">Extracurricular: Basketball Club</div>
                        <div className="text-xs text-on-surface-variant">Marcus Thompson</div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">Oct 20, 2023</td>
                      <td className="py-4 px-6 text-right font-bold text-on-surface">$120.00</td>
                      <td className="py-4 px-6 text-center">
                        <input defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-on-surface">Science Lab Equipment Fee</div>
                        <div className="text-xs text-on-surface-variant">Elena Thompson</div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">Nov 01, 2023</td>
                      <td className="py-4 px-6 text-right font-bold text-on-surface">$45.00</td>
                      <td className="py-4 px-6 text-center">
                        <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Recent Receipts */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold px-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Recent Receipts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest p-5 rounded-lg flex items-center gap-4 group hover:bg-surface-container-low transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface">Receipt #EI-9921</p>
                    <p className="text-xs text-on-surface-variant">Paid on Sep 12, 2023</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$450.00</p>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant group-hover:text-primary transition-colors">Download</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-5 rounded-lg flex items-center gap-4 group hover:bg-surface-container-low transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface">Receipt #EI-9844</p>
                    <p className="text-xs text-on-surface-variant">Paid on Aug 30, 2023</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$1,200.00</p>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant group-hover:text-primary transition-colors">Download</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Payment Details */}
          <div className="space-y-8">
            {/* Summary Card */}
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
              <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>Payment Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Selected Items (2)</span>
                  <span>$2,570.00</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Processing Fee</span>
                  <span>$0.00</span>
                </div>
                <div className="pt-4 border-t border-surface-container-low flex justify-between items-end">
                  <span className="font-bold text-on-surface">Total Amount</span>
                  <span className="text-3xl font-black text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>$2,570.00</span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-medium">Payment Method</p>
                <div className="space-y-3">
                  <label className="flex items-center p-4 rounded-lg border-2 border-primary bg-primary-container/5 cursor-pointer">
                    <input defaultChecked className="w-4 h-4 text-primary focus:ring-primary border-outline-variant" name="payment_method" type="radio" />
                    <div className="ml-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
                      <div>
                        <p className="font-bold text-sm">Visa ending in 4429</p>
                        <p className="text-xs text-on-surface-variant">Exp: 12/25</p>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 rounded-lg border border-surface-container-low hover:bg-surface-container-low transition-colors cursor-pointer">
                    <input className="w-4 h-4 text-primary focus:ring-primary border-outline-variant" name="payment_method" type="radio" />
                    <div className="ml-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
                      <div>
                        <p className="font-bold text-sm">Bank Transfer</p>
                        <p className="text-xs text-on-surface-variant">ACH • Direct Debit</p>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 rounded-lg border border-surface-container-low hover:bg-surface-container-low transition-colors cursor-pointer">
                    <input className="w-4 h-4 text-primary focus:ring-primary border-outline-variant" name="payment_method" type="radio" />
                    <div className="ml-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#003087]">payments</span>
                      <div>
                        <p className="font-bold text-sm">PayPal</p>
                        <p className="text-xs text-on-surface-variant">Connect your account</p>
                      </div>
                    </div>
                  </label>
                </div>
                <button className="w-full mt-6 py-4 px-6 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg transition-all transform active:scale-[0.98]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  Pay Now
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Secure SSL Encrypted Transaction</span>
                </div>
              </div>
            </div>

            {/* Promo Card */}
            <div className="bg-secondary-container rounded-xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-on-secondary-container mb-2">Flexible Payment Plans</h4>
                <p className="text-sm text-on-secondary-container/80 mb-4">Break down large tuition fees into manageable monthly installments.</p>
                <a className="text-sm font-bold text-primary flex items-center gap-1" href="#">
                  Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
              <span className="absolute -bottom-6 -right-6 material-symbols-outlined text-8xl text-on-secondary-container/5 rotate-12">calendar_month</span>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-2xl bg-[#ffffff] dark:bg-[#1f2122] shadow-[0_-4px_32px_rgba(25,28,29,0.04)]">
        <div className="flex justify-around items-center w-full h-20 px-4">
          <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Dashboard</span>
          </div>
          <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1">
            <span className="material-symbols-outlined">extension</span>
            <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Modules</span>
          </div>
          <div className="flex flex-col items-center justify-center text-[#414754] dark:text-[#c1c6d6] px-4 py-1">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Schedule</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-[#cfe6f2] dark:bg-[#2b5ab5]/20 text-[#2b5ab5] dark:text-[#4874cf] rounded-xl px-4 py-1">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            <span className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest mt-1">Billing</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
