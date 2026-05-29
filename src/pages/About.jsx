export default function About() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold mb-8 text-gray-900">About This Research</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Project Overview</h2>
            <p className="text-gray-700 mb-4">
              This research project develops an advanced hybrid recommender system that combines
              the power of XGBoost, deep learning neural networks, and collaborative filtering
              to deliver superior recommendation accuracy and scalability.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Key Technologies</h2>
            <ul className="text-gray-700 space-y-2">
              <li>✓ <strong>XGBoost:</strong> Gradient boosting for robust predictions</li>
              <li>✓ <strong>PyTorch:</strong> Deep learning framework for neural networks</li>
              <li>✓ <strong>Pandas & NumPy:</strong> Data processing and analysis</li>
              <li>✓ <strong>Scikit-learn:</strong> Machine learning utilities and evaluation metrics</li>
              <li>✓ <strong>Azure ML:</strong> Cloud-based model training and deployment</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Research Team</h2>
            <p className="text-gray-700">
              Developed as a comprehensive research initiative combining academic rigor with
              practical machine learning applications. The project leverages the latest advances
              in recommender systems research.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}