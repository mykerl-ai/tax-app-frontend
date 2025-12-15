import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react'
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
      toast.success('Bank statement analyzed successfully!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to analyze statement')
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Statement Analysis</h1>
        <p className="text-gray-600">
          Upload your bank statement (PDF or CSV) and automatically detect income sources and deductions
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Statement</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
              <input
                type="file"
                accept=".pdf,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="font-medium text-gray-700">Click to upload</p>
                    <p className="text-sm text-gray-500">PDF or CSV (max 10MB)</p>
                  </div>
                )}
              </label>
            </div>

            {file && (
              <button
                onClick={() => {
                  setFile(null)
                  setResult(null)
                  document.getElementById('file-upload').value = ''
                }}
                className="mt-4 text-sm text-red-600 hover:text-red-700"
              >
                Remove file
              </button>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="btn-primary w-full mt-6 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Analyze Statement
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>AI extracts transactions from your statement</li>
                  <li>Automatically categorizes income and deductions</li>
                  <li>Detects pension, NHF, NHIS, rent payments</li>
                  <li>Identifies digital asset transactions (ring-fenced)</li>
                  <li>Calculates your tax liability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {result ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Transactions Found</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.extracted.totalTransactions}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Income Sources</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.extracted.incomeSourcesFound}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Deductions Found</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.extracted.deductionsFound}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Crypto Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.extracted.digitalAssetTransactions || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detected Data */}
              {result.detectedData.incomeSources.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-3">Detected Income</h3>
                  <div className="space-y-2">
                    {result.detectedData.incomeSources.map((source, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {source.type.replace('_', ' ')}
                          </p>
                          {source.description && (
                            <p className="text-xs text-gray-500">{source.description}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(source.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deductions */}
              {Object.values(result.detectedData.deductions).some(v => v > 0) && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-3">Detected Deductions</h3>
                  <div className="space-y-2">
                    {result.detectedData.deductions.pension > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pension</span>
                        <span className="text-sm font-medium">{formatCurrency(result.detectedData.deductions.pension)}</span>
                      </div>
                    )}
                    {result.detectedData.deductions.nhf > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">NHF</span>
                        <span className="text-sm font-medium">{formatCurrency(result.detectedData.deductions.nhf)}</span>
                      </div>
                    )}
                    {result.detectedData.deductions.nhis > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">NHIS</span>
                        <span className="text-sm font-medium">{formatCurrency(result.detectedData.deductions.nhis)}</span>
                      </div>
                    )}
                    {result.detectedData.deductions.rentPaid > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rent Paid</span>
                        <span className="text-sm font-medium">{formatCurrency(result.detectedData.deductions.rentPaid)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tax Estimate */}
              {result.taxEstimate && (
                <div className="card bg-primary-50 border-primary-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Tax Estimate</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gross Income</span>
                      <span className="font-medium">{formatCurrency(result.taxEstimate.grossIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tax Payable</span>
                      <span className="text-xl font-bold text-primary-600">
                        {formatCurrency(result.taxEstimate.taxCalculation.finalTaxPayable)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-primary-200">
                      <span className="text-sm font-medium text-gray-700">Net Income</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(result.taxEstimate.netIncome)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Report */}
              {result.analysisReport && result.analysisReport.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-3">Analysis Report</h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {result.analysisReport.map((item, index) => (
                      <p key={index} className="text-xs text-gray-600 py-1 border-b border-gray-100">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Upload a bank statement to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BankStatement

