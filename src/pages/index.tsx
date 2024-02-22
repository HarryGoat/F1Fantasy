import React, { useState } from 'react';
import Image from "next/image";
import { api } from "~/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type drivers } from '~/server/db/schema';
import { type InferSelectModel } from 'drizzle-orm';

interface DriverCardProps {
  driver: InferSelectModel<typeof drivers> | undefined;
  order :number;
}

function ChangeDriverPopup({order}: {order: number}) {
  const { data: driverObjects} = api.driver.getDrivers.useQuery({order: order});

  const tableRows: JSX.Element[] = [];
  const { mutate: addDrivers } = api.driver.addDrivers.useMutation();

  if (driverObjects && driverObjects.length > 0) {
    for (let index = 0; index < driverObjects.length; index++) {
      const driver = driverObjects[index];

      tableRows.push(
        <TableRow key={index}>
          <TableCell>{driver?.driverName}</TableCell>
          <TableCell>{driver?.team}</TableCell>
          <TableCell>{driver?.nationality}</TableCell>
          <TableCell>{driver?.price}</TableCell>
          <TableCell>{driver?.position}</TableCell>
          <TableCell>{driver?.points}</TableCell>
          <TableCell>
            <button onClick={() => addDrivers({ driverId: driver!.id, order: order })}>Select</button>
          </TableCell>
        </TableRow>
      );
    }
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {/* Set a maximum height and enable vertical scrolling */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableRows}
        </TableBody>
      </Table>
    </div>
  );
}

function DriverCard({ driver, order }: DriverCardProps) {
  const [selectDrivers, setSelectDrivers] = useState(false);

  const toggleSelectDrivers = () => {
    setSelectDrivers(!selectDrivers);
  };
  if(!driver){
    return (
      <>
        <div className="relative">
          <div className={`border rounded-lg p-4 flex flex-col items-center text-center relative z-40 ${selectDrivers ? 'darken-background' : ''}`}>
            <div style={{ width: "100px", height: "100px" }}>
              <Image
                alt={`Driver ${order}`}
                src="/placeholder.svg"
                width={100}
                height={100}
                style={{ objectFit: "cover" }}
              />
            </div>
            <button onClick={toggleSelectDrivers}>Select</button>
          </div>
  
          {selectDrivers && (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
              <div className="bg-white p-4 rounded-lg">
                <ChangeDriverPopup order={order}/>
                <button onClick={toggleSelectDrivers}>Confirm</button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }


  return (
    <>
      <div className="relative">
        <div className={`border rounded-lg p-4 flex flex-col items-center text-center relative z-40 ${selectDrivers ? 'darken-background' : ''}`}>
          <div style={{ width: "100px", height: "100px" }}>
          <h2>Driver {order}: {driver.driverName}</h2>
          </div>
          <h2 className="text-lg font-semibold mb-2">{driver.team}</h2>
          <button onClick={toggleSelectDrivers}>Select</button>
        </div>

        {selectDrivers && (
          <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg">
              <ChangeDriverPopup order={order}/>
              <button onClick={toggleSelectDrivers}>Confirm</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function Home() {

  const { data: driverObjects} = api.driver.getMyDrivers.useQuery();

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">Fantasy F1 Driver Selection</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {driverObjects?.map(({driver, order}, index) => (
          <DriverCard key={index} order={order} driver={driver}  />
        ))}
      </div>

      <style jsx>{`
        .darken-background {
          background-color: rgba(0, 0, 0, 0.5);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
