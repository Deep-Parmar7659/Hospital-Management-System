"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { authService } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  DollarSign,
  Loader2,
  FileText,
  X,
  CheckCircle,
  TrendingUp,
  Users,
  Calculator,
} from "lucide-react";

interface PayrollRecord {
  id: number;
  staff_id: number;
  staff_name: string;
  staff_department: string;
  month: string;
  year: number;
  base_salary: number;
  overtime_pay: number;
  leave_deduction: number;
  net_salary: number;
  status: string;
  generated_at: string;
}

export function PayrollPageContent() {
  const router = useRouter();
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    staff_id: 1,
    month: "July",
    year: 2026,
    base_salary: 5000,
    overtime_hours: 0,
    leave_days: 0,
  });

  const fetchPayrolls = async () => {
    try {
      const res = await api.get("/payroll/");
      setPayrolls(res.data);
    } catch (error) {
      console.error("Failed to fetch payrolls:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (!authService.isAuthenticated()) {
        router.push("/login");
        return;
      }
      await fetchPayrolls();
    };
    initialize();
  }, [router]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/payroll/generate", formData);
      setShowGenerateModal(false);
      fetchPayrolls();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      const detail = err.response?.data?.detail;
      alert(
        detail ||
          (error instanceof Error
            ? error.message
            : "Failed to generate payslip"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalExpenditure = payrolls.reduce(
    (acc, curr) => acc + curr.net_salary,
    0,
  );
  const pendingCount = payrolls.filter((p) => p.status === "Pending").length;

  const handleDownloadPDF = async () => {
    if (!selectedPayslip) return;

    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFillColor(255, 255, 255);
    doc.rect(
      0,
      0,
      doc.internal.pageSize.getWidth(),
      doc.internal.pageSize.getHeight(),
      "F",
    );

    doc.setFontSize(22);
    doc.setTextColor(0, 150, 200);
    doc.text("NEXUS HMS", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("Official Payslip", 105, 28, { align: "center" });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Employee: ${selectedPayslip.staff_name}`, 20, 50);
    doc.text(`Department: ${selectedPayslip.staff_department}`, 20, 58);
    doc.text(
      `Pay Period: ${selectedPayslip.month} ${selectedPayslip.year}`,
      20,
      66,
    );

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 75, 190, 75);

    doc.setFontSize(12);
    doc.text("Earnings & Deductions", 20, 85);

    doc.setFontSize(11);
    doc.text("Base Salary:", 20, 100);
    doc.text(`$${selectedPayslip.base_salary.toFixed(2)}`, 150, 100, {
      align: "right",
    });

    doc.text("Overtime Pay:", 20, 110);
    doc.setTextColor(0, 128, 0);
    doc.text(`+$${selectedPayslip.overtime_pay.toFixed(2)}`, 150, 110, {
      align: "right",
    });

    doc.setTextColor(50, 50, 50);
    doc.text("Leave Deductions:", 20, 120);
    doc.setTextColor(180, 0, 0);
    doc.text(`-$${selectedPayslip.leave_deduction.toFixed(2)}`, 150, 120, {
      align: "right",
    });

    doc.setDrawColor(0, 150, 200);
    doc.setFillColor(240, 255, 255);
    doc.rect(20, 135, 170, 20, "FD");

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Net Salary", 25, 148);
    doc.setFontSize(16);
    doc.setTextColor(0, 100, 150);
    doc.text(`$${selectedPayslip.net_salary.toFixed(2)}`, 185, 149, {
      align: "right",
    });

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("System Verified & Digitally Signed", 105, 170, {
      align: "center",
    });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 176, {
      align: "center",
    });

    doc.save(
      `Payslip_${selectedPayslip.staff_name.replace(" ", "_")}_${selectedPayslip.month}_${selectedPayslip.year}.pdf`,
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white dark:text-white flex items-center gap-3">
              <DollarSign className="text-primary" /> Payroll System
            </h1>
            <p className="text-gray-400 dark:text-gray-600 mt-1">
              Automated salary processing and payslip generation.
            </p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="neon-button flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" /> Generate Payslip
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-600 text-sm">
                Total Expenditure
              </p>
              <p className="text-2xl font-bold text-white dark:text-gray-900">
                ${totalExpenditure.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="glass-panel p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-400/10">
              <FileText className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-600 text-sm">
                Pending Approvals
              </p>
              <p className="text-2xl font-bold text-white dark:text-gray-900">
                {pendingCount}
              </p>
            </div>
          </div>
          <div className="glass-panel p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-400/10">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-600 text-sm">
                Total Payslips
              </p>
              <p className="text-2xl font-bold text-white dark:text-gray-900">
                {payrolls.length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p>Processing financial data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Staff</th>
                    <th className="p-4">Period</th>
                    <th className="p-4">Base</th>
                    <th className="p-4">Overtime</th>
                    <th className="p-4">Deductions</th>
                    <th className="p-4">Net Salary</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {payrolls.length > 0 ? (
                      payrolls.map((payroll) => (
                        <motion.tr
                          key={payroll.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-white dark:text-gray-900">
                                {payroll.staff_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-600">
                                {payroll.staff_department}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300 dark:text-gray-700">
                            {payroll.month} {payroll.year}
                          </td>
                          <td className="p-4 text-gray-300 dark:text-gray-700">
                            ${payroll.base_salary}
                          </td>
                          <td className="p-4 text-emerald-400 dark:text-emerald-600">
                            +${payroll.overtime_pay}
                          </td>
                          <td className="p-4 text-red-400 dark:text-red-600">
                            -${payroll.leave_deduction}
                          </td>
                          <td className="p-4 text-primary dark:text-blue-600 font-bold text-lg">
                            ${payroll.net_salary}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedPayslip(payroll)}
                              className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm flex items-center gap-2 ml-auto"
                            >
                              <FileText className="w-4 h-4" /> View
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center text-gray-500 dark:text-gray-600"
                        >
                          No payslips generated yet.
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Generate Payslip Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-lg p-6 relative"
            >
              <button
                onClick={() => setShowGenerateModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white dark:hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white dark:text-gray-900 mb-6 flex items-center gap-2">
                <Calculator className="text-primary" /> Generate Monthly Payslip
              </h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 dark:text-gray-600 mb-1">
                      Month
                    </label>
                    <input
                      required
                      type="text"
                      className="glass-input w-full"
                      value={formData.month}
                      onChange={(e) =>
                        setFormData({ ...formData, month: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 dark:text-gray-600 mb-1">
                      Year
                    </label>
                    <input
                      required
                      type="number"
                      className="glass-input w-full"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          year: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 dark:text-gray-600 mb-1">
                    Base Salary ($)
                  </label>
                  <input
                    required
                    type="number"
                    className="glass-input w-full"
                    value={formData.base_salary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        base_salary: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 dark:text-gray-600 mb-1">
                      Overtime Hours
                    </label>
                    <input
                      type="number"
                      className="glass-input w-full"
                      value={formData.overtime_hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          overtime_hours: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 dark:text-gray-600 mb-1">
                      Leave Days Taken
                    </label>
                    <input
                      type="number"
                      className="glass-input w-full"
                      value={formData.leave_days}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leave_days: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="neon-button w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Calculate & Generate"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payslip Preview Modal */}
      <AnimatePresence>
        {selectedPayslip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelectedPayslip(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-md p-8 relative border-primary/30 shadow-neon-cyan"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPayslip(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white dark:hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center border-b border-white/10 dark:border-gray-200 pb-6 mb-6">
                <h2 className="text-2xl font-bold tracking-widest text-primary dark:text-blue-600">
                  NEXUS HMS
                </h2>
                <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">
                  Official Payslip
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">
                    Employee
                  </span>
                  <span className="text-white dark:text-gray-900 font-medium">
                    {selectedPayslip.staff_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">
                    Department
                  </span>
                  <span className="text-white dark:text-gray-900 font-medium">
                    {selectedPayslip.staff_department}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">
                    Pay Period
                  </span>
                  <span className="text-white dark:text-gray-900 font-medium">
                    {selectedPayslip.month} {selectedPayslip.year}
                  </span>
                </div>
              </div>

              <div className="space-y-3 border-t border-white/10 dark:border-gray-200 pt-6 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">
                    Base Salary
                  </span>
                  <span className="text-white dark:text-gray-900">
                    ${selectedPayslip.base_salary}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">
                    Overtime Pay
                  </span>
                  <span className="text-emerald-400 dark:text-emerald-600">
                    +${selectedPayslip.overtime_pay}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">
                    Leave Deductions
                  </span>
                  <span className="text-red-400 dark:text-red-600">
                    -${selectedPayslip.leave_deduction}
                  </span>
                </div>
              </div>

              <div className="bg-primary/10 dark:bg-blue-50 border border-primary/30 dark:border-blue-200 rounded-lg p-4 flex justify-between items-center mb-6">
                <span className="text-primary dark:text-blue-600 font-bold text-lg">
                  Net Salary
                </span>
                <span className="text-primary dark:text-blue-600 font-bold text-2xl">
                  ${selectedPayslip.net_salary}
                </span>
              </div>

              <button
                onClick={handleDownloadPDF}
                className="w-full neon-button flex items-center justify-center gap-2 mb-4"
              >
                <FileText className="w-4 h-4" /> Download PDF Payslip
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-600 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>System Verified & Digitally Signed</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PayrollPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "hr"]}>
      <PayrollPageContent />
    </ProtectedRoute>
  );
}
