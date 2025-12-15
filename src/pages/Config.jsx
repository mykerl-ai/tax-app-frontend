import { useState, useEffect } from 'react'
import { Database, FileText, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { taxAPI } from '../services/api'
import toast from 'react-hot-toast'

const Config = () => {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    bands: false,
    reliefs: false,
    other: false
  })

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const response = await taxAPI.getConfig()
      setConfig(response.data)
    } catch (error) {
      toast.error('Failed to load configuration')
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12">
          <RefreshCw className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading configuration...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Failed to load configuration</p>
          <button onClick={fetchConfig} className="btn-secondary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Tax Configuration</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Current tax rates and settings</p>
      </div>

      {/* Config Info */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {config.source === 'database' ? (
              <Database className="h-5 w-5 text-green-500" />
            ) : (
              <FileText className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">{config.configName}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {config.source === 'database' ? 'Database' : 'Fallback'}
              </p>
            </div>
          </div>
          <button onClick={fetchConfig} className="p-2 rounded-2xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95">
            <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tax Bands - Collapsible */}
      <div className="card">
        <button
          onClick={() => toggleSection('bands')}
          className="w-full flex items-center justify-between"
        >
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Tax Bands</h2>
          {expandedSections.bands ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.bands && (
          <div className="mt-4 space-y-2">
            {config.taxBands.map((band, index) => (
              <div key={index} className="flex justify-between items-center py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {band.min === 0 ? (
                    <>Up to {formatCurrency(band.max)}</>
                  ) : band.max === null || band.max === Infinity ? (
                    <>Above {formatCurrency(band.min)}</>
                  ) : (
                    <>{formatCurrency(band.min)} - {formatCurrency(band.max)}</>
                  )}
                </span>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                  {(band.rate * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reliefs - Collapsible */}
      <div className="card">
        <button
          onClick={() => toggleSection('reliefs')}
          className="w-full flex items-center justify-between"
        >
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Reliefs & Deductions</h2>
          {expandedSections.reliefs ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.reliefs && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
              <span className="text-sm text-gray-700 dark:text-gray-300">Fixed CRA</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(config.reliefs.fixedCRA)}</span>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
              <span className="text-sm text-gray-700 dark:text-gray-300">CRA (% of Gross)</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{(config.reliefs.percentGrossIncomeCRA * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
              <span className="text-sm text-gray-700 dark:text-gray-300">Rent Relief Cap</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(config.reliefs.rentReliefCap)}</span>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
              <span className="text-sm text-gray-700 dark:text-gray-300">Pension Cap</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(config.reliefs.pensionCapFixed)}</span>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
              <span className="text-sm text-gray-700 dark:text-gray-300">Life Assurance Cap</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(config.reliefs.lifeAssuranceCap)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Other Settings - Collapsible */}
      <div className="card">
        <button
          onClick={() => toggleSection('other')}
          className="w-full flex items-center justify-between"
        >
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Other Settings</h2>
          {expandedSections.other ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.other && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
              <span className="text-sm text-gray-700 dark:text-gray-300">Minimum Tax (Gross)</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{(config.minimumTaxRates.gross * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
              <span className="text-sm text-gray-700 dark:text-gray-300">Presumptive Tax Rate</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{(config.presumptiveTaxRate * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
              <span className="text-sm text-gray-700 dark:text-gray-300">Minimum Wage (Annual)</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(config.minimumWageAnnual)}</span>
            </div>
            <div className="flex justify-between py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
              <span className="text-sm text-gray-700 dark:text-gray-300">Digital Asset Ring-Fencing</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {config.digitalAssetRingFencing ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Config
