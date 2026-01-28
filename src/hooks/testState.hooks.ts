import { useState } from "react";
import { TestState as TestStatus } from "@models/ui-models";

interface TestState {
  status: TestStatus;
  failureReason: string;
  setStatus: (status: TestStatus) => void;
  setFailureReason: (reason: string) => void;
}

/**
 * Custom hook para gestionar el estado de un test.
 * - status: "passed", "failed" o "unknown"
 * - failureReason: solo editable si status === "failed"
 */
export function useTestState(initialStatus: TestStatus = "unknown", initialFailureReason = ""): TestState {
  const [status, setStatusState] = useState<TestStatus>(initialStatus);
  const [failureReason, setFailureReasonState] = useState<string>(
    initialStatus === "failed" ? initialFailureReason : ""
  );

  const setStatus = (newStatus: TestStatus) => {
    setStatusState(() => {
      if (newStatus !== "failed") {
        setFailureReasonState("");
      }
      return newStatus;
    });
  };

  const setFailureReason = (reason: string) => {
    setStatusState(currentStatus => {
      if (currentStatus === "failed") {
        setFailureReasonState(reason);
      }
      return currentStatus;
    });
  };

  return {
    status,
    failureReason,
    setStatus,
    setFailureReason,
  };
}
