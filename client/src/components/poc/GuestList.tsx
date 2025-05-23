import React, { useEffect, useState } from "react";
import { usePocStore } from "@/store/poc/pocStore";
import { useCheckinStore } from "@/store/poc/checkinStore";
import { useShallow } from "zustand/shallow";

export default function GuestList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { poc } = usePocStore(
    useShallow((state) => ({
      poc: state.poc,
    }))
  );
  const { guests, fetchGuests } = useCheckinStore(
    useShallow((state) => ({
      guests: state.guests,
      fetchGuests: state.fetchGuests,
    }))
  );

  useEffect(() => {
    if (!poc) return;
    fetchGuests(poc.eventCode, poc.pointCode);
  }, [poc, fetchGuests]);

  if (!poc) {
    return (
      <div className="text-center py-4">Please select a point of check-in.</div>
    );
  }

  const filteredGuests = guests.filter((guest) =>
    guest.guestInfo.guestCode.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Guest List</h2>
          <div className="w-full md:w-64 mt-2 md:mt-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Search guests..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Image
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Code
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check-in Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGuests.length > 0 ? (
                filteredGuests.map((guest) => (
                  <tr key={guest.guestInfo.guestId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {guest.guestInfo.imageUrl ? (
                          <img
                            src={guest.guestInfo.imageUrl}
                            alt="Guest Image"
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          "Unknown Guest"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {guest.guestInfo.guestCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {guest.guestInfo.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          guest.checkinInfo.active === true
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {guest.checkinInfo.active === true
                          ? "Checked In"
                          : "Not Checked In"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(guest.checkinInfo.checkinTime).toLocaleString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No guests found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
