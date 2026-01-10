'use client';

import { useState } from 'react';
import { Settings, Bell, Globe, Database, Shield, Info } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    highRisk: true,
    dailyReport: false,
    weeklyDigest: true,
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        title="Settings"
        subtitle="Configure your FireWatch preferences"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div>
                <p className="font-medium text-white">High Risk Alerts</p>
                <p className="text-sm text-gray-400">
                  Get notified when fire risk reaches high or extreme levels
                </p>
              </div>
              <button
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, highRisk: !prev.highRisk }))
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications.highRisk ? 'bg-orange-500' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    notifications.highRisk ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div>
                <p className="font-medium text-white">Daily Report</p>
                <p className="text-sm text-gray-400">
                  Receive daily fire risk summary via email
                </p>
              </div>
              <button
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, dailyReport: !prev.dailyReport }))
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications.dailyReport ? 'bg-orange-500' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    notifications.dailyReport ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-white">Weekly Digest</p>
                <p className="text-sm text-gray-400">
                  Get a weekly summary of fire activity and trends
                </p>
              </div>
              <button
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, weeklyDigest: !prev.weeklyDigest }))
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications.weeklyDigest ? 'bg-orange-500' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    notifications.weeklyDigest ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-500" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Backend URL</label>
              <input
                type="text"
                defaultValue="http://localhost:5000"
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                readOnly
              />
              <p className="text-xs text-gray-500">
                Configure via NEXT_PUBLIC_API_URL environment variable
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Region Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-500" />
              Region Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Region</label>
                <input
                  type="text"
                  defaultValue="Almora, Uttarakhand"
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Coordinates</label>
                <input
                  type="text"
                  defaultValue="29.5971°N, 79.6591°E"
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  readOnly
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-500" />
              About FireWatch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-gray-300">
                FireWatch is an AI-powered forest fire prediction and monitoring system
                designed for the Almora region of Uttarakhand, India. Using advanced
                machine learning models (CNN-LSTM) and satellite data, we provide
                real-time fire risk assessments to help prevent and manage forest fires.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">CNN-LSTM</p>
                  <p className="text-xs text-gray-500">Model Architecture</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">85%+</p>
                  <p className="text-xs text-gray-500">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">Real-time</p>
                  <p className="text-xs text-gray-500">Updates</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="secondary">Reset to Defaults</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
