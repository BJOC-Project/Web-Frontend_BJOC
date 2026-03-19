import { useState } from "react";
import { exportCSV } from "@/features/shared/utils/reportExport";

type Props = {
  open: boolean;
  onClose: () => void;
  trips: any[];
  passengers: any[];
  drivers: any[];
};

export default function ExportReportModal({
  open,
  onClose,
  trips,
  passengers,
  drivers
}: Props) {

  const [type, setType] = useState("trips");

  if (!open) return null;

  let previewData: any[] = [];

  if (type === "trips") previewData = trips;
  if (type === "passengers") previewData = passengers;
  if (type === "drivers") previewData = drivers;

  const handleExport = () => {

    exportCSV(
      `BJOC_${type}_report_${new Date().toISOString().slice(0,10)}.csv`,
      previewData
    );

  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-[720px] rounded-lg shadow-lg p-5">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-4">

          <h2 className="font-semibold text-green-900">
            Export Report
          </h2>

          <button
            onClick={onClose}
            className="text-sm text-gray-500"
          >
            Close
          </button>

        </div>

        {/* OPTIONS */}

        <div className="flex gap-3 mb-4">

          <select
            value={type}
            onChange={(e)=>setType(e.target.value)}
            className="border px-2 py-1 text-sm rounded"
          >

            <option value="trips">
              Trip History
            </option>

            <option value="passengers">
              Passenger Report
            </option>

            <option value="drivers">
              Driver Performance
            </option>

          </select>

        </div>

        {/* PREVIEW */}

        <div className="border rounded-md max-h-[300px] overflow-auto">

          <table className="w-full text-xs">

            <thead className="bg-green-900 text-white sticky top-0">

              <tr>

                {previewData.length > 0 &&
                  Object.keys(previewData[0]).map((key)=>(
                    <th key={key} className="p-2 text-left">
                      {key}
                    </th>
                  ))
                }

              </tr>

            </thead>

            <tbody>

              {previewData.slice(0,10).map((row,i)=>(
                <tr key={i} className="border-b">

                  {Object.values(row).map((val,j)=>(
                    <td key={j} className="p-2">
                      {String(val)}
                    </td>
                  ))}

                </tr>
              ))}

            </tbody>

          </table>

        </div>

        {/* FOOTER */}

        <div className="flex justify-end mt-4">

          <button
            onClick={handleExport}
            className="bg-green-900 text-white px-4 py-2 text-sm rounded"
          >
            Export CSV
          </button>

        </div>

      </div>

    </div>
  );
}