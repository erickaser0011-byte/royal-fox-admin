import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  LogOut,
  Loader,
  Trash2,
} from "lucide-react";

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [apiUrl, setApiUrl] = useState("http://localhost:3000");
  const [apiInput, setApiInput] = useState("http://localhost:3000");
  const [deletingId, setDeletingId] = useState(null);

  // Load login state from localStorage on mount
  useEffect(() => {
    const savedLogin = localStorage.getItem("royal-fox-admin-login");
    const savedApiUrl = localStorage.getItem("royal-fox-admin-api-url");
    if (savedLogin === "true") {
      setIsLoggedIn(true);
      if (savedApiUrl) {
        setApiUrl(savedApiUrl);
        setApiInput(savedApiUrl);
      }
    }
  }, []);

  // Login handler
  const handleLogin = () => {
    if (passwordInput === password || passwordInput === "admin123") {
      setIsLoggedIn(true);
      setPasswordInput("");
      localStorage.setItem("royal-fox-admin-login", "true");
      localStorage.setItem("royal-fox-admin-api-url", apiInput);
      setApiUrl(apiInput);
    } else {
      alert("❌ Invalid password");
    }
  };

  // Fetch applications
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/api/applications`);
        const data = await response.json();
        if (data.success) {
          setApplications(data.data);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        alert(
          "❌ Error connecting to backend. Check API URL and ensure server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [isLoggedIn, apiUrl]);

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.personalInfo?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      app.personalInfo?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      app.personalInfo?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      app.applicationId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate =
      filterDate === "all" ||
      (() => {
        const appDate = new Date(app.submittedAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (filterDate === "today") {
          return appDate.toDateString() === today.toDateString();
        } else if (filterDate === "yesterday") {
          return appDate.toDateString() === yesterday.toDateString();
        } else if (filterDate === "week") {
          return appDate >= sevenDaysAgo;
        }
        return true;
      })();

    return matchesSearch && matchesDate;
  });

  // Download file
  const downloadFile = (filePath, fileName) => {
    const url = `${apiUrl}/${filePath}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || filePath.split("/").pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Delete application
  const deleteApplication = async (applicationId) => {
    if (
      !window.confirm(
        `Are you sure you want to delete application ${applicationId}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(applicationId);
      const response = await fetch(
        `${apiUrl}/api/applications/${applicationId}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (data.success) {
        alert("✅ Application deleted successfully");
        setApplications(
          applications.filter((app) => app.applicationId !== applicationId)
        );
        setSelectedApp(null);
      } else {
        alert("❌ Error deleting application");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("❌ Error deleting application");
    } finally {
      setDeletingId(null);
    }
  };

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            🦊 Royal Fox
          </h1>
          <p className="text-center text-gray-600 mb-8">Admin Dashboard</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API URL
              </label>
              <input
                type="text"
                value={apiInput}
                onChange={(e) => setApiInput(e.target.value)}
                placeholder="http://localhost:3000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Default: admin123</p>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-blue-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🦊 Royal Fox Admin</h1>
            <p className="text-purple-100">Application Management Dashboard</p>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Stats */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="🔍 Search by name, email, or application ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
          />

          {/* Filters */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Date
              </label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            📊 Total: <strong>{applications.length}</strong> | 📋 Filtered:{" "}
            <strong>{filteredApplications.length}</strong>
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-purple-600" size={40} />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                {/* Application Card Header */}
                <div
                  onClick={() =>
                    setSelectedApp(selectedApp?._id === app._id ? null : app)
                  }
                  className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">
                      {app.personalInfo?.firstName} {app.personalInfo?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {app.personalInfo?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {app.applicationId} •{" "}
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteApplication(app.applicationId);
                      }}
                      disabled={deletingId === app.applicationId}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-semibold transition"
                    >
                      {deletingId === app.applicationId ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Delete
                    </button>
                    <ChevronDown
                      size={24}
                      className={`text-purple-600 transform transition ${
                        selectedApp?._id === app._id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedApp?._id === app._id && (
                  <div className="border-t p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Info */}
                      <div>
                        <h4 className="font-bold text-purple-700 mb-3">
                          📋 Personal Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>First Name:</strong>{" "}
                            {app.personalInfo?.firstName}
                          </p>
                          <p>
                            <strong>Last Name:</strong>{" "}
                            {app.personalInfo?.lastName}
                          </p>
                          <p>
                            <strong>Middle Name:</strong>{" "}
                            {app.personalInfo?.middleName || "N/A"}
                          </p>
                          <p>
                            <strong>Email:</strong> {app.personalInfo?.email}
                          </p>
                          <p>
                            <strong>Phone:</strong> {app.personalInfo?.phone}
                          </p>
                          <p>
                            <strong>DOB:</strong>{" "}
                            {app.personalInfo?.dob
                              ? new Date(
                                  app.personalInfo.dob
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Work Authorized:</strong>{" "}
                            {app.personalInfo?.workAuthorized
                              ? "✅ Yes"
                              : "❌ No"}
                          </p>
                          <p>
                            <strong>SSN:</strong> {app.personalInfo?.ssn}
                          </p>
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <h4 className="font-bold text-purple-700 mb-3">
                          📍 Address
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Street:</strong> {app.personalInfo?.street}
                          </p>
                          <p>
                            <strong>City:</strong> {app.personalInfo?.city}
                          </p>
                          <p>
                            <strong>State:</strong> {app.personalInfo?.state}
                          </p>
                          <p>
                            <strong>Zip Code:</strong>{" "}
                            {app.personalInfo?.zipCode}
                          </p>
                        </div>
                      </div>

                      {/* ID Information */}
                      <div>
                        <h4 className="font-bold text-purple-700 mb-3">
                          🆔 Identification
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>ID Type:</strong> {app.personalInfo?.idType}
                          </p>
                          <p>
                            <strong>ID Number:</strong>{" "}
                            {app.personalInfo?.idNumber}
                          </p>
                          <p>
                            <strong>Expiration:</strong>{" "}
                            {app.personalInfo?.idExpiration
                              ? new Date(
                                  app.personalInfo.idExpiration
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {app.personalInfo?.idFront ? (
                              <button
                                onClick={() =>
                                  downloadFile(
                                    app.personalInfo.idFront,
                                    `ID-Front-${app.applicationId}`
                                  )
                                }
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-semibold transition"
                              >
                                <Download size={14} /> Download ID Front
                              </button>
                            ) : (
                              <p className="text-gray-500 text-xs">
                                No ID Front uploaded
                              </p>
                            )}
                            {app.personalInfo?.idBack ? (
                              <button
                                onClick={() =>
                                  downloadFile(
                                    app.personalInfo.idBack,
                                    `ID-Back-${app.applicationId}`
                                  )
                                }
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-semibold transition"
                              >
                                <Download size={14} /> Download ID Back
                              </button>
                            ) : (
                              <p className="text-gray-500 text-xs">
                                No ID Back uploaded
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Position Details */}
                      <div>
                        <h4 className="font-bold text-purple-700 mb-3">
                          💼 Position Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Position:</strong>{" "}
                            {app.positionDetails?.positionApplied}
                          </p>
                          <p>
                            <strong>Type:</strong>{" "}
                            {app.positionDetails?.employmentType}
                          </p>
                          <p>
                            <strong>Salary:</strong>{" "}
                            {app.positionDetails?.expectedSalary}
                          </p>
                          <p>
                            <strong>Start Date:</strong>{" "}
                            {app.positionDetails?.startDate
                              ? new Date(
                                  app.positionDetails.startDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Schedule:</strong>{" "}
                            {app.positionDetails?.workSchedule}
                          </p>
                          <p>
                            <strong>Overtime/Travel:</strong>{" "}
                            {app.positionDetails?.willOvertimeTravel
                              ? "✅ Yes"
                              : "❌ No"}
                          </p>
                        </div>
                      </div>

                      {/* Bank Details */}
                      <div>
                        <h4 className="font-bold text-purple-700 mb-3">
                          🏦 Bank Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Bank Name:</strong>{" "}
                            {app.positionDetails?.bankName}
                          </p>
                          <p>
                            <strong>Account Type:</strong>{" "}
                            {app.positionDetails?.bankAccountType}
                          </p>
                          <p>
                            <strong>Holder Name:</strong>{" "}
                            {app.positionDetails?.accountHolderName}
                          </p>
                          <p>
                            <strong>Routing:</strong>{" "}
                            {app.positionDetails?.routingNumber}
                          </p>
                          <p>
                            <strong>Account:</strong>{" "}
                            {app.positionDetails?.accountNumber}
                          </p>
                          <p>
                            <strong>Consent:</strong>{" "}
                            {app.positionDetails?.bankConsent
                              ? "✅ Yes"
                              : "❌ No"}
                          </p>
                        </div>
                      </div>

                      {/* Education */}
                      <div>
                        <h4 className="font-bold text-purple-700 mb-3">
                          🎓 Education
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>High School:</strong>{" "}
                            {app.education?.highSchoolName}
                          </p>
                          <p>
                            <strong>HS Location:</strong>{" "}
                            {app.education?.highSchoolLocation}
                          </p>
                          <p>
                            <strong>College:</strong>{" "}
                            {app.education?.collegeName}
                          </p>
                          <p>
                            <strong>College Location:</strong>{" "}
                            {app.education?.collegeLocation}
                          </p>
                          <p>
                            <strong>Degree:</strong>{" "}
                            {app.education?.collegeDegree}
                          </p>
                          <p>
                            <strong>Licenses:</strong>{" "}
                            {app.education?.licenses || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Employment History */}
                    {app.employmentHistory &&
                      app.employmentHistory.length > 0 && (
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="font-bold text-purple-700 mb-3">
                            📜 Employment History
                          </h4>
                          <div className="space-y-4">
                            {app.employmentHistory.map((job, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-4 rounded border border-gray-200"
                              >
                                <p>
                                  <strong>Entry {idx + 1}:</strong>{" "}
                                  {job.company}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>Title:</strong> {job.jobTitle}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>Supervisor:</strong>{" "}
                                  {job.supervisorName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>Period:</strong>{" "}
                                  {job.dateFrom
                                    ? new Date(
                                        job.dateFrom
                                      ).toLocaleDateString()
                                    : "N/A"}{" "}
                                  -{" "}
                                  {job.dateTo
                                    ? new Date(job.dateTo).toLocaleDateString()
                                    : "N/A"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>Responsibilities:</strong>{" "}
                                  {job.responsibilities}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Documents */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-bold text-purple-700 mb-3">
                        📄 Documents
                      </h4>
                      <div className="flex gap-2">
                        {app.documents?.resume ? (
                          <button
                            onClick={() =>
                              downloadFile(
                                app.documents.resume,
                                `Resume-${app.applicationId}`
                              )
                            }
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
                          >
                            <Download size={18} /> Download Resume
                          </button>
                        ) : (
                          <p className="text-gray-500">No resume uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Consents & Signature */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-bold text-purple-700 mb-3">
                        ✍️ Consents & Signature
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Identity Verification:</strong>{" "}
                          {app.consents?.identityVerification
                            ? "✅ Yes"
                            : "❌ No"}
                        </p>
                        <p>
                          <strong>Bank Verification:</strong>{" "}
                          {app.consents?.bankDetailsVerification
                            ? "✅ Yes"
                            : "❌ No"}
                        </p>
                        <p>
                          <strong>Applicant Name:</strong>{" "}
                          {app.signature?.applicantName}
                        </p>
                        <p>
                          <strong>Signed Date:</strong>{" "}
                          {app.signature?.signedDate
                            ? new Date(
                                app.signature.signedDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="mt-6 pt-6 border-t bg-white p-4 rounded">
                      <p className="text-sm text-gray-600">
                        Submitted:{" "}
                        <span className="font-bold text-purple-700">
                          {new Date(app.submittedAt).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
