import { Link } from 'react-router-dom'
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">XGBoost Recommender</h3>
            <p className="text-gray-400 text-sm">
              Advanced hybrid recommendation system using machine learning and deep learning techniques.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/research" className="hover:text-white transition">Research</Link></li>
              <li><Link to="/demo" className="hover:text-white transition">Demo</Link></li>
              <li><Link to="/publications" className="hover:text-white transition">Publications</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-lg mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiGithub size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiMail size={20} />
              </a>
            </div>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} XGBoost Recommender System. All rights reserved.</p>
          <p className="mt-2">Built with React • Tailwind CSS • Deployed on Azure</p>
        </div>
      </div>
    </footer>
  )
}