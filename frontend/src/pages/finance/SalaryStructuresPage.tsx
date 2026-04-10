import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { hrService, type SalaryStructure, type StaffProfile } from '@/services/hr/hrService'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val)
}

export default function SalaryStructuresPage() {
  const [structures, setStructures] = useState<SalaryStructure[]>([])
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form
  const [showForm, setShowForm] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formUser, setFormUser] = useState<number | ''>('')
  const [formBasic, setFormBasic] = useState('')
  const [formHra, setFormHra] = useState('')
  const [formDa, setFormDa] = useState('')
  const [formConveyance, setFormConveyance] = useState('')
  const [formMedical, setFormMedical] = useState('')
  const [formSpecial, setFormSpecial] = useState('')
  const [formPf, setFormPf] = useState('12')
  const [formEsi, setFormEsi] = useState('0.75')
  const [formPt, setFormPt] = useState('200')
  const [formTds, setFormTds] = useState('10')
  const [formEffective, setFormEffective] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [structData, staffData] = await Promise.all([
        hrService.getSalaryStructures(),
        hrService.getStaff(),
      ])
      setStructures(structData)
      setStaff(staffData)
    } catch {
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function resetForm() {
    setFormUser('')
    setFormBasic('')
    setFormHra('')
    setFormDa('')
    setFormConveyance('')
    setFormMedical('')
    setFormSpecial('')
    setFormPf('12')
    setFormEsi('0.75')
    setFormPt('200')
    setFormTds('10')
    setFormEffective('')
    setShowForm(false)
    setError('')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!formUser) { setError('Please select an employee.'); return }
    if (!formBasic || Number(formBasic) <= 0) { setError('Basic salary is required.'); return }
    if (!formEffective) { setError('Effective date is required.'); return }

    setFormSaving(true)
    setError('')
    try {
      const created = await hrService.createSalaryStructure({
        user: Number(formUser),
        basic: Number(formBasic),
        hra: Number(formHra) || 0,
        da: Number(formDa) || 0,
        conveyance: Number(formConveyance) || 0,
        medical: Number(formMedical) || 0,
        special_allowance: Number(formSpecial) || 0,
        pf_employee_pct: Number(formPf) || 0,
        esi_employee_pct: Number(formEsi) || 0,
        professional_tax: Number(formPt) || 0,
        tds_pct: Number(formTds) || 0,
        effective_from: formEffective,
      })
      setStructures((prev) => [created, ...prev])
      setSuccess('Salary structure created successfully.')
      resetForm()
    } catch {
      setError('Failed to create salary structure.')
    } finally {
      setFormSaving(false)
    }
  }

  return (
    <PageLayout>
      <div className="px-4 md:px-8 py-8">
        <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
          Finance
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface">
            Salary Structures
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-primary text-on-primary font-semibold px-5 py-2.5 text-sm hover:bg-primary/90 transition-colors"
          >
            {showForm ? 'Cancel' : 'New Structure'}
          </button>
        </div>

        {success && (
          <div className="mb-6 rounded-xl bg-tertiary/10 text-tertiary px-5 py-4 text-sm font-medium flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto text-tertiary/70 hover:text-tertiary" aria-label="Dismiss">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-error/10 text-error px-5 py-4 text-sm font-medium flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 p-5 md:p-6 space-y-4"
          >
            <h3 className="font-semibold text-on-surface mb-2">New Salary Structure</h3>

            {/* Employee + Effective Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ssUser" className="block text-sm font-medium text-on-surface-variant mb-1.5">Employee</label>
                <select
                  id="ssUser"
                  value={formUser}
                  onChange={(e) => setFormUser(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Select employee</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.user}>{s.full_name} ({s.employee_id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ssEffective" className="block text-sm font-medium text-on-surface-variant mb-1.5">Effective From</label>
                <input
                  id="ssEffective"
                  type="date"
                  value={formEffective}
                  onChange={(e) => setFormEffective(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Earnings */}
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide pt-2">Earnings</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { id: 'ssBasic', label: 'Basic', value: formBasic, set: setFormBasic },
                { id: 'ssHra', label: 'HRA', value: formHra, set: setFormHra },
                { id: 'ssDa', label: 'DA', value: formDa, set: setFormDa },
                { id: 'ssConv', label: 'Conveyance', value: formConveyance, set: setFormConveyance },
                { id: 'ssMed', label: 'Medical', value: formMedical, set: setFormMedical },
                { id: 'ssSpecial', label: 'Special Allowance', value: formSpecial, set: setFormSpecial },
              ].map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-sm font-medium text-on-surface-variant mb-1.5">{f.label}</label>
                  <input
                    id={f.id}
                    type="number"
                    min={0}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              ))}
            </div>

            {/* Deductions */}
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide pt-2">Deductions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'ssPf', label: 'PF %', value: formPf, set: setFormPf },
                { id: 'ssEsi', label: 'ESI %', value: formEsi, set: setFormEsi },
                { id: 'ssPt', label: 'Prof. Tax', value: formPt, set: setFormPt },
                { id: 'ssTds', label: 'TDS %', value: formTds, set: setFormTds },
              ].map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-sm font-medium text-on-surface-variant mb-1.5">{f.label}</label>
                  <input
                    id={f.id}
                    type="number"
                    min={0}
                    step="0.01"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={formSaving}
                className="rounded-xl bg-primary text-on-primary font-semibold px-6 py-3 text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {formSaving ? 'Creating...' : 'Create Structure'}
              </button>
            </div>
          </form>
        )}

        {/* Structures Table */}
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                  <th className="text-left px-5 py-3.5 font-semibold text-on-surface-variant">Employee</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">Basic</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">HRA</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">DA</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">Gross</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">PF%</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">ESI%</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">PT</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">TDS%</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant">Net</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-on-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-outline-variant/5">
                      {Array.from({ length: 11 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 rounded bg-surface-container-high animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : structures.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-12 text-center text-on-surface-variant">
                      No salary structures yet.
                    </td>
                  </tr>
                ) : (
                  structures.map((s) => (
                    <tr key={s.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-5 py-4 font-medium text-on-surface">{s.user_name ?? `User #${s.user}`}</td>
                      <td className="px-5 py-4 text-right text-on-surface-variant">{formatCurrency(s.basic)}</td>
                      <td className="px-5 py-4 text-right text-on-surface-variant">{formatCurrency(s.hra)}</td>
                      <td className="px-5 py-4 text-right text-on-surface-variant">{formatCurrency(s.da)}</td>
                      <td className="px-5 py-4 text-right font-medium text-on-surface">{formatCurrency(s.gross)}</td>
                      <td className="px-5 py-4 text-right text-on-surface-variant">{s.pf_employee_pct}%</td>
                      <td className="px-5 py-4 text-right text-on-surface-variant">{s.esi_employee_pct}%</td>
                      <td className="px-5 py-4 text-right text-on-surface-variant">{formatCurrency(s.professional_tax)}</td>
                      <td className="px-5 py-4 text-right text-on-surface-variant">{s.tds_pct}%</td>
                      <td className="px-5 py-4 text-right font-semibold text-on-surface">{formatCurrency(s.net)}</td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            s.is_active ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
