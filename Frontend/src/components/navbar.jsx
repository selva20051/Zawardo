// Navbar.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    // Add token to default headers
    get token() {
      return localStorage.getItem('token');
    }
  }
});



const Navbar = () => {

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [classroomId, setClassroomId] = useState('');
  const [classroomName, setClassroomName] = useState('');
  const [action, setAction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = () => {
    navigate('/chatbot');
  }

  const handleClassAction = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login first');
      }

      if (action === 'create') {
        const response = await api.post('/classroom/create', {
          name: classroomName
        }, {
          headers: { token } // Add token to request headers
        });
        console.log('Classroom created:', response.data);
      } else {
        const response = await api.post(`/classroom/join/${classroomId}`, {}, {
          headers: { token } // Add token to request headers
        });
        console.log('Joined classroom:', response.data);
      }
      
      setShowModal(false);
      setClassroomId('');
      setClassroomName('');
      setAction('');
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <p className="text-lg font-bold cursor-pointer hover:scale-105 transition-all duration-200"> 
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">Study</span>
              <span className="text-gray-1000 hover:text-indigo-600 transition-colors duration-200">Buddy</span>
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 hover:scale-105 hover:shadow-md px-4 py-2 rounded-lg font-medium transition-all duration-200">
              Classroom
            </button>
            <button onClick={handleClick} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 hover:scale-105 hover:shadow-md px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center">
              <svg 
                className="w-5 h-5 mr-2 text-white" 
                fill="none" 
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Chat with Bot
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Classroom Actions
              </h3>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setAction('create')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 
                    ${action === 'create' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700'}`}
                >
                  Create Class
                </button>
                <button
                  onClick={() => setAction('join')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200
                    ${action === 'join' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700'}`}
                >
                  Join Class
                </button>
              </div>
              
              {action && (
                <form onSubmit={handleClassAction}>
                  {action === 'create' ? (
                    <input
                      type="text"
                      value={classroomName}
                      onChange={(e) => setClassroomName(e.target.value)}
                      placeholder="Enter Classroom Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  ) : (
                    <input
                      type="text"
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                      placeholder="Enter Classroom ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  )}
                  <div className="mt-4 flex justify-end space-x-3">
                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setAction('');
                        setError('');
                      }}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                      {isLoading 
                        ? 'Processing...' 
                        : action === 'create' 
                          ? 'Create' 
                          : 'Join'
                      }
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;