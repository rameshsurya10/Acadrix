import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { udiseService, type UDISEAnnualData } from '@/services/udise/udiseService'
import { adminService, type AcademicYear } from '@/services/admin/adminService'
import { Bone } from '@/components/shared/Skeleton'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GRADE_ROWS = [
  'Pre-Primary', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
]

const ENROLLMENT_COLS = ['boys', 'girls', 'sc', 'st', 'obc', 'general'] as const

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-outline/10 text-on-surface-variant',
  validated: 'bg-tertiary/10 text-tertiary',
  exported: 'bg-primary/10 text-primary',
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function UDISEDataPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [selectedYear, setSelectedYear] = useState<number | ''>('')
  const [annualData, setAnnualData] = useState<UDISEAnnualData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoPopulating, setAutoPopulating] = useState(false)
  const [validating, setValidating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Editable enrollment grid
  const [enrollment, setEnrollment] = useState<Record<string, Record<string, number>>>({})
  // Teacher data
  const [teacherData, setTeacherData] = useState<Record<string, number>>({
    male_teachers: 0, female_teachers: 0,
    trained_teachers: 0, untrained_teachers: 0,
    phd: 0, postgraduate: 0, graduate: 0, diploma: 0,
  })
  // Infrastructure
  const [infra, setInfra] = useState<Record<string, any>>({
    classrooms: 0, labs: 0, toilets_boys: 0, toilets_girls: 0,
    computers: 0, has_internet: false, library_books: 0,
  })
  // Special categories
  const [cwsnCount, setCwsnCount] = useState(0)
  const [rteCount, setRteCount] = useState(0)
  const [minorityCount, setMinorityCount] = useState(0)
  // Facilities
  const [midDayMeal, setMidDayMeal] = useState(false)
  const [hasBoundaryWall, setHasBoundaryWall] = useState(false)
  const [hasRamp, setHasRamp] = useState(false)

  /* ── Load academic years ──────────────────────────── */
  useEffect(() => {
    adminService.getAcademicYears()
      .then(yrs => {
        setAcademicYears(yrs)
        const current = yrs.find(y => y.is_current)
        if (current) setSelectedYear(current.id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  /* ── Load annual data when year changes ───────────── */
  const loadAnnualData = useCallback(async () => {
    if (!selectedYear) return
    setLoading(true)
    setError(null)
    setValidationErrors([])
    try {
      const list = await udiseService.getAnnualData({ academic_year: String(selectedYear) })
      const entry = list.length > 0 ? list[0] : null
      setAnnualData(entry)
      if (entry) {
        setEnrollment(entry.enrollment_data ?? {})
        setTeacherData(entry.teacher_data ?? {})
        setInfra(entry.infrastructure ?? {})
        setCwsnCount(entry.cwsn_count ?? 0)
        setRteCount(entry.rte_count ?? 0)
        setMinorityCount(entry.minority_count ?? 0)
        setMidDayMeal(entry.mid_day_meal ?? false)
        setHasBoundaryWall(entry.has_boundary_wall ?? false)
        setHasRamp(entry.has_ramp ?? false)
      } else {
        resetLocalState()
      }
    } catch {
      setError('Failed to load annual data.')
    } finally {
      setLoading(false)
    }
  }, [selectedYear])

  useEffect(() => { loadAnnualData() }, [loadAnnualData])

  function resetLocalState() {
    const emptyEnrollment: Record<string, Record<string, number>> = {}
    GRADE_ROWS.forEach(g => {
      emptyEnrollment[g] = { boys: 0, girls: 0, sc: 0, st: 0, obc: 0, general: 0 }
    })
    setEnrollment(emptyEnrollment)
    setTeacherData({ male_teachers: 0, female_teachers: 0, trained_teachers: 0, untrained_teachers: 0, phd: 0, postgraduate: 0, graduate: 0, diploma: 0 })
    setInfra({ classrooms: 0, labs: 0, toilets_boys: 0, toilets_girls: 0, computers: 0, has_internet: false, library_books: 0 })
    setCwsnCount(0)
    setRteCount(0)
    setMinorityCount(0)
    setMidDayMeal(false)
    setHasBoundaryWall(false)
    setHasRamp(false)
  }

  /* ── Helpers ──────────────────────────────────────── */

  function updateEnrollment(grade: string, col: string, value: number) {
    setEnrollment(prev => ({
      ...prev,
      [grade]: { ...(prev[grade] ?? {}), [col]: value },
    }))
  }

  function buildPayload(): Partial<UDISEAnnualData> {
    return {
      academic_year: selectedYear as number,
      enrollment_data: enrollment,
      teacher_data: teacherData,
      infrastructure: infra,
      cwsn_count: cwsnCount,
      rte_count: rteCount,
      minority_count: minorityCount,
      mid_day_meal: midDayMeal,
      has_boundary_wall: hasBoundaryWall,
      has_ramp: hasRamp,
    }
  }

  /* ── Actions ──────────────────────────────────────── */

  async function handleSave() {
    if (!selectedYear) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = buildPayload()
      if (annualData) {
        const updated = await udiseService.updateAnnualData(annualData.id, payload)
        setAnnualData(updated)
      } else {
        const created = await udiseService.createAnnualData(payload)
        setAnnualData(created)
      }
      setSuccess('Data saved successfully.')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save data.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAutoPopulate() {
    if (!selectedYear) return
    setAutoPopulating(true)
    setError(null)
    try {
      const populated = await udiseService.autoPopulate({ academic_year: selectedYear as number })
      setAnnualData(populated)
      setEnrollment(populated.enrollment_data ?? {})
      setTeacherData(populated.teacher_data ?? {})
      setInfra(populated.infrastructure ?? {})
      setCwsnCount(populated.cwsn_count ?? 0)
      setRteCount(populated.rte_count ?? 0)
      setMinorityCount(populated.minority_count ?? 0)
      setMidDayMeal(populated.mid_day_meal ?? false)
      setHasBoundaryWall(populated.has_boundary_wall ?? false)
      setHasRamp(populated.has_ramp ?? false)
      setSuccess('Data auto-populated from existing records.')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Auto-populate failed.')
    } finally {
      setAutoPopulating(false)
    }
  }

  async function handleValidate() {
    if (!selectedYear) return
    setValidating(true)
    setError(null)
    setValidationErrors([])
    try {
      const res = await udiseService.validateData({ academic_year: selectedYear as number })
      if (res.valid) {
        setSuccess('All data is valid and complete.')
        await loadAnnualData()
      } else {
        setValidationErrors(res.errors)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Validation failed.')
    } finally {
      setValidating(false)
    }
  }

  async function handleExport() {
    if (!selectedYear) return
    setExporting(true)
    setError(null)
    try {
      await udiseService.exportData({ academic_year: selectedYear as number, format: 'csv' })
      setSuccess('CSV exported successfully.')
      await loadAnnualData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Export failed.')
    } finally {
      setExporting(false)
    }
  }

  /* ── Number input helper ──────────────────────────── */

  function numInput(value: number, onChange: (v: number) => void, ariaLabel: string) {
    return (
      <input
        type="number"
        min={0}
        value={value}
        onChange={e => onChange(Number(e.target.value) || 0)}
        aria-label={ariaLabel}
        className="w-full px-2 py-2 rounded bg-surface-container-low text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    )
  }

  const status = annualData?.status ?? 'draft'
  const badgeCls = STATUS_BADGE[status] ?? STATUS_BADGE.draft

  return (
    <PageLayout sidebar>
      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
                Government Compliance
              </span>
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
                U-DISE Annual Data
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-tight ${badgeCls}`}>
                {status}
              </span>
            </div>
          </div>

          {/* Year selector + actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-3 rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer min-w-[200px]"
              aria-label="Select academic year"
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.label}</option>
              ))}
            </select>

            <button
              onClick={handleAutoPopulate}
              disabled={!selectedYear || autoPopulating}
              className="flex items-center gap-2 bg-tertiary/10 text-tertiary px-4 py-3 rounded-lg font-bold text-sm hover:bg-tertiary/20 transition-colors disabled:opacity-50"
            >
              {autoPopulating
                ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-sm">auto_fix_high</span>}
              Auto-Populate
            </button>

            <button
              onClick={handleValidate}
              disabled={!selectedYear || validating}
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-3 rounded-lg font-bold text-sm hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {validating
                ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-sm">verified</span>}
              Validate
            </button>

            <button
              onClick={handleExport}
              disabled={!selectedYear || exporting}
              className="flex items-center gap-2 bg-surface-container-low text-on-surface px-4 py-3 rounded-lg font-bold text-sm hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              {exporting
                ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-sm">download</span>}
              Export CSV
            </button>
          </div>

          {/* Feedback */}
          {error && (
            <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}
          {success && (
            <div className="bg-tertiary/10 text-tertiary px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {success}
            </div>
          )}
          {validationErrors.length > 0 && (
            <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm space-y-1">
              <p className="font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">warning</span>
                Validation Issues
              </p>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                {validationErrors.map((ve, i) => <li key={i}>{ve}</li>)}
              </ul>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => <Bone key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : !selectedYear ? (
            <div className="bg-surface-container-lowest rounded-xl p-16 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">calendar_month</span>
              <p className="text-on-surface-variant font-medium">Select an academic year to begin</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* ── Enrollment Section ──────────────────── */}
              <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">groups</span>
                  Enrollment Data
                </h3>
                <div className="overflow-x-auto -mx-6 md:mx-0">
                  <table className="w-full min-w-[700px] text-sm" role="table" aria-label="Enrollment data by grade">
                    <thead>
                      <tr className="bg-surface-container-low">
                        <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label rounded-l-lg">Grade</th>
                        {ENROLLMENT_COLS.map(c => (
                          <th key={c} className="px-2 py-3 text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 font-label last:rounded-r-lg">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {GRADE_ROWS.map(grade => (
                        <tr key={grade} className="border-b border-outline-variant/10">
                          <td className="px-3 py-2 font-medium text-on-surface whitespace-nowrap">{grade}</td>
                          {ENROLLMENT_COLS.map(col => (
                            <td key={col} className="px-1 py-1">
                              {numInput(
                                enrollment[grade]?.[col] ?? 0,
                                v => updateEnrollment(grade, col, v),
                                `${grade} ${col}`,
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Teacher Data Section ────────────────── */}
              <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">school</span>
                  Teacher Data
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(teacherData).map(([key, val]) => (
                    <div key={key} className="space-y-1.5">
                      <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                        {key.replace(/_/g, ' ')}
                      </label>
                      {numInput(val, v => setTeacherData(p => ({ ...p, [key]: v })), key.replace(/_/g, ' '))}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Infrastructure Section ──────────────── */}
              <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">apartment</span>
                  Infrastructure
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(['classrooms', 'labs', 'toilets_boys', 'toilets_girls', 'computers', 'library_books'] as const).map(key => (
                    <div key={key} className="space-y-1.5">
                      <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                        {key.replace(/_/g, ' ')}
                      </label>
                      {numInput(
                        infra[key] ?? 0,
                        v => setInfra(p => ({ ...p, [key]: v })),
                        key.replace(/_/g, ' '),
                      )}
                    </div>
                  ))}
                  <div className="flex items-center gap-3 col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={infra.has_internet ?? false}
                        onChange={e => setInfra(p => ({ ...p, has_internet: e.target.checked }))}
                        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-sm font-medium text-on-surface">Internet Connectivity</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Special Categories ──────────────────── */}
              <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">diversity_3</span>
                  Special Categories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block">CWSN Count</label>
                    {numInput(cwsnCount, setCwsnCount, 'CWSN count')}
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block">RTE Count</label>
                    {numInput(rteCount, setRteCount, 'RTE count')}
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Minority Count</label>
                    {numInput(minorityCount, setMinorityCount, 'Minority count')}
                  </div>
                </div>
              </div>

              {/* ── Facilities ──────────────────────────── */}
              <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">check_box</span>
                  Facilities
                </h3>
                <div className="flex flex-wrap gap-6">
                  {([
                    { label: 'Mid-Day Meal', checked: midDayMeal, onChange: setMidDayMeal },
                    { label: 'Boundary Wall', checked: hasBoundaryWall, onChange: setHasBoundaryWall },
                    { label: 'Ramp for Disabled', checked: hasRamp, onChange: setHasRamp },
                  ] as const).map(fac => (
                    <label key={fac.label} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fac.checked}
                        onChange={e => fac.onChange(e.target.checked)}
                        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-sm font-medium text-on-surface">{fac.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Save ───────────────────────────────── */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  Save Data
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  )
}
