import { useState } from 'react'
import { Upload, FileText, CheckCircle, Loader, X, TrendingUp, TrendingDown, AlertCircle, Info, DollarSign, PieChart, Calendar, Lightbulb } from 'lucide-react'
import { transactionAPI } from '../services/api'
import toast from 'react-hot-toast'

const BankStatement = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setResult(null)
      } else {
        toast.error('Please upload a PDF or CSV file')
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setLoading(true)
    try {
      const response = await transactionAPI.analyzeStatement(file)
      setResult(response)
      toast.success('Statement analyzed!')
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to analyze statement')
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

  // Calculate insights from the data
  const calculateInsights = () => {
    if (!result) return null

    const incomeSources = result.detectedData.incomeSources || []
    const deductions = result.detectedData.deductions || {}
    const taxEstimate = result.taxEstimate || {}
    
    // Group income by type
    const incomeByType = {}
    let totalIncome = 0
    incomeSources.forEach(source => {
      if (!incomeByType[source.type]) {
        incomeByType[source.type] = { total: 0, count: 0, items: [] }
      }
      incomeByType[source.type].total += source.amount
      incomeByType[source.type].count += 1
      incomeByType[source.type].items.push(source)
      totalIncome += source.amount
    })

    // Calculate total deductions
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0)
    
    // Tax efficiency
    const taxPayable = taxEstimate.taxCalculation?.finalTaxPayable || taxEstimate.taxPayable || 0
    const effectiveTaxRate = totalIncome > 0 ? (taxPayable / totalIncome) * 100 : 0

    // Deduction analysis
    const deductionBreakdown = Object.entries(deductions)
      .filter(([_, amount]) => amount > 0)
      .map(([type, amount]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1'),
        amount,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0
      }))

    // Insights and recommendations
    const insights = []
    
    if (totalDeductions === 0 && totalIncome > 0) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'No Deductions Found',
        message: 'Consider claiming eligible deductions like pension, NHF, NHIS, rent, or life insurance to reduce your tax liability.'
      })
    }

    if (effectiveTaxRate > 20 && totalIncome > 0) {
      insights.push({
        type: 'info',
        icon: Lightbulb,
        title: 'High Tax Rate',
        message: `Your effective tax rate is ${effectiveTaxRate.toFixed(1)}%. Consider maximizing deductions to reduce this.`
      })
    }

    if (incomeByType.business && incomeByType.business.total > 0) {
      insights.push({
        type: 'info',
        icon: Info,
        title: 'Business Income Detected',
        message: 'You may be eligible for business expense deductions. Keep receipts for business-related expenses.'
      })
    }

    if (taxEstimate.exemption) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Tax Exemption',
        message: taxEstimate.exemption
      })
    }

    return {
      incomeByType,
      totalIncome,
      totalDeductions,
      taxPayable,
      effectiveTaxRate,
      deductionBreakdown,
      insights,
      incomeSourceCount: incomeSources.length
    }
  }

  const insights = calculateInsights()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Bank Statement Analysis</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Get intelligent insights from your statement
        </p>
      </div>

      {/* Upload Card */}
      <div className="card">
        <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Upload Statement</h2>
        
        <label
          htmlFor="file-upload"
          className={`block border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
            file
              ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 bg-gray-50 dark:bg-gray-700/50'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-98'}`}
        >
          <input
            type="file"
            accept=".pdf,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={loading}
          />
          {file ? (
            <div className="space-y-3">
              <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400 mx-auto" />
              <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-primary-100 dark:bg-primary-900/30 mx-auto flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Tap to upload</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PDF or CSV (max 10MB)</p>
            </div>
          )}
        </label>

        {file && (
          <button
            onClick={() => {
              setFile(null)
              setResult(null)
              document.getElementById('file-upload').value = ''
            }}
            className="mt-4 w-full py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors flex items-center justify-center"
          >
            <X className="h-4 w-4 mr-2" />
            Remove file
          </button>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="btn-primary w-full mt-4"
        >
          {loading ? (
            <>
              <Loader className="h-5 w-5 mr-2 inline animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 mr-2 inline" />
              Analyze Statement
            </>
          )}
        </button>
      </div>

      {/* Intelligent Results */}
      {result && insights && (
        <div id="results" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-xs mb-1">Total Income</p>
                  <p className="text-2xl font-bold">{formatCurrency(insights.totalIncome)}</p>
                  <p className="text-primary-100 text-xs mt-1">{insights.incomeSourceCount} sources</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs mb-1">Tax Payable</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(insights.taxPayable)}
                  </p>
                  <p className="text-green-100 text-xs mt-1">
                    {insights.effectiveTaxRate.toFixed(1)}% effective rate
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
            </div>
          </div>

          {/* Income Breakdown */}
          {Object.keys(insights.incomeByType).length > 0 && (
            <div className="card">
              <div className="flex items-center mb-4">
                <PieChart className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Income Breakdown</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(insights.incomeByType)
                  .sort(([, a], [, b]) => b.total - a.total)
                  .map(([type, data]) => {
                    const percentage = insights.totalIncome > 0 ? (data.total / insights.totalIncome) * 100 : 0
                    return (
                      <div key={type}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatCurrency(data.total)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {data.count} transaction{data.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Deductions Analysis */}
          {insights.deductionBreakdown.length > 0 && (
            <div className="card">
              <div className="flex items-center mb-4">
                <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Tax Deductions</h3>
              </div>
              <div className="space-y-2">
                {insights.deductionBreakdown.map((deduction, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 rounded-2xl bg-green-50 dark:bg-green-900/20">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {deduction.type}
                    </span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(deduction.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Total Deductions</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(insights.totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Insights & Recommendations */}
          {insights.insights.length > 0 && (
            <div className="card">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Insights & Recommendations</h3>
              </div>
              <div className="space-y-3">
                {insights.insights.map((insight, index) => {
                  const Icon = insight.icon
                  const colorClasses = {
                    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
                    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  }
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-2xl border ${colorClasses[insight.type] || colorClasses.info}`}
                    >
                      <div className="flex items-start">
                        <Icon className={`h-5 w-5 mt-0.5 mr-2 ${
                          insight.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                          insight.type === 'success' ? 'text-green-600 dark:text-green-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {insight.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {insight.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tax Summary */}
          {result.taxEstimate && (
            <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl">
              <h3 className="font-bold text-lg mb-4">Tax Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100 text-sm">Gross Income</span>
                  <span className="font-semibold">{formatCurrency(result.taxEstimate.grossIncome || 0)}</span>
                </div>
                {insights.totalDeductions > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-100 text-sm">Total Deductions</span>
                    <span className="font-semibold">-{formatCurrency(insights.totalDeductions)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-white/20">
                  <span className="text-emerald-100 text-sm">Taxable Income</span>
                  <span className="font-semibold">
                    {formatCurrency(result.taxEstimate.taxableIncome || result.taxEstimate.grossIncome || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/30">
                  <span className="text-emerald-100">Tax Payable</span>
                  <span className="font-bold text-2xl">
                    {formatCurrency(
                      result.taxEstimate.taxCalculation?.finalTaxPayable || 
                      result.taxEstimate.taxPayable || 
                      0
                    )}
                  </span>
                </div>
                {result.taxEstimate.netIncome !== undefined && (
                  <div className="flex justify-between items-center pt-2 border-t border-white/20">
                    <span className="text-emerald-100 text-sm">Net Income (After Tax)</span>
                    <span className="font-bold text-xl text-emerald-200">
                      {formatCurrency(result.taxEstimate.netIncome)}
                    </span>
                  </div>
                )}
                {result.taxEstimate.exemption && (
                  <div className="mt-3 p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <p className="text-xs text-emerald-100">{result.taxEstimate.exemption}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Stats */}
          <div className="card bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Analyzed {result.extracted.totalTransactions} transactions • 
              {result.extracted.incomeSourcesFound} income sources • 
              {result.extracted.deductionsFound} deduction types
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BankStatement
