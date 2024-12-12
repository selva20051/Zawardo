import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClassCard from "./classCard";
import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    get token() {
      return localStorage.getItem('token');
    }
  }
});

const Classe = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please login first');
        }

        const response = await api.get('/classroom', {
          headers: { token }
        });
        setClassrooms(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch classrooms');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  const handleClassroomClick = (classroomId) => {
    navigate(`/classroom/${classroomId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom) => (
          <ClassCard 
            key={classroom.id} 
            classroom={classroom}
            onClick={() => handleClassroomClick(classroom.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Classe;