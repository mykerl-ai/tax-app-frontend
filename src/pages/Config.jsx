import { useState, useEffect } from 'react'
import { Settings, Database, FileText, RefreshCw } from 'lucide-react'
import { taxAPI } from '../services/api'
import toast from 'react-hot-toast'

const Config = () => {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const response = await taxAPI.getConfig()
      setConfig(response.data)
    } catch (error) {
      toast.error('Failed to load configuration')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Loading configuration...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-gray-500">Failed to load configuration</p>
          <button onClick={fetchConfig} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Configuration</h1>
        <p className="text-gray-600">Current tax rates and settings</p>
      </div>

      {/* Config Info */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {config.source === 'database' ? (
              <Database className="h-5 w-5 text-green-600" />
            ) : (
              <FileText className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{config.configName}</h2>
              <p className="text-sm text-gray-500">
                Source: {config.source === 'database' ? 'Database' : 'Hardcoded Fallback'}
              </p>
            </div>
          </div>
          <button onClick={fetchConfig} className="btn-secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Effective Date:</span>
            <span className="ml-2 font-medium">{config.effectiveDate}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium">
              {new Date(config.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tax Bands */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tax Bands (Annual Income)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Income Range</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">Rate</th>
              </tr>
            </thead>
            <tbody>
              {config.taxBands.map((band, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {band.min === 0 ? (
                      <>Up to {formatCurrency(band.max)}</>
                    ) : band.max === null || band.max === Infinity ? (
                      <>Above {formatCurrency(band.min)}</>
                    ) : (
                      <>{formatCurrency(band.min)} - {formatCurrency(band.max)}</>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                    {(band.rate * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reliefs */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reliefs & Deductions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Fixed CRA</span>
              <span className="text-sm font-medium">{formatCurrency(config.reliefs.fixedCRA)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">CRA (% of Gross)</span>
              <span className="text-sm font-medium">{(config.reliefs.percentGrossIncomeCRA * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Additional CRA</span>
              <span className="text-sm font-medium">{(config.reliefs.additionalPercentGrossIncomeCRA * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Rent Relief Cap</span>
              <span className="text-sm font-medium">{formatCurrency(config.reliefs.rentReliefCap)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Pension Cap</span>
              <span className="text-sm font-medium">{formatCurrency(config.reliefs.pensionCapFixed)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Life Assurance Cap</span>
              <span className="text-sm font-medium">{formatCurrency(config.reliefs.lifeAssuranceCap)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">NHF Rate (Monthly)</span>
              <span className="text-sm font-medium">{(config.reliefs.nhfRate * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">NHF Cap (Monthly)</span>
              <span className="text-sm font-medium">{formatCurrency(config.reliefs.nhfCap)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">NHIS Rate (Monthly)</span>
              <span className="text-sm font-medium">{(config.reliefs.nhisRate * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">NHIS Cap (Monthly)</span>
              <span className="text-sm font-medium">{formatCurrency(config.reliefs.nhisCap)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Other Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Other Settings</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Minimum Tax Rate (Gross)</span>
              <span className="text-sm font-medium">{(config.minimumTaxRates.gross * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Minimum Tax Rate (Adjusted)</span>
              <span className="text-sm font-medium">{(config.minimumTaxRates.adjusted * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Presumptive Tax Rate</span>
              <span className="text-sm font-medium">{(config.presumptiveTaxRate * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Minimum Wage (Annual)</span>
              <span className="text-sm font-medium">{formatCurrency(config.minimumWageAnnual)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Digital Asset Ring-Fencing</span>
              <span className="text-sm font-medium">
                {config.digitalAssetRingFencing ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Config

