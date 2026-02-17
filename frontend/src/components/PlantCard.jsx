import React from 'react';
import { useNavigate } from 'react-router-dom';

const PlantCard = ({ id, image, localName, scientificName, description, actions }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (id) {
      navigate(`/plant/${id}`);
    }
  };

  // simple inline SVG placeholder (data URI) so we don't need another file
  const PLACEHOLDER =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23cbd5e1" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23737474" font-family="Arial" font-size="20">No image</text></svg>';

  return (
    <div 
      onClick={handleClick}
      className="bg-blue-300 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl cursor-pointer hover:scale-105 relative"
    >
      {actions ? (
        <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      ) : null}
      <img
        src={image || PLACEHOLDER}
        alt={localName}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = PLACEHOLDER;
        }}
        className="w-full h-48 object-fill"
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
