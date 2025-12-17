import { useState, useEffect } from 'react'
import { Upload, FileText, CheckCircle, Loader, X, TrendingUp, TrendingDown, AlertCircle, Info, DollarSign, PieChart, Calendar, Lightbulb, Target, AlertTriangle, CheckCircle2, ArrowRight, BookOpen, Shield } from 'lucide-react'
import { transactionAPI } from '../services/api'
import toast from 'react-hot-toast'
import StreamingText from '../components/StreamingText'

const BankStatement = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState({ stage: '', message: '', progress: 0 })
  const [streamingData, setStreamingData] = useState({ analysis: null, taxEstimate: null, taxAdvisory: null })
  const [streamingTexts, setStreamingTexts] = useState([]) // Array of streaming text items

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
    setProgress({ stage: 'starting', message: 'Starting analysis...', progress: 0 })
    setStreamingData({ analysis: null, taxEstimate: null, taxAdvisory: null })
    setStreamingTexts([]) // Reset streaming texts
    setResult(null)

    try {
      // Use streaming API for real-time updates
      await transactionAPI.analyzeStatementStream(
        file,
        // onProgress
        (data) => {
          setProgress(data)
          if (data.extracted) {
            setStreamingData(prev => ({ ...prev, extracted: data.extracted }))
          }
        },
        // onAnalysis
        (data) => {
          setStreamingData(prev => ({ ...prev, analysis: data }))
          setResult(prev => ({
            ...prev,
            detectedData: {
              incomeSources: data.incomeSources || [],
              deductions: data.deductions || {},
            },
            extracted: {
              totalTransactions: data.summary?.totalIncomeSources || 0,
              incomeSourcesFound: data.summary?.totalIncomeSources || 0,
              deductionsFound: Object.keys(data.deductions || {}).filter(k => data.deductions[k] > 0).length,
            }
          }))
        },
        // onTaxEstimate
        (data) => {
          setStreamingData(prev => ({ ...prev, taxEstimate: data }))
          setResult(prev => ({ ...prev, taxEstimate: data }))
        },
        // onTaxAdvisory
        (data) => {
          setStreamingData(prev => ({ ...prev, taxAdvisory: data }))
          setResult(prev => ({ ...prev, taxAdvisory: data }))
        },
        // onComplete
        (data) => {
          setResult(data)
          setLoading(false)
          toast.success('Statement analyzed!')
          setTimeout(() => {
            document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        },
        // onError
        (data) => {
          console.error('Streaming error:', data)
          setLoading(false)
          toast.error(data.error || 'Failed to analyze statement')
        },
        // onText (streaming text chunks) - ChatGPT-like typing effect
        (data) => {
          console.log('📝 Received text chunk:', { type: data.type, length: data.text?.length, isComplete: data.isComplete })
          setStreamingTexts(prev => {
            // Find existing item by type and title
            const existingIndex = prev.findIndex(item => 
              item.type === data.type && 
              item.data?.title === data.data?.title
            )
            
            if (existingIndex >= 0) {
              // Update existing text (server sends cumulative text)
              const updated = [...prev]
              updated[existingIndex] = { 
                ...updated[existingIndex], 
                text: data.text || '', // Server sends cumulative text
                isComplete: data.isComplete === true
              }
              return updated
            } else {
              // Add new text item
              return [...prev, { 
                id: `${data.type}-${data.data?.title || Date.now()}-${Math.random()}`, 
                type: data.type,
                text: data.text || '',
                isComplete: data.isComplete === true,
                data: data.data
              }]
            }
          })
        }
      )
    } catch (error) {
      console.error('Upload error:', error)
      setLoading(false)
      toast.error(error.message || 'Failed to analyze statement')
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


      {/* Streaming Text Display - Shows AI extraction progress */}
      {streamingTexts.length > 0 && !result && (
        <div className="card border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {streamingTexts.some(item => !item.isComplete) 
                ? 'Reading your transactions...' 
                : 'Extraction complete'}
            </h3>
          </div>
          <div className="space-y-3">
            {streamingTexts.map((item, index) => {
              // For json_extraction, show a cleaner summary
              if (item.type === 'json_extraction') {
                const txCount = (item.text?.match(/"date"/g) || []).length
                const lastTx = item.text?.match(/\{"date":"([^"]+)","description":"([^"]{0,40})/g)?.slice(-1)[0]
                const lastDesc = lastTx ? lastTx.match(/"description":"([^"]{0,40})/)?.[1] : ''
                
                return (
                  <div key={item.id || index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Found <span className="font-bold text-primary-600 dark:text-primary-400">{txCount}</span> transactions so far
                      </span>
                      {!item.isComplete && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 animate-pulse">extracting...</span>
                      )}
                    </div>
                    {lastDesc && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        Latest: {lastDesc}...
                      </p>
                    )}
                    {/* Show mini preview of raw data in collapsed format */}
                    <details className="group">
                      <summary className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400">
                        View raw data
                      </summary>
                      <div className="mt-2 p-3 bg-gray-900 dark:bg-black rounded-xl overflow-auto max-h-48">
                        <code className="text-[10px] text-gray-400 whitespace-pre-wrap break-all">
                          {item.text?.slice(-500) || ''}
                          {!item.isComplete && <span className="text-primary-400 animate-pulse">|</span>}
                        </code>
                      </div>
                    </details>
                  </div>
                )
              }
              
              // For other types, show normally
              return (
                <div
                  key={item.id || index}
                  className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
                >
                  {item.data?.title && (
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                      <span className="text-primary-600 dark:text-primary-400">🤖</span>
                      {item.data.title}
                    </h4>
                  )}
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {item.text || ''}
                    {!item.isComplete && (
                      <span className="animate-pulse text-primary-600 dark:text-primary-400 ml-1">|</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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

          {/* Debug: Show if taxAdvisory is missing */}
          {!result.taxAdvisory && (
            <div className="card border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Tax Advisory Not Available</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The tax advisory service may not be running. Please check the server logs or restart the backend server.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Response keys: {Object.keys(result).join(', ')}
              </p>
            </div>
          )}

      {/* Streaming Text Display - ChatGPT-like typing effect from OpenAI */}
      {streamingTexts.length > 0 && result && (
        <div className="card border-2 border-primary-200 dark:border-primary-800">
              <div className="flex items-center mb-4">
                <Loader className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 animate-spin" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {streamingTexts.some(item => !item.isComplete) 
                    ? 'AI is generating recommendations...' 
                    : 'AI Recommendations'}
                </h3>
              </div>
              <div className="space-y-4">
                {streamingTexts.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`p-4 rounded-2xl border ${
                      item.type === 'warning' || item.type === 'ai_recommendation'
                        ? item.type === 'warning'
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                          : 'bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-200 dark:border-primary-800'
                        : item.type === 'json_extraction'
                          ? 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 font-mono'
                          : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                    }`}
                  >
                    {item.data?.title && (
                      <h4 className="font-bold text-gray-900 dark:text-white text-base mb-3 flex items-center gap-2">
                        {item.type === 'ai_recommendation' && (
                          <span className="text-primary-600 dark:text-primary-400">🤖</span>
                        )}
                        {item.type === 'json_extraction' && (
                          <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">Thinking</span>
                        )}
                        {item.data.title}
                      </h4>
                    )}
                    <div className={`whitespace-pre-wrap leading-relaxed ${
                      item.type === 'json_extraction'
                        ? 'text-gray-400 dark:text-gray-500 text-xs font-mono opacity-80'
                        : 'text-sm text-gray-900 dark:text-white'
                    }`}>
                      {item.text || ''}
                      {!item.isComplete && (
                        <span className="animate-pulse text-primary-600 dark:text-primary-400 ml-1">|</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Tax Advisory */}
          {result.taxAdvisory && (
            <>
              {/* Tax Optimization Opportunities */}
              {result.taxAdvisory.opportunities && result.taxAdvisory.opportunities.length > 0 && (
                <div className="card border-2 border-primary-200 dark:border-primary-800">
                  <div className="flex items-center mb-4">
                    <Target className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Tax Optimization Opportunities</h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    Actionable strategies to legally reduce your tax liability
                  </p>
                  <div className="space-y-4">
                    {result.taxAdvisory.opportunities.map((opp, index) => {
                      const priorityColors = {
                        high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                        medium: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
                        low: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-2xl border ${priorityColors[opp.priority] || priorityColors.medium}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  opp.priority === 'high' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                                  opp.priority === 'medium' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
                                  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                }`}>
                                  {opp.priority.toUpperCase()} PRIORITY
                                </span>
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">
                                  {opp.category.replace('_', ' ')}
                                </span>
                              </div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                                {opp.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {opp.description}
                              </p>
                              {opp.potentialSavings > 0 && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 mb-3">
                                  <p className="text-xs text-green-700 dark:text-green-300 font-semibold mb-1">
                                    Potential Annual Savings
                                  </p>
                                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(opp.potentialSavings)}
                                  </p>
                                  {opp.annualBenefit && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                      {opp.annualBenefit}
                                    </p>
                                  )}
                                </div>
                              )}
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-2">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  Recommended Action:
                                </p>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {opp.action}
                                </p>
                              </div>
                              {opp.legalReference && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <BookOpen className="h-3 w-3" />
                                  <span>Legal Reference: {opp.legalReference}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Warnings & Risk Assessment */}
              {result.taxAdvisory.warnings && result.taxAdvisory.warnings.length > 0 && (
                <div className="card border-2 border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Important Warnings</h3>
                  </div>
                  <div className="space-y-3">
                    {result.taxAdvisory.warnings.map((warning, index) => {
                      const severityColors = {
                        high: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800',
                        medium: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800',
                        low: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800'
                      }
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-2xl border ${severityColors[warning.severity] || severityColors.medium}`}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                              warning.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                              warning.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-orange-600 dark:text-orange-400'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  warning.severity === 'high' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                                  warning.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' :
                                  'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                                }`}>
                                  {warning.severity.toUpperCase()} RISK
                                </span>
                              </div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                                {warning.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {warning.description}
                              </p>
                              {warning.details && Array.isArray(warning.details) && (
                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mb-2 space-y-1">
                                  {warning.details.map((detail, idx) => (
                                    <li key={idx}>{typeof detail === 'string' ? detail : detail.issue || detail}</li>
                                  ))}
                                </ul>
                              )}
                              {warning.taxImpact && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2 mb-2">
                                  <p className="text-xs text-blue-700 dark:text-blue-300">
                                    <strong>Tax Impact:</strong> {warning.taxImpact}
                                  </p>
                                </div>
                              )}
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  Action Required:
                                </p>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {warning.action}
                                </p>
                              </div>
                              {warning.legalReference && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  <BookOpen className="h-3 w-3" />
                                  <span>{warning.legalReference}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              {result.taxAdvisory.riskAssessment && (
                <div className={`card border-2 ${
                  result.taxAdvisory.riskAssessment.level === 'high' ? 'border-red-200 dark:border-red-800' :
                  result.taxAdvisory.riskAssessment.level === 'medium' ? 'border-yellow-200 dark:border-yellow-800' :
                  'border-green-200 dark:border-green-800'
                }`}>
                  <div className="flex items-center mb-4">
                    <Shield className={`h-5 w-5 mr-2 ${
                      result.taxAdvisory.riskAssessment.level === 'high' ? 'text-red-600 dark:text-red-400' :
                      result.taxAdvisory.riskAssessment.level === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`} />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Risk Assessment</h3>
                  </div>
                  <div className={`p-4 rounded-2xl mb-3 ${
                    result.taxAdvisory.riskAssessment.level === 'high' ? 'bg-red-50 dark:bg-red-900/20' :
                    result.taxAdvisory.riskAssessment.level === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                    'bg-green-50 dark:bg-green-900/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        result.taxAdvisory.riskAssessment.level === 'high' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                        result.taxAdvisory.riskAssessment.level === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' :
                        'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                      }`}>
                        {result.taxAdvisory.riskAssessment.level.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white mb-2">
                      {result.taxAdvisory.riskAssessment.recommendation}
                    </p>
                    {result.taxAdvisory.riskAssessment.factors && result.taxAdvisory.riskAssessment.factors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Risk Factors Identified:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {result.taxAdvisory.riskAssessment.factors.map((factor, idx) => (
                            <li key={idx}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actionable Next Steps */}
              {result.taxAdvisory.nextSteps && result.taxAdvisory.nextSteps.length > 0 && (
                <div className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-2 border-primary-200 dark:border-primary-800">
                  <div className="flex items-center mb-4">
                    <ArrowRight className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Actionable Next Steps</h3>
                  </div>
                  <div className="space-y-3">
                    {result.taxAdvisory.nextSteps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-primary-200 dark:border-primary-800"
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          step.priority === 1 ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                          step.priority === 2 ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
                          step.priority === 3 ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' :
                          'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        }`}>
                          {step.priority}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                            {step.action}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {step.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              📅 {step.timeline}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              step.impact === 'High' || step.impact?.includes('Critical') ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                              step.impact === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' :
                              'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                            }`}>
                              Impact: {step.impact}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
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
