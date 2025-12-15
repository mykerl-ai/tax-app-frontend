import { useState } from 'react'
import { Plus, Trash2, Calculator as CalcIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { taxAPI } from '../services/api'
import toast from 'react-hot-toast'

const Calculator = () => {
  const [incomeSources, setIncomeSources] = useState([
    { type: 'salary', amount: '', description: '' }
  ])
  const [deductions, setDeductions] = useState({
    pension: '',
    nhf: '',
    nhis: '',
    rentPaid: '',
    lifeAssurance: ''
  })
  const [isInformalSector, setIsInformalSector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [showDeductions, setShowDeductions] = useState(false)

  const incomeTypes = [
    { value: 'salary', label: 'Salary' },
    { value: 'business', label: 'Business' },
    { value: 'investment', label: 'Investment' },
    { value: 'digital_asset', label: 'Digital Asset' },
    { value: 'other', label: 'Other' },
  ]

  const addIncomeSource = () => {
    setIncomeSources([...incomeSources, { type: 'salary', amount: '', description: '' }])
  }

  const removeIncomeSource = (index) => {
    setIncomeSources(incomeSources.filter((_, i) => i !== index))
  }

  const updateIncomeSource = (index, field, value) => {
    const updated = [...incomeSources]
    updated[index][field] = value
    setIncomeSources(updated)
  }

  const handleCalculate = async () => {
    const validSources = incomeSources.filter(s => s.amount && parseFloat(s.amount) > 0)
    if (validSources.length === 0) {
      toast.error('Please add at least one income source')
      return
    }

    setLoading(true)
    try {
      const data = {
        incomeSources: validSources.map(s => ({
          type: s.type,
          amount: parseFloat(s.amount),
          description: s.description || `${s.type} income`
        })),
        deductions: Object.fromEntries(
          Object.entries(deductions).map(([key, value]) => [key, value ? parseFloat(value) : 0])
        ),
        isInformalSector
      }

      const response = await taxAPI.calculate(data)
      setResult(response.data)
      toast.success('Tax calculated!')
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to calculate tax')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Tax Calculator</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Enter your income and deductions</p>
      </div>

      {/* Income Sources */}
      <div className="card space-y-4">
        <h2 className="font-bold text-gray-900 dark:text-white text-lg">Income Sources</h2>
        <div className="space-y-4">
          {incomeSources.map((source, index) => (
            <div key={index} className="space-y-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Source {index + 1}</span>
                {incomeSources.length > 1 && (
                  <button
                    onClick={() => removeIncomeSource(index)}
                    className="p-1.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <select
                value={source.type}
                onChange={(e) => updateIncomeSource(index, 'type', e.target.value)}
                className="input-field text-sm"
              >
                {incomeTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount (NGN)"
                value={source.amount}
                onChange={(e) => updateIncomeSource(index, 'amount', e.target.value)}
                className="input-field text-sm"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={source.description}
                onChange={(e) => updateIncomeSource(index, 'description', e.target.value)}
                className="input-field text-sm"
              />
            </div>
          ))}
          <button
            onClick={addIncomeSource}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-gray-600 dark:text-gray-400 hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center justify-center active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Income Source
          </button>
        </div>
      </div>

      {/* Deductions - Collapsible */}
      <div className="card">
        <button
          onClick={() => setShowDeductions(!showDeductions)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Deductions</h2>
          {showDeductions ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {showDeductions && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Pension
              </label>
              <input
                type="number"
                placeholder="0"
                value={deductions.pension}
                onChange={(e) => setDeductions({...deductions, pension: e.target.value})}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                NHF
              </label>
              <input
                type="number"
                placeholder="0"
                value={deductions.nhf}
                onChange={(e) => setDeductions({...deductions, nhf: e.target.value})}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                NHIS
              </label>
              <input
                type="number"
                placeholder="0"
                value={deductions.nhis}
                onChange={(e) => setDeductions({...deductions, nhis: e.target.value})}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Rent Paid (Annual)
              </label>
              <input
                type="number"
                placeholder="0"
                value={deductions.rentPaid}
                onChange={(e) => setDeductions({...deductions, rentPaid: e.target.value})}
                className="input-field text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">20% relief, max ₦500k</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Life Assurance
              </label>
              <input
                type="number"
                placeholder="0"
                value={deductions.lifeAssurance}
                onChange={(e) => setDeductions({...deductions, lifeAssurance: e.target.value})}
                className="input-field text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="card">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isInformalSector}
            onChange={(e) => setIsInformalSector(e.target.checked)}
            className="h-5 w-5 text-primary-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          />
          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
            Presumptive Tax (Informal Sector)
          </span>
        </label>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={loading}
        className="btn-primary w-full"
      >
        <CalcIcon className="h-5 w-5 mr-2 inline" />
        {loading ? 'Calculating...' : 'Calculate Tax'}
      </button>

      {/* Results */}
      {result && (
        <div id="results" className="space-y-4">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0 shadow-xl">
            {(result.regime || result.exemption) && (
              <div className="mb-4 p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <p className="text-sm font-semibold">{result.regime || result.exemption}</p>
                {result.effectiveRate && (
                  <p className="text-xs text-primary-100 mt-1">Rate: {result.effectiveRate}</p>
                )}
              </div>
            )}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-primary-100 text-sm">Gross Income</span>
                <span className="font-bold text-lg">{formatCurrency(result.grossIncome || 0)}</span>
              </div>
              {result.deductions && (
                <div className="flex justify-between items-center">
                  <span className="text-primary-100 text-sm">Deductions</span>
                  <span className="font-semibold">{formatCurrency(result.deductions.total || 0)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-white/20">
                <span className="text-primary-100 text-sm">Tax Payable</span>
                <span className="font-bold text-2xl">
                  {formatCurrency(
                    result.taxCalculation?.finalTaxPayable || result.taxPayable || 0
                  )}
                </span>
              </div>
              {result.netIncome !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-primary-100 text-sm">Net Income</span>
                  <span className="font-bold text-xl text-green-200">
                    {formatCurrency(result.netIncome)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tax Breakdown */}
          {result.taxCalculation?.breakdown && result.taxCalculation.breakdown.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Tax Breakdown</h3>
              <div className="space-y-2">
                {result.taxCalculation.breakdown.map((band, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{band.band}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({band.rate})</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(band.tax)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Calculator
