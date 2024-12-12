import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    get token() {
      return localStorage.getItem('token');
    }
  }
});

const handleQuizClick = () => {
    navigate(`/classroom/${id}/quiz`);
  };

const InsideClass = () => {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [activeTab, setActiveTab] = useState('stream');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const response = await api.get(`/classroom/${id}`);
        setClassroom(response.data);
      } catch (error) {
        console.error('Error fetching classroom:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassroom();
  }, [id]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">{classroom?.name}</h1>
          <p className="mt-2">Class Code: {classroom?.id}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8 px-6">
            {['Stream', 'Assignments', 'Quiz', 'People'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'classroom/:id/quiz') {
                    handleQuizClick();
                  } else {
                    setActiveTab(tab.toLowerCase());
                  }
                }}
                className={`py-4 px-2 border-b-2 font-medium transition-colors duration-200 ${
                  activeTab === tab.toLowerCase()
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'stream' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4">Class Stream</h2>
            {/* Add stream content here */}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Assignments</h2>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Create Assignment
              </button>
            </div>
            {/* Add assignments list here */}
          </div>
        )}

        {activeTab === 'people' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-6">People</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Teachers</h3>
                {/* Add teachers list here */}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Students</h3>
                {/* Add students list here */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsideClass;