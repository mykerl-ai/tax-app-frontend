import { useState } from 'react'
import { Upload, FileText, CheckCircle, Loader, X } from 'lucide-react'
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Bank Statement</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload your statement to auto-detect income
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

      {/* Results */}
      {result && (
        <div id="results" className="space-y-4">
          {/* Summary */}
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0 shadow-xl">
            <h2 className="font-bold text-lg mb-4">Analysis Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm">
                <p className="text-xs text-primary-100">Transactions</p>
                <p className="text-xl font-bold">{result.extracted.totalTransactions}</p>
              </div>
              <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm">
                <p className="text-xs text-primary-100">Income Found</p>
                <p className="text-xl font-bold">{result.extracted.incomeSourcesFound}</p>
              </div>
              <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm">
                <p className="text-xs text-primary-100">Deductions</p>
                <p className="text-xl font-bold">{result.extracted.deductionsFound}</p>
              </div>
              <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm">
                <p className="text-xs text-primary-100">Crypto</p>
                <p className="text-xl font-bold">{result.extracted.digitalAssetTransactions || 0}</p>
              </div>
            </div>
          </div>

          {/* Income Sources */}
          {result.detectedData.incomeSources.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Detected Income</h3>
              <div className="space-y-2">
                {result.detectedData.incomeSources.map((source, index) => (
                  <div key={index} className="flex justify-between items-center py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                        {source.type.replace('_', ' ')}
                      </p>
                      {source.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{source.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400 ml-3">
                      {formatCurrency(source.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tax Estimate */}
          {result.taxEstimate && (
            <div className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl">
              <h3 className="font-bold text-lg mb-3">Tax Estimate</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-100 text-sm">Gross Income</span>
                  <span className="font-semibold">{formatCurrency(result.taxEstimate.grossIncome || 0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/20">
                  <span className="text-green-100 text-sm">Tax Payable</span>
                  <span className="font-bold text-xl">
                    {formatCurrency(
                      result.taxEstimate.taxCalculation?.finalTaxPayable || 
                      result.taxEstimate.taxPayable || 
                      0
                    )}
                  </span>
                </div>
                {result.taxEstimate.netIncome !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-green-100 text-sm">Net Income</span>
                    <span className="font-bold text-lg text-green-200">
                      {formatCurrency(result.taxEstimate.netIncome)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BankStatement
