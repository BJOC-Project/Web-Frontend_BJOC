import { useEffect, useState } from "react";
import { reportsService } from "./services/reportsService";
import ExportReportModal from "./modal/ExportReportModal";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

import { Download, Search } from "lucide-react";

type Trip = {
  id: string;
  scheduled_start: string;
  actual_start: string;
  actual_end: string;
  route_name: string;
  driver_name: string;
  plate_number: string;
};

type Passenger = {
  route: string;
  passengers: number;
};

type PeakHour = {
  hour: string;
  passengers: number;
};

type Trend = {
  date: string;
  passengers: number;
};

type Driver = {
  driver: string;
  trips: number;
  onTime: number;
  delayed: number;
};

export function AdminReportsHistory() {

  const [trips, setTrips] = useState<Trip[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [trend, setTrend] = useState<Trend[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const [exportOpen, setExportOpen] = useState(false);

  const loadReports = async () => {

    try {

      const tripData = await reportsService.getTrips({
        startDate,
        endDate,
        search
      });

      const passengerVolume = await reportsService.getPassengerVolume(startDate,endDate);
      const peak = await reportsService.getPeakHours(startDate,endDate);
      const dailyTrend = await reportsService.getPassengerTrend(startDate,endDate);
      const driverData = await reportsService.getDriverReport(startDate,endDate);

      setTrips(tripData || []);
      setPassengers(passengerVolume || []);
      setPeakHours(peak || []);
      setTrend(dailyTrend || []);
      setDrivers(driverData || []);

    } catch (err) {
      console.error("Failed to load reports", err);
    }

  };

  useEffect(() => {
    loadReports();
  }, []);

  return (

    <div className="p-4 ">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-lg font-semibold text-green-900">
            Reports & History
          </h1>
          <p className="text-xs text-gray-500">
            Transport analytics and historical operations
          </p>
        </div>

        <button
          onClick={() => setExportOpen(true)}
          className="flex items-center gap-1 text-xs bg-green-900 text-white px-3 py-1.5 rounded hover:bg-green-800"
        >
          <Download size={14}/>
          Export Report
        </button>

      </div>

      {/* FILTER BAR */}

      <div className="flex flex-wrap gap-2 bg-white border rounded-md p-2">

        <input
          type="date"
          value={startDate}
          onChange={(e)=>setStartDate(e.target.value)}
          className="border text-xs px-2 py-1 rounded"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e)=>setEndDate(e.target.value)}
          className="border text-xs px-2 py-1 rounded"
        />

        <div className="flex items-center border rounded px-2">
          <Search size={12}/>
          <input
            placeholder="Search driver or jeepney"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="text-xs px-1 py-1 outline-none"
          />
        </div>

        <button
          onClick={loadReports}
          className="text-xs bg-green-900 text-white px-3 py-1 rounded hover:bg-green-800"
        >
          Apply
        </button>

      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-3 gap-3">

        <div className="bg-white border rounded-md p-3">
          <p className="text-xs text-gray-500">Total Trips</p>
          <h2 className="text-lg font-semibold">{trips.length}</h2>
        </div>

        <div className="bg-white border rounded-md p-3">
          <p className="text-xs text-gray-500">Drivers</p>
          <h2 className="text-lg font-semibold">{drivers.length}</h2>
        </div>

        <div className="bg-white border rounded-md p-3">
          <p className="text-xs text-gray-500">Routes with Passengers</p>
          <h2 className="text-lg font-semibold">{passengers.length}</h2>
        </div>

      </div>

      {/* ANALYTICS CHARTS */}

      <div className="grid grid-cols-2 gap-4">

        {/* PASSENGER VOLUME */}

        <div className="bg-white border rounded-md p-3">

          <h2 className="text-sm font-semibold text-green-900 mb-2">
            Passenger Volume per Route
          </h2>

          <div className="h-[160px]">

            <ResponsiveContainer>

              <BarChart data={passengers} barSize={20}>

                <XAxis dataKey="route" tick={{fontSize:10}}/>
                <YAxis tick={{fontSize:10}}/>
                <Tooltip/>

                <Bar dataKey="passengers" fill="#14532d"/>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* PEAK HOURS */}

        <div className="bg-white border rounded-md p-3">

          <h2 className="text-sm font-semibold text-green-900 mb-2">
            Peak Passenger Hours
          </h2>

          <div className="h-[160px]">

            <ResponsiveContainer>

              <BarChart data={peakHours} barSize={20}>

                <XAxis dataKey="hour" tick={{fontSize:10}}/>
                <YAxis tick={{fontSize:10}}/>
                <Tooltip/>

                <Bar dataKey="passengers" fill="#14532d"/>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

      {/* DAILY TREND */}

      <div className="bg-white border rounded-md p-3">

        <h2 className="text-sm font-semibold text-green-900 mb-2">
          Daily Passenger Trend
        </h2>

        <div className="h-[180px]">

          <ResponsiveContainer>

            <LineChart data={trend}>

              <XAxis dataKey="date" tick={{fontSize:10}}/>
              <YAxis tick={{fontSize:10}}/>
              <Tooltip/>

              <Line
                type="monotone"
                dataKey="passengers"
                stroke="#14532d"
                strokeWidth={2}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* DRIVER PERFORMANCE */}

      <div className="bg-white border rounded-md p-3">

        <h2 className="text-sm font-semibold text-green-900 mb-2">
          Driver Performance
        </h2>

        <table className="w-full text-xs">

          <thead className="bg-green-900 text-white">

            <tr>
              <th className="p-2 text-left">Driver</th>
              <th className="p-2 text-left">Trips</th>
              <th className="p-2 text-left">On Time</th>
              <th className="p-2 text-left">Delayed</th>
            </tr>

          </thead>

          <tbody>

            {drivers.map((d,i)=>(
              <tr key={i} className="border-b">

                <td className="p-2">{d.driver}</td>
                <td className="p-2">{d.trips}</td>
                <td className="p-2 text-green-600">{d.onTime}</td>
                <td className="p-2 text-red-600">{d.delayed}</td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* TRIP HISTORY */}

      <div className="bg-white border rounded-md p-3">

        <h2 className="text-sm font-semibold text-green-900 mb-2">
          Trip History
        </h2>

        <div className="overflow-auto max-h-[300px]">

          <table className="w-full text-xs">

            <thead className="bg-green-900 text-white sticky top-0">

              <tr>
                <th className="p-2 text-left">Route</th>
                <th className="p-2 text-left">Driver</th>
                <th className="p-2 text-left">Vehicle</th>
                <th className="p-2 text-left">Scheduled</th>
                <th className="p-2 text-left">Started</th>
                <th className="p-2 text-left">Ended</th>
              </tr>

            </thead>

            <tbody>

              {trips.map((trip)=>(
                <tr key={trip.id} className="border-b hover:bg-gray-50">

                  <td className="p-2">{trip.route_name}</td>
                  <td className="p-2">{trip.driver_name}</td>
                  <td className="p-2">{trip.plate_number}</td>

                  <td className="p-2">{new Date(trip.scheduled_start).toLocaleString()}</td>
                  <td className="p-2">{new Date(trip.actual_start).toLocaleString()}</td>
                  <td className="p-2">{new Date(trip.actual_end).toLocaleString()}</td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

      <ExportReportModal
        open={exportOpen}
        onClose={()=>setExportOpen(false)}
        trips={trips}
        passengers={passengers}
        drivers={drivers}
      />

    </div>
  );
}