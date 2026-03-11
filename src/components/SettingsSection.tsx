"use client";

import { useState, useEffect } from "react";
import { FaCog, FaFolder, FaCheckCircle, FaTimesCircle, FaSave } from "react-icons/fa";

interface SettingsSectionProps {
  onJhovePathChange?: (path: string) => void;
}

export default function SettingsSection({ onJhovePathChange }: SettingsSectionProps) {
  const [jhovePathInput, setJhovePathInput] = useState("");
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [detectedPath, setDetectedPath] = useState<string | null>(null);
  const [isTauri, setIsTauri] = useState(false);

  // Check if we're in a Tauri environment
  useEffect(() => {
    const checkTauri = async () => {
      try {
        // Try to dynamically import Tauri - if successful, we're in desktop mode
        await import('@tauri-apps/api/core');
        setIsTauri(true);
      } catch {
        setIsTauri(false);
      }
    };
    checkTauri();
  }, []);

  useEffect(() => {
    if (isTauri) {
      loadCurrentPath();
    }
  }, [isTauri]);

  const loadCurrentPath = async () => {
    if (!isTauri) return;

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const path = await invoke<string | null>('get_jhove_path');
      setCurrentPath(path);
      if (path) {
        setJhovePathInput(path);
        setIsValid(true);
      }
    } catch (error) {
      console.error("Failed to load JHOVE path:", error);
    }
  };



  const handleBrowse = async () => {
    if (!isTauri) return;

    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        multiple: false,
        directory: false,
        title: 'Select JHOVE Executable',
        filters: [{
          name: 'Executable',
          extensions: ['*']
        }]
      });

      if (selected && typeof selected === 'string') {
        setJhovePathInput(selected);
        validatePath(selected);
      }
    } catch (error) {
      console.error("Failed to open file dialog:", error);
    }
  };

  const validatePath = async (path: string) => {
    if (!isTauri || !path) {
      setIsValid(null);
      return;
    }

    setIsValidating(true);
    setIsValid(null);

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const valid = await invoke<boolean>('validate_jhove_path', { path });
      setIsValid(valid);
      
      if (valid) {
        setDetectedPath(path);
      }
    } catch (error) {
      console.error("Failed to validate JHOVE path:", error);
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!isTauri || !jhovePathInput || isValid !== true) {
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const success = await invoke<boolean>('set_jhove_path', { path: jhovePathInput });
      
      if (success) {
        setCurrentPath(jhovePathInput);
        setSaveMessage("Settings saved successfully!");
        if (onJhovePathChange) {
          onJhovePathChange(jhovePathInput);
        }
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save JHOVE path:", error);
      setSaveMessage(`Error: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoDetect = async () => {
    if (!isTauri) return;

    setIsValidating(true);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const path = await invoke<string | null>('get_jhove_path');
      
      if (path) {
        setJhovePathInput(path);
        setDetectedPath(path);
        setIsValid(true);
        setSaveMessage("JHOVE installation detected!");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage("No JHOVE installation found. Please set the path manually.");
        setTimeout(() => setSaveMessage(null), 5000);
      }
    } catch (error) {
      console.error("Failed to detect JHOVE:", error);
      setSaveMessage("Failed to detect JHOVE installation");
    } finally {
      setIsValidating(false);
    }
  };

  if (!isTauri) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <FaCog className="text-3xl text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Settings are only available in the desktop application. You are currently using the web version.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FaCog className="text-3xl text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        </div>

        {/* JHOVE CLI Path Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <FaFolder className="text-indigo-600" />
            JHOVE CLI Tool
          </h3>
          
          {/* Current Path Display */}
          {currentPath && (
            <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Current JHOVE Path:</p>
              <p className="text-sm font-mono text-gray-800 break-all">{currentPath}</p>
            </div>
          )}

          {/* Path Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JHOVE Executable Path
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={jhovePathInput}
                onChange={(e) => {
                  setJhovePathInput(e.target.value);
                  setIsValid(null);
                }}
                onBlur={() => jhovePathInput && validatePath(jhovePathInput)}
                placeholder="/usr/local/bin/jhove or /path/to/jhove"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={handleBrowse}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-colors flex items-center gap-2"
              >
                <FaFolder />
                Browse
              </button>
            </div>
            
            {/* Validation Status */}
            {isValidating && (
              <p className="mt-2 text-sm text-blue-600">Validating path...</p>
            )}
            {isValid === true && (
              <div className="mt-2 flex items-center gap-2 text-green-600">
                <FaCheckCircle />
                <span className="text-sm">Valid JHOVE installation found</span>
              </div>
            )}
            {isValid === false && (
              <div className="mt-2 flex items-center gap-2 text-red-600">
                <FaTimesCircle />
                <span className="text-sm">Invalid path or JHOVE not found</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAutoDetect}
              disabled={isValidating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              {isValidating ? "Detecting..." : "Auto-Detect JHOVE"}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={isSaving || isValid !== true || !jhovePathInput}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FaSave />
            {isSaving ? "Saving..." : "Save Settings"}
          </button>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mt-4 p-3 rounded ${
              saveMessage.includes("success") 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {saveMessage}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="ml-3">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">How to configure JHOVE:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Auto-Detect JHOVE" to search common installation locations</li>
              <li>Or click "Browse" to manually select the JHOVE executable</li>
              <li>The path will be validated automatically</li>
              <li>Click "Save Settings" to store your configuration</li>
            </ol>
            <p className="text-sm text-blue-700 mt-3">
              Don't have JHOVE installed? Download it from: <a href="https://jhove.openpreservation.org/getting-started/" target="_blank" rel="noopener noreferrer" className="underline">jhove.openpreservation.org</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
