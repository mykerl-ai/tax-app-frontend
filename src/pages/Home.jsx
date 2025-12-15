import { Link } from 'react-router-dom'
import { Calculator, FileText, MessageSquare, ArrowRight } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Calculator,
      title: 'Tax Calculator',
      description: 'Calculate your personal income tax',
      link: '/calculator',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      title: 'Bank Statement',
      description: 'Auto-detect income from statements',
      link: '/bank-statement',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: MessageSquare,
      title: 'AI Advisor',
      description: 'Get instant tax advice',
      link: '/ai-chat',
      gradient: 'from-purple-500 to-pink-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-block p-4 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 mb-2">
          <Calculator className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tax Calculator
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm px-4">
          Calculate your personal income tax based on Nigeria Tax Act 2025
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Link
              key={index}
              to={feature.link}
              className="card flex items-center space-x-4 active:scale-98 transition-transform"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <Icon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            </Link>
          )
        })}
      </div>

      {/* Quick Start CTA */}
      <Link
        to="/calculator"
        className="block card bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 shadow-xl shadow-primary-500/30 active:scale-98 transition-transform"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg mb-1">Start Calculating</h2>
            <p className="text-primary-100 text-sm">
              Enter your income and get instant tax calculation
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <ArrowRight className="h-6 w-6" />
          </div>
        </div>
      </Link>
    </div>
  )
}

export default Home
