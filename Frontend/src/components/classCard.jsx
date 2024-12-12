import React from 'react';

const ClassCard = () => {
  return (
    <div className="class-card bg-white rounded-3xl shadow-2xl overflow-hidden w-96 hover:scale-105 transform transition duration-300 ease-in-out hover:shadow-3xl">
      <div className="class-card-image">
        <img 
          src="https://via.placeholder.com/400x200?text=Class+Image" 
          alt="Class" 
          className="w-full h-48 object-cover rounded-t-3xl"
        />
      </div>
     
      <div className="class-card-content p-8 bg-indigo-100 rounded-b-3xl">
        <h3 className="class-card-title text-3xl font-semibold text-gray-900 hover:text-indigo-600 transition duration-200">
          Class Name
        </h3>
        <p className="class-card-subject text-xl text-gray-700 mt-3">{/* Subject */}Mathematics</p>
        <small className="class-card-teacher text-base text-gray-500 mt-4 block">Teacher: Dr. Jane Smith</small>
      </div>
    </div>
  );
};

export default ClassCard;