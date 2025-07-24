import React from 'react';
import PlantCard from '../components/PlantCard';

const samplePlants = [
  {
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6',
    localName: 'Tulsi',
    scientificName: 'Ocimum tenuiflorum',
    description: 'Used in traditional medicine for its healing properties.',
  },
  {
    image: 'https://images.unsplash.com/photo-1501004318655-c7ed49c93c29',
    localName: 'Neem',
    scientificName: 'Azadirachta indica',
    description: 'Known for its antibacterial and antifungal effects.',
  },
  {
    image: 'https://images.unsplash.com/photo-1547480053-8dde3e94d676',
    localName: 'Aloe Vera',
    scientificName: 'Aloe barbadensis miller',
    description: 'Helps soothe skin and aids digestion.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-green-300 to-teal-500 p-6">
      <div className="max-w-7xl mx-auto text-white text-center mb-10">
        <h1 className="text-4xl font-bold">Welcome to Herboscope 🌿</h1>
        <p className="mt-2 text-lg">Explore medicinal plants and their uses</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {samplePlants.map((plant, index) => (
          <PlantCard key={index} {...plant} />
        ))}
      </div>
    </div>
  );
}
