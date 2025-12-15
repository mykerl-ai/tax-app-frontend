import { Link } from 'react-router-dom'
import { Calculator, FileText, MessageSquare, TrendingUp, Shield, Zap } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Calculator,
      title: 'Tax Calculator',
      description: 'Calculate your personal income tax using Nigeria Tax Act 2025 rates',
      link: '/calculator',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: FileText,
      title: 'Bank Statement Analysis',
      description: 'Upload your bank statement and automatically detect income and deductions',
      link: '/bank-statement',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: MessageSquare,
      title: 'AI Tax Advisor',
      description: 'Get instant answers to your tax questions with AI-powered assistance',
      link: '/ai-chat',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Accurate Calculations',
      description: 'Based on the latest Nigeria Tax Act 2025 with progressive tax bands',
    },
    {
      icon: Shield,
      title: 'Compliance Ready',
      description: 'Automatically handles ring-fencing, reliefs, and exemptions',
    },
    {
      icon: Zap,
      title: 'Fast & Easy',
      description: 'Calculate your tax liability in seconds with an intuitive interface',
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Nigeria Tax Calculator 2025
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Calculate your personal income tax, analyze bank statements, and get AI-powered tax advice
          based on the Nigeria Tax Act 2025
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Link
              key={index}
              to={feature.link}
              className={`${feature.bgColor} rounded-xl p-6 hover:shadow-lg transition-shadow`}
            >
              <Icon className={`h-10 w-10 ${feature.color} mb-4`} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Link>
          )
        })}
      </div>

      {/* Benefits Section */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Use This Calculator?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div key={index} className="text-center">
                <Icon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Start */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
        <p className="text-gray-700 mb-6">
          Get started by calculating your tax liability. Simply enter your income sources and deductions,
          and we'll handle the rest.
        </p>
        <Link to="/calculator" className="btn-primary inline-block">
          Start Calculating
        </Link>
      </div>
    </div>
  )
}

export default Home

