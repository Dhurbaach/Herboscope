import React from 'react';

const PlantCard = ({ image, localName, scientificName, description }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl">
      <img
        src={image}
        alt={localName}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 text-white">
        <h2 className="text-xl font-semibold">{localName}</h2>
        <h3 className="text-sm italic text-gray-200">{scientificName}</h3>
        <p className="mt-2 text-sm text-gray-100">{description}</p>
      </div>
    </div>
  );
};

export default PlantCard;
