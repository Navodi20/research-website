import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'

export default function Home() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Advanced <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Hybrid Recommender
              </span> System
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Leveraging XGBoost, Deep Learning, and Collaborative Filtering for Next-Generation Recommendations
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/demo"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                Try Demo <FiArrowRight />
              </Link>
              <Link
                to="/research"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Read Research
              </Link>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-4xl font-bold text-blue-600 mb-2">95.2%</div>
                <p className="text-gray-600">Recommendation Accuracy</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-4xl font-bold text-purple-600 mb-2">50M+</div>
                <p className="text-gray-600">Interactions Processed</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-4xl font-bold text-pink-600 mb-2">3</div>
                <p className="text-gray-600">Research Papers Published</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-lg transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: '⚡',
    title: 'XGBoost Integration',
    description: 'Advanced gradient boosting for optimal prediction accuracy'
  },
  {
    icon: '🧠',
    title: 'Deep Learning',
    description: 'Neural networks for complex pattern recognition'
  },
  {
    icon: '👥',
    title: 'Collaborative Filtering',
    description: 'User-item interaction patterns for personalization'
  },
  {
    icon: '📊',
    title: 'Real-time Analytics',
    description: 'Live performance metrics and recommendations'
  },
  {
    icon: '🔒',
    title: 'Privacy Focused',
    description: 'Secure data handling and user privacy protection'
  },
  {
    icon: '⚙️',
    title: 'Scalable Architecture',
    description: 'Handles millions of interactions efficiently'
  }
]