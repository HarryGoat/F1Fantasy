import React, { useState } from "react";

// Import API utility for making requests to the backend.
import { api } from "~/utils/api";

// Import custom UI components for displaying table data.
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

// Import type definitions for database models and ORM selection.
import { type drivers } from "~/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";

// Interface for props passed to the DriverCard component.
interface DriverCardProps {
  driver: InferSelectModel<typeof drivers> | undefined;
  order: number;
}

// Component for selecting a new driver with an option to view all drivers and select one.
function ChangeDriverPopup({ order }: { order: number }) {
  // Fetch the list of drivers available for selection.
  const { data: driverObjects } = api.driver.getDrivers.useQuery({ order });

  // Prepare table rows for displaying driver information.
  const tableRows: JSX.Element[] = [];
  // Use mutation hook for adding drivers to the user's team.
  const { mutate: addDrivers } = api.driver.addDrivers.useMutation();

  // Populate table rows with driver data if available.
  if (driverObjects && driverObjects.length > 0) {
    driverObjects.forEach((driver, index) => {
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
                addDrivers({ driverId: driver.id, order: order });
              }}
            >
              Select
            </button>
          </TableCell>
        </TableRow>
      );
    });
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {/* Table structure displaying available drivers for selection. */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Total FPoints</TableHead>
            <TableHead>Recent FPoints</TableHead>
            <TableHead>Total Points</TableHead>
            <TableHead>Recent Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </div>
  );
}

// Component for displaying a driver's card with the option to select or change the driver.
function DriverCard({ driver, order }: DriverCardProps) {
  // State for toggling the driver selection popup.
  const [selectDrivers, setSelectDrivers] = useState(false);

  // Toggle function for showing/hiding the select driver popup.
  const toggleSelectDrivers = () => {
    setSelectDrivers(!selectDrivers);
  };

  // If no driver is selected, show an option to select a driver.
  if (!driver) {
    return (
      <div className="relative bg-white">
        <div
          className={`relative z-40 flex flex-col items-center rounded-lg border p-4 text-center ${selectDrivers ? "darken-background" : ""}`}
        >
          <div style={{ width: "100px", height: "100px" }}></div>
          <button onClick={toggleSelectDrivers}>
            Select Driver
          </button>
        </div>
        {/* Popup for selecting a driver */}
        {selectDrivers && (
          <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center">
            <div className="rounded-lg bg-white p-4">
              <ChangeDriverPopup order={order} />
              <button
                onClick={() => {
                  toggleSelectDrivers();
                  window.location.reload(); // Reload to update the UI with the new selection.
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Display the selected driver's information.
  return (
    <>
      <div className="relative">
        <div
          className={`relative z-40 flex flex-col items-center rounded-lg border p-4 text-center bg-white ${selectDrivers ? "darken-background" : ""}`}
        >
          <div style={{ width: "100px", height: "100px" }}>
            <h2>{driver.driverName}</h2>
          </div>
          <h2 className="text-sm">Points: {driver.recentPoints}</h2>
          <h2 className="mb-2 text-lg font-semibold">{driver.team}</h2>
          <button onClick={toggleSelectDrivers}>Change Driver</button>
        </div>
        {/* Popup for changing the selected driver */}
        {selectDrivers && (
          <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center">
            <div className="rounded-lg bg-white p-4">
              <ChangeDriverPopup order={order} />
              <button
                onClick={() => {
                  toggleSelectDrivers();
                  window.location.reload(); // Reload to update the UI with the new driver.
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

// Home component to display the main content including the driver selection and user information.
export default function Home() {
  // Fetch the list of drivers associated with the user.
  const { data: driverObjects } = api.driver.getMyDrivers.useQuery();
  // Fetch the user's budget.
  const { data: userBudget } = api.user.displayUserBudget.useQuery();
  // Fetch the user's points.
  const { data: userPoints } = api.user.displayUserPoints.useQuery();

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      {/* Display user information and total points */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Fantasy F1 Driver Selection</h1>
        <div className="text-right">
          <div className="text-2xl font-bold">Recent Points: {userPoints?.userRecentPoints}</div>
          <div className="text-2xl font-bold">Total Points: {userPoints?.userTotalPoints}</div>
          <div className="text-2xl font-bold">Budget: ${userBudget}</div>
        </div>
      </div>
      {/* Grid layout for displaying driver cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {driverObjects?.map(({ driver, order }, index) => (
          <DriverCard key={index} order={order} driver={driver} />
        ))}
      </div>
    </div>
  );
}
