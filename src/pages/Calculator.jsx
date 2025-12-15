import { useState } from 'react'
import { Plus, Trash2, Calculator as CalcIcon, Info } from 'lucide-react'
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

  const incomeTypes = [
    { value: 'salary', label: 'Salary' },
    { value: 'business', label: 'Business Income' },
    { value: 'investment', label: 'Investment Income' },
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
    // Validation
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
      toast.success('Tax calculated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to calculate tax')
      console.error(error)
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Calculator</h1>
        <p className="text-gray-600">Calculate your personal income tax based on Nigeria Tax Act 2025</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-6">
          {/* Income Sources */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Income Sources</h2>
            <div className="space-y-4">
              {incomeSources.map((source, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Source {index + 1}</span>
                    {incomeSources.length > 1 && (
                      <button
                        onClick={() => removeIncomeSource(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <select
                    value={source.type}
                    onChange={(e) => updateIncomeSource(index, 'type', e.target.value)}
                    className="input-field"
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
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={source.description}
                    onChange={(e) => updateIncomeSource(index, 'description', e.target.value)}
                    className="input-field"
                  />
                </div>
              ))}
              <button
                onClick={addIncomeSource}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Income Source
              </button>
            </div>
          </div>

          {/* Deductions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Deductions (Annual)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pension Contribution
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={deductions.pension}
                  onChange={(e) => setDeductions({...deductions, pension: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National Housing Fund (NHF)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={deductions.nhf}
                  onChange={(e) => setDeductions({...deductions, nhf: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National Health Insurance (NHIS)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={deductions.nhis}
                  onChange={(e) => setDeductions({...deductions, nhis: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rent Paid (Annual)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={deductions.rentPaid}
                  onChange={(e) => setDeductions({...deductions, rentPaid: e.target.value})}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">20% relief, max N500,000</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Life Assurance Premium
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={deductions.lifeAssurance}
                  onChange={(e) => setDeductions({...deductions, lifeAssurance: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="card">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isInformalSector}
                onChange={(e) => setIsInformalSector(e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                Presumptive Tax Regime (Informal Sector - Section 29)
              </span>
            </label>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            <CalcIcon className="h-5 w-5 mr-2" />
            {loading ? 'Calculating...' : 'Calculate Tax'}
          </button>
        </div>

        {/* Results */}
        <div>
          {result ? (
            <div className="card space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Tax Calculation Results</h2>
              
              {/* Summary */}
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Gross Income</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(result.grossIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Deductions</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(result.deductions.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Taxable Income</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(result.taxableIncome)}
                  </span>
                </div>
                <div className="border-t border-primary-200 pt-2 mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Tax Payable</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(result.taxCalculation.finalTaxPayable)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Net Income</span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(result.netIncome)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tax Breakdown */}
              {result.taxCalculation.breakdown && result.taxCalculation.breakdown.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tax Breakdown by Band</h3>
                  <div className="space-y-2">
                    {result.taxCalculation.breakdown.map((band, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <span className="text-sm text-gray-700">{band.band}</span>
                          <span className="text-xs text-gray-500 ml-2">({band.rate})</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(band.tax)}
                          </div>
                          <div className="text-xs text-gray-500">
                            on {formatCurrency(band.taxableAmount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deductions Breakdown */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Deductions Applied</h3>
                <div className="space-y-2 text-sm">
                  {result.deductions.cra > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consolidated Relief Allowance (CRA)</span>
                      <span className="font-medium">{formatCurrency(result.deductions.cra)}</span>
                    </div>
                  )}
                  {result.deductions.pension > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pension</span>
                      <span className="font-medium">{formatCurrency(result.deductions.pension)}</span>
                    </div>
                  )}
                  {result.deductions.rentRelief > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rent Relief</span>
                      <span className="font-medium">{formatCurrency(result.deductions.rentRelief)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Config Source */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-start text-xs text-gray-500">
                  <Info className="h-4 w-4 mr-2 mt-0.5" />
                  <span>
                    Configuration: {result.configName} ({result.configSource})
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <CalcIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Enter your income and deductions, then click Calculate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Calculator

