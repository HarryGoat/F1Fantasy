import React, { useState } from "react";
import { api } from "~/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type drivers } from "~/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";

//caching
//statisitcs
//aws
//only allow 1 driver change per week
//ui
//races
//leagues

interface DriverCardProps {
  driver: InferSelectModel<typeof drivers> | undefined;
  order: number;
}

function ChangeDriverPopup({ order }: { order: number }) {
  const { data: driverObjects } = api.driver.getDrivers.useQuery({
    order: order,
  });

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
          <TableCell>${driver?.price}</TableCell>
          <TableCell>{driver?.position}</TableCell>
          <TableCell>{driver?.totalFantasyPoints}</TableCell>
          <TableCell>{driver?.recentFantasyPoints}</TableCell>
          <TableCell>{driver?.totalPoints}</TableCell>
          <TableCell>{driver?.recentPoints}</TableCell>
          <TableCell>
            <button
              onClick={async () => {
                addDrivers({ driverId: driver!.id, order: order });
              }}
            >
              Select
            </button>
          </TableCell>
        </TableRow>,
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
            <TableHead>Total FPoints</TableHead>
            <TableHead>FPoints</TableHead>
            <TableHead>Total Points</TableHead>
            <TableHead>Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </div>
  );
}

function DriverCard({ driver, order }: DriverCardProps) {
  const [selectDrivers, setSelectDrivers] = useState(false);

  const toggleSelectDrivers = () => {
    setSelectDrivers(!selectDrivers);
  };
  if (!driver) {
    return (
      <>
        <div className="relative">
          <div
            className={`relative z-40 flex flex-col items-center rounded-lg border p-4 text-center ${selectDrivers ? "darken-background" : ""}`}
          >
            <div style={{ width: "100px", height: "100px" }}></div>
            <button
              onClick={() => {
                toggleSelectDrivers();
              }}
            >
              Select Driver
            </button>
          </div>

          {selectDrivers && (
            <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center">
              <div className="rounded-lg bg-white p-4">
                <ChangeDriverPopup order={order} />
                <button
                  onClick={() => {
                    toggleSelectDrivers();
                    window.location.reload();
                  }}
                >
                  Confirm
                </button>
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
        <div
          className={`relative z-40 flex flex-col items-center rounded-lg border p-4 text-center ${selectDrivers ? "darken-background" : ""}`}
        >
          <div style={{ width: "100px", height: "100px" }}>
            <h2>{driver.driverName}</h2>
          </div>
          <h2 className="text-sm">Points: {driver.recentPoints}</h2>
          <h2 className="mb-2 text-lg font-semibold">{driver.team}</h2>
          <button onClick={toggleSelectDrivers}>Change Driver</button>
        </div>

        {selectDrivers && (
          <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center">
            <div className="rounded-lg bg-white p-4">
              <ChangeDriverPopup order={order} />
              <button
                onClick={() => {
                  toggleSelectDrivers();
                  window.location.reload();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function Home() {
  const { data: driverObjects } = api.driver.getMyDrivers.useQuery();
  const { data: userBudget } = api.user.displayUserBudget.useQuery();
  const { data: userPoints } = api.user.displayUserPoints.useQuery();

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Fantasy F1 Driver Selection</h1>
        <div className="text-right">
          <div className="text-2xl font-bold">Recent Points: {userPoints?.userRecentPoints}</div>
          <div className="text-2xl font-bold">Total Points: {userPoints?.userRecentPoints}</div>
          <div className="text-2xl font-bold">Budget: ${userBudget}</div>
        </div>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {driverObjects?.map(({ driver, order }, index) => (
          <DriverCard key={index} order={order} driver={driver} />
        ))}
      </div>
    </div>
  );
}
