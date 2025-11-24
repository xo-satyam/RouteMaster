import {
  ChevronUp,
  MapPin,
  Clock,
  X,
  Maximize2,
  Bus,
  Footprints as Walk,
  Train,
  Car,
} from "lucide-react";
import { useState } from "react";
import { Route } from "../../services/backendService";
import "./ResultsPanel.css";

interface ResultsPanelProps {
  currentRoute: Route | null;
  isCalculating: boolean;
  onClose: () => void;
}

/* ---------------- TIME FORMATTING ---------------- */
const formatDuration = (duration: any): string => {
  let minutes = 0;

  if (typeof duration === "number") {
    minutes = duration;
  } else if (typeof duration === "string") {
    const match = duration.match(/(\d+)/);
    minutes = match ? parseInt(match[1]) : 0;
  }

  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }

  return `${minutes} min`;
};

/* ---------------- DISTANCE FORMATTING ---------------- */
const formatDistance = (distance: any): string => {
  let meters = 0;

  if (typeof distance === "number") {
    meters = distance;
  } else if (typeof distance === "string") {
    const match = distance.match(/(\d+(\.\d+)?)/);
    meters = match ? parseFloat(match[1]) : 0;
  }

  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }

  return `${meters.toFixed(1)} m`;
};

/* ---------------- ICON + COLOR BASED ON MODE ---------------- */
const getModeIcon = (mode: string) => {
  switch (mode) {
    case "walking":
      return <Walk size={20} />;
    case "metro":
      return <Train size={20} />;
    case "bus":
      return <Bus size={20} />;
    case "car":
    case "cab":
    case "taxi":
      return <Car size={20} />;
    default:
      return <MapPin size={20} />;
  }
};

const getModeColor = (mode: string) => {
  switch (mode) {
    case "walking":
      return "#64748b"; // gray
    case "metro":
      return "#2563eb"; // blue
    case "bus":
      return "#16a34a"; // green
    case "car":
    case "cab":
    case "taxi":
      return "#9333ea"; // purple
    case "auto":
      return "#f59e0b"; // yellow-orange  
    default:
      return "#0ea5e9";
  }
};

export default function ResultsPanel({
  currentRoute,
  isCalculating,
  onClose,
}: ResultsPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!currentRoute && !isCalculating) return null;

  const totalDistance = currentRoute?.steps?.reduce((a: number, step: any) => {
    let d = parseFloat(step.distance) || 0;
    return a + (isNaN(d) ? 0 : d);
  }, 0) || 0;

  return (
    <div
      className={`results-panel ${isMinimized ? "minimized" : ""} ${
        isFullscreen ? "fullscreen" : ""
      }`}
    >
      {/* HEADER */}
      <div className="results-header">
        <div className="header-content">
          <h2 className="header-title">Route Found ✨</h2>
          <div className="header-controls">
            <button
              className="control-btn"
              onClick={() => setIsMinimized(!isMinimized)}
              aria-label="Minimize"
            >
              <ChevronUp size={20} />
            </button>

            <button
              className="control-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 size={20} />
            </button>

            <button className="control-btn close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* STATS */}
          <div className="route-stats">
            <div className="stat-item">
              <Clock size={18} />
              <span>{formatDuration(currentRoute?.total_duration)}</span>
            </div>
            <div className="stat-divider"></div>

            <div className="stat-item">
              <MapPin size={18} />
              <span>{formatDistance(totalDistance)}</span>
            </div>
            <div className="stat-divider"></div>

            <div className="stat-item cost-item">
              ₹{currentRoute?.total_cost || 0}
            </div>
          </div>

          {/* LOADING */}
          {isCalculating ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Calculating best route...</p>
            </div>
          ) : (
            <>
              <h3 className="journey-title">YOUR JOURNEY</h3>

              <div className="journey-steps">
                {currentRoute?.steps?.map((step: any, i: number) => {
                  const color = getModeColor(step.mode);

                  return (
                    <div key={i} className="journey-step">
                      <div
                        className="step-marker"
                        style={{
                          borderColor: color,
                          color: color,
                          background: `${color}15`,
                        }}
                      >
                        {getModeIcon(step.mode)}
                      </div>

                      <div className="step-content">
                        <h4>{step.instructions || "No instruction"}</h4>

                        <div className="step-details">
                          <span className="detail-item">
                            <Clock size={14} />
                            {formatDuration(step.duration)}
                          </span>

                          <span className="detail-item">
                            <MapPin size={14} />
                            {formatDistance(step.distance)}
                          </span>

                          {step.cost ? (
                            <span className="detail-item">₹{step.cost}</span>
                          ) : null}
                        </div>

                        {step.mode && (
                          <span
                            className="step-badge"
                            style={{
                              background: color,
                            }}
                          >
                            {step.mode.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACTION BUTTONS */}
              <div className="action-buttons">
                <button className="btn btn-primary">Save This Route</button>
                <button className="btn btn-secondary">Share Journey</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
