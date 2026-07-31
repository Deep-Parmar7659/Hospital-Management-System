"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { authService } from "@/lib/api";
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Shift {
  id: number;
  staff_id: number;
  staff_name: string;
  staff_department: string;
  date: string;
  shift_type: string;
}

interface StaffMember {
  id: number;
  name: string;
  department: string;
}

const shiftColors: Record<string, string> = {
  Morning: "bg-emerald-400/20 border-emerald-400/50 text-emerald-400",
  Evening: "bg-amber-400/20 border-amber-400/50 text-amber-400",
  Night: "bg-indigo-400/20 border-indigo-400/50 text-indigo-400",
  Off: "bg-gray-400/20 border-gray-400/50 text-gray-400",
  None: "bg-white/5 border-white/10 text-gray-500",
};

// CRITICAL: This MUST match the backend's date format exactly (YYYY-MM-DD)
const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ShiftsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/immutability
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, currentWeek]);

  const getWeekDays = () => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    // Adjust to Monday as start of week
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const weekDays = getWeekDays();
      const startDate = formatDateLocal(weekDays[0]);
      const endDate = formatDateLocal(weekDays[6]);

      const [shiftsRes, staffRes] = await Promise.all([
        // NOW WE PASS EXACT DATES INSTEAD OF WEEK NUMBERS!
        api.get(`/shifts/week?start_date=${startDate}&end_date=${endDate}`),
        api.get("/shifts/staff-list"),
      ]);

      setShifts(shiftsRes.data);
      setStaffList(staffRes.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch shift data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignShift = async (
    staffId: number,
    dateObj: Date,
    shiftType: string,
  ) => {
    const dateStr = formatDateLocal(dateObj);
    const payload = { staff_id: staffId, date: dateStr, shift_type: shiftType };

    try {
      await api.post("/shifts/", payload);
      // Immediately refresh to show the updated shift
      await fetchData();
    } catch (error: unknown) {
      console.error("Failed to assign shift:", error);
      let message = "Unknown error";
      if (error instanceof Error) {
        message = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const err = error as {
          response?: { data?: { detail?: string } };
          message?: string;
        };
        message = err.response?.data?.detail || err.message || "Unknown error";
      }
      alert(`Failed to assign shift: ${message}`);
    }
  };

  const getShiftForStaffAndDate = (staffId: number, dateObj: Date) => {
    const dateStr = formatDateLocal(dateObj);
    return shifts.find((s) => s.staff_id === staffId && s.date === dateStr);
  };

  const weekDays = getWeekDays();

  // Simple week number calculation for display purposes
  const getWeekNumber = (date: Date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };
  const weekNumber = getWeekNumber(currentWeek);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="text-primary" /> Shift Scheduling
            </h1>
            <p className="text-gray-400 mt-1">
              Assign and manage weekly staff shifts.
            </p>
            {lastUpdated && (
              <p className="text-xs text-emerald-400 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        <div className="glass-panel p-4 mb-6 flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentWeek(
                new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
              )
            }
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white">
              Week {weekNumber} {currentWeek.getFullYear()}
            </h2>
            <p className="text-sm text-gray-400">
              {weekDays[0].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {weekDays[6].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          <button
            onClick={() =>
              setCurrentWeek(
                new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
              )
            }
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {isLoading ? (
          <div className="glass-panel p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p>Loading shift schedule...</p>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                    <th className="p-4 text-left">Staff Member</th>
                    {weekDays.map((day, idx) => (
                      <th key={idx} className="p-4 text-center min-w-35">
                        <div className="flex flex-col">
                          <span className="text-xs">
                            {day.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </span>
                          <span className="text-lg font-bold">
                            {day.getDate()}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {staffList.map((staff) => (
                    <tr
                      key={staff.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{staff.name}</p>
                          <p className="text-xs text-gray-500">
                            {staff.department}
                          </p>
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const shift = getShiftForStaffAndDate(staff.id, day);
                        const currentValue = shift ? shift.shift_type : "None";

                        return (
                          <td key={day.toISOString()} className="p-2">
                            <select
                              value={currentValue}
                              onChange={(e) => {
                                const newShift = e.target.value;
                                if (newShift !== "None") {
                                  handleAssignShift(staff.id, day, newShift);
                                }
                              }}
                              className={`w-full p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${shiftColors[currentValue]}`}
                            >
                              <option
                                value="None"
                                className="bg-gray-900 text-gray-400"
                              >
                                - Unassigned -
                              </option>
                              <option
                                value="Morning"
                                className="bg-gray-900 text-emerald-400"
                              >
                                ☀️ Morning
                              </option>
                              <option
                                value="Evening"
                                className="bg-gray-900 text-amber-400"
                              >
                                🌅 Evening
                              </option>
                              <option
                                value="Night"
                                className="bg-gray-900 text-indigo-400"
                              >
                                🌙 Night
                              </option>
                              <option
                                value="Off"
                                className="bg-gray-900 text-gray-400"
                              >
                                ❌ Off
                              </option>
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="glass-panel p-4 mt-6 flex flex-wrap gap-4 text-xs text-gray-400">
          <span>☀️ Morning</span>
          <span>🌅 Evening</span>
          <span>🌙 Night</span>
          <span>❌ Off</span>
          <span className="ml-auto">Click any cell to assign a shift</span>
        </div>
      </div>
    </div>
  );
}
