import { useState } from 'react'

export default function Demo() {
  const [selectedUser, setSelectedUser] = useState(1)
  const [recommendations, setRecommendations] = useState([])

  const generateRecommendations = () => {
    // Mock recommendations
    const mockRecs = [
      { id: 1, title: 'Product A', score: 0.95, category: 'Electronics' },
      { id: 2, title: 'Product B', score: 0.88, category: 'Electronics' },
      { id: 3, title: 'Product C', score: 0.82, category: 'Books' },
      { id: 4, title: 'Product D', score: 0.78, category: 'Home' },
      { id: 5, title: 'Product E', score: 0.75, category: 'Fashion' },
    ]
    setRecommendations(mockRecs)
  }

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">Interactive Demo</h1>
        <p className="text-xl text-gray-600 mb-12">Experience the recommender system in action</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Select User Profile</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>User {i + 1}</option>
                ))}
              </select>
            </div>

            <button
              onClick={generateRecommendations}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Generate Recommendations
            </button>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✓ Select a user profile</li>
                <li>✓ System analyzes user history</li>
                <li>✓ XGBoost model generates predictions</li>
                <li>✓ Deep learning refines results</li>
                <li>✓ Top recommendations displayed</li>
              </ul>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Personalized Recommendations</h2>
            
            {recommendations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Select a user and click "Generate Recommendations" to see results</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={rec.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">#{index + 1} {rec.title}</h3>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {(rec.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.category}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                        style={{ width: `${rec.score * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}