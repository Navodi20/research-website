export default function Research() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold mb-8 text-gray-900">Research Overview</h1>

        {/* Research Problem */}
        <div className="mb-16 bg-blue-50 p-8 rounded-lg border-l-4 border-blue-600">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Problem Statement</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Traditional recommendation systems rely on single approaches (collaborative filtering or content-based filtering).
            This research addresses the need for a hybrid, multi-model approach that combines XGBoost, deep learning, and
            collaborative filtering to achieve superior accuracy and scalability.
          </p>
        </div>

        {/* Methodology */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Methodology</h2>
          <div className="space-y-6">
            {methodology.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
                <div className="flex gap-4">
                  <div className="text-4xl font-bold text-blue-600">{index + 1}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-16 bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Results & Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {results.map((result, index) => (
              <div key={index} className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-3 text-gray-900">{result.metric}</h3>
                <p className="text-4xl font-bold text-green-600 mb-2">{result.value}</p>
                <p className="text-gray-600">{result.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const methodology = [
  {
    title: 'Data Collection & Preprocessing',
    description: 'Aggregated user-item interactions, feature engineering, and normalization'
  },
  {
    title: 'Feature Engineering',
    description: 'Created anchor features, temporal features, and behavior features'
  },
  {
    title: 'Model Development',
    description: 'Built XGBoost, Deep Learning, and Collaborative Filtering models'
  },
  {
    title: 'Hybrid Ensemble',
    description: 'Combined models with weighted averaging for optimal predictions'
  },
  {
    title: 'Evaluation & Validation',
    description: 'Cross-validation, A/B testing, and performance benchmarking'
  },
  {
    title: 'Deployment & Monitoring',
    description: 'Containerized deployment and real-time performance tracking'
  }
]

const results = [
  { metric: 'Precision@10', value: '92.4%', description: 'Top-10 recommendation accuracy' },
  { metric: 'Recall@20', value: '88.7%', description: 'Relevant item coverage' },
  { metric: 'NDCG Score', value: '0.895', description: 'Ranking quality' },
  { metric: 'Latency', value: '<100ms', description: 'Real-time prediction speed' }
]