import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClassCard = ({ classroom }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/classroom/${classroom.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="class-card bg-white rounded-3xl shadow-2xl overflow-hidden w-96 hover:scale-105 transform transition duration-300 ease-in-out hover:shadow-3xl cursor-pointer"
    >
      <div className="class-card-image">
        <img 
          src={classroom.image || "https://via.placeholder.com/400x200?text=Class+Image"} 
          alt={classroom.name} 
          className="w-full h-48 object-cover rounded-t-3xl"
        />
      </div>
     
      <div className="class-card-content p-8 bg-indigo-100 rounded-b-3xl">
        <div className="flex justify-between items-start">
          <h3 className="class-card-title text-3xl font-semibold text-gray-900 hover:text-indigo-600 transition duration-200">
            {classroom.name}
          </h3>
          <span className="text-sm text-gray-500">ID: {classroom.id}</span>
        </div>
        <p className="class-card-subject text-xl text-gray-700 mt-3">
          {classroom.subject || 'General'}
        </p>
        <small className="class-card-teacher text-base text-gray-500 mt-4 block">
          Teacher: {classroom.teacher?.name || 'Not Assigned'}
        </small>
      </div>
    </div>
  );
};

export default ClassCard;