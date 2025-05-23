"use client";

import { useEffect, useState } from "react";
import { AuthService } from "@/services/poc/auth.service";
import { SessionInfo } from "@/types/auth";
import { useAuthStore } from "@/store/poc/authStore";

export default function SessionManager() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionsData = await AuthService.getSessions();
      setSessions(sessionsData);
    } catch (err) {
      setError("Failed to load sessions. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    if (!isAuthenticated) return;

    setRevoking(sessionId);
    try {
      await AuthService.revokeSession(sessionId);
      setSessions((prevSessions) =>
        prevSessions.filter((s) => s.id !== sessionId)
      );
    } catch (err) {
      setError("Failed to revoke session. Please try again.");
      console.error(err);
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    if (
      !isAuthenticated ||
      !window.confirm(
        "Are you sure you want to revoke all sessions? You will be logged out from all devices."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await AuthService.logoutAll();
      setSessions([]);
    } catch (err) {
      setError("Failed to revoke all sessions. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-4">
        Please log in to manage your sessions.
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Active Sessions</h2>
        <button
          onClick={fetchSessions}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No active sessions found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Device
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Started
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Expires
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {session.deviceInfo || "Unknown Device"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(session.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(session.expiresAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRevoke(session.id)}
                        disabled={revoking === session.id}
                        className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                      >
                        {revoking === session.id ? "Revoking..." : "Revoke"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-right">
            <button
              onClick={handleRevokeAll}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Revoke All Sessions
            </button>
          </div>
        </>
      )}
    </div>
  );
}
