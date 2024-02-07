import React from 'react';
import Image from "next/image"; // Importing next/image

interface DriverCardProps {
  name: string;
  team: string;
}

// Reusable component for a driver card
function DriverCard({ name, team }: DriverCardProps) {
  return (
    <div className="border rounded-lg p-4 flex flex-col items-center text-center">
      <div style={{ width: "100px", height: "100px" }}>
        {/* Using next/image with updated props */}
        <Image
          alt={`Driver ${name}`}
          src="/placeholder.svg"
          width={100}
          height={100}
          style={{ objectFit: "cover" }} // Apply object-fit-related style
        />
      </div>
      <h2 className="text-lg font-semibold mb-2">{name}</h2>
      <div style={{ width: "50px", height: "50px" }}>
        {/* Using next/image with updated props */}
        <Image
          alt={`Team ${team}`}
          src="/placeholder.svg"
          width={50}
          height={50}
          style={{ objectFit: "cover" }} // Apply object-fit-related style
        />
      </div>
      <button>Select</button>
    </div>
  );
}


export default function Home() {
  const drivers = [
    { name: 'Driver 1', team: 'Team 1' },
    { name: 'Driver 2', team: 'Team 2' },
    { name: 'Driver 3', team: 'Team 3' },
    { name: 'Driver 4', team: 'Team 4' },
    { name: 'Driver 5', team: 'Team 5' },
    { name: 'Substitute Driver', team: 'Team 6' },
    { name: 'Constructor', team: 'Team 6' },
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">Fantasy F1 Driver Selection</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {/* Render each driver */}
        {drivers.map((driver, index) => (
          <DriverCard key={index} name={driver.name} team={driver.team} />
        ))}
      </div>
    </div>
  );
}
