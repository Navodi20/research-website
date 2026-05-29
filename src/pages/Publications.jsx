export default function Publications() {
  const publications = [
    {
      title: 'Hybrid XGBoost Recommender: Regularized & Full-Spectrum Edition',
      authors: 'Your Name, et al.',
      year: 2024,
      venue: 'International Conference on Machine Learning',
      abstract: 'A comprehensive approach combining XGBoost, deep learning, and collaborative filtering...',
      status: 'Published'
    },
    {
      title: 'Advanced Feature Engineering for Recommendation Systems',
      authors: 'Your Name, Co-author',
      year: 2024,
      venue: 'Journal of AI Research',
      abstract: 'Novel anchor features and temporal features for improved model performance...',
      status: 'Published'
    },
    {
      title: 'Scalable Deep Learning for Real-time Recommendations',
      authors: 'Your Name, Team',
      year: 2024,
      venue: 'ACM RecSys Workshop',
      abstract: 'Distributed neural network architecture for millisecond-level prediction latency...',
      status: 'Published'
    }
  ]

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">Publications</h1>
        <p className="text-xl text-gray-600 mb-12">Research papers and conference presentations</p>

        <div className="space-y-6">
          {publications.map((pub, index) => (
            <div key={index} className="bg-white p-8 rounded-lg border-l-4 border-blue-600 shadow-sm hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-2xl font-bold text-gray-900 flex-1">{pub.title}</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ml-4">
                  {pub.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-2">{pub.authors}</p>
              <p className="text-sm text-gray-500 mb-4">{pub.venue} • {pub.year}</p>
              
              <p className="text-gray-700 mb-4">{pub.abstract}</p>
              
              <button className="text-blue-600 font-semibold hover:text-blue-700 transition">
                Read Paper →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}