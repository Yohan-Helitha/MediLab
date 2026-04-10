import React from "react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TestAvailabilityPage from "../TestAvailabilityPage";

vi.mock("../../api/labApi", () => ({
  fetchLabs: vi.fn(),
}));

vi.mock("../../api/testApi", () => ({
  fetchTests: vi.fn(),
}));

vi.mock("../../api/labTestApi", () => ({
  fetchLabTestsByLab: vi.fn(),
  updateLabTestStatus: vi.fn(),
  updateLabTest: vi.fn(),
  deleteLabTest: vi.fn(),
  createLabTest: vi.fn(),
}));

import { fetchLabs } from "../../api/labApi";
import { fetchTests } from "../../api/testApi";
import { fetchLabTestsByLab, updateLabTestStatus } from "../../api/labTestApi";

const mockLabs = [
  { _id: "lab1", name: "Central Lab" },
];

const mockTests = [
  { _id: "t1", name: "Full Blood Count", code: "FBC", category: "Hematology" },
];

const mockLabTests = [
  {
    _id: "lt1",
    labId: "lab1",
    diagnosticTestId: {
      _id: "t1",
      name: "Full Blood Count",
      code: "FBC",
      category: "Hematology",
      description: "Blood test",
    },
    price: 1500,
    estimatedResultTimeHours: 4,
    availabilityStatus: "AVAILABLE",
  },
];

describe("TestAvailabilityPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchLabs.mockResolvedValue(mockLabs);
    fetchTests.mockResolvedValue(mockTests);
    fetchLabTestsByLab.mockResolvedValue(mockLabTests);
    updateLabTestStatus.mockResolvedValue({});
  });

  it("loads labs and lab tests for the first lab and displays them", async () => {
    render(<TestAvailabilityPage />);

    expect(
      screen.getByRole("heading", { name: /test availability/i })
    ).toBeInTheDocument();

    // Wait for initial data loads
    await waitFor(() => {
      expect(fetchLabs).toHaveBeenCalledTimes(1);
      expect(fetchLabTestsByLab).toHaveBeenCalledWith("lab1");
    });

    expect(await screen.findByText("Full Blood Count")).toBeInTheDocument();
    expect(screen.getByText(/1500.00/)).toBeInTheDocument();
    expect(screen.getByText(/4 hours/)).toBeInTheDocument();
  });

  it("toggles availability and calls API", async () => {
    render(<TestAvailabilityPage />);

    await waitFor(() => {
      expect(fetchLabTestsByLab).toHaveBeenCalledWith("lab1");
    });

    // The toggle label is "Available" for AVAILABLE status. In React 18 tests
    // components can be rendered twice (StrictMode), so there may be multiple
    // matching buttons; interact with the first one.
    const toggles = await screen.findAllByRole("button", { name: /available/i });

    fireEvent.click(toggles[0]);

    await waitFor(() => {
      expect(updateLabTestStatus).toHaveBeenCalledWith("lt1", "UNAVAILABLE");
    });
  });
});
