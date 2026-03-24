import { ORDER_PROGRESS_FLOW, ORDER_STATE_INFO, ORDER_STATES } from "../services/orderService";

function ProgressIndicator({ currentState, compact = false }) {
  const isCancelled = currentState === ORDER_STATES.CANCELLED;

  // Filter out cancelled state from progress flow
  const progressSteps = ORDER_PROGRESS_FLOW;

  // Get current step index
  const currentStepIndex = progressSteps.indexOf(currentState);

  // If cancelled, show special state
  if (isCancelled) {
    return (
      <div className="w-full">
        {compact ? (
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
              <span className="text-sm font-medium text-red-800">
                {ORDER_STATE_INFO.CANCELLED.label}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            {progressSteps.map((step, index) => (
              <div key={step} className="flex-1 flex items-center">
                <div className="w-full flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 18 18" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 text-center">
                    {ORDER_STATE_INFO[step]?.label}
                  </span>
                </div>
                {index < progressSteps.length - 1 && (
                  <div className="flex-1 h-1 bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {progressSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                  isCompleted
                    ? "bg-[#e91e63] text-white"
                    : isCurrent
                    ? "bg-[#e91e63] text-white ring-4 ring-[#e91e63]/20"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < progressSteps.length - 1 && (
                <div
                  className={`w-8 h-1 transition-all duration-300 ${
                    isCompleted ? "bg-[#e91e63]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-2">
        {progressSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step} className="flex-1 flex items-center">
              <div className="w-full flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    isCompleted
                      ? "bg-[#e91e63] text-white"
                      : isCurrent
                      ? "bg-[#e91e63] text-white ring-4 ring-[#e91e63]/20"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-1 text-center transition-colors duration-300 ${
                    isCompleted || isCurrent
                      ? "text-[#e91e63] font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {ORDER_STATE_INFO[step]?.label}
                </span>
              </div>
              {index < progressSteps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-1 sm:mx-2 rounded-full transition-all duration-300 ${
                    isCompleted ? "bg-[#e91e63]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Status Badge */}
      {currentStepIndex >= 0 && (
        <div className="flex items-center justify-center mt-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              ORDER_STATE_INFO[currentState]?.bgColor || "bg-gray-100"
            } ${ORDER_STATE_INFO[currentState]?.textColor || "text-gray-800"}`}
          >
            {ORDER_STATE_INFO[currentState]?.icon &&
              (() => {
                const icon = ORDER_STATE_INFO[currentState]?.icon;
                if (icon === "clock")
                  return (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  );
                if (icon === "hourglass")
                  return (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 22h14" />
                      <path d="M5 2h14" />
                      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L5 2v20" />
                    </svg>
                  );
                if (icon === "package")
                  return (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m7.5 4.27 9 5.15" />
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22v-9" />
                    </svg>
                  );
                if (icon === "checkCircle")
                  return (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  );
                return null;
              })()}
            <span className="text-sm font-medium">
              {ORDER_STATE_INFO[currentState]?.label || currentState}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressIndicator;
