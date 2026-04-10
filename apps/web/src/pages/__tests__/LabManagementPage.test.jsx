import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import LabManagementPage from "../LabManagementPage";

vi.mock("../../api/labApi", () => ({
  fetchLabs: vi.fn(),
  createLab: vi.fn(),
  updateLab: vi.fn(),
  deleteLab: vi.fn(),
}));

import { fetchLabs } from "../../api/labApi";

const mockLabs = [
  {
    _id: "lab1",
    name: "Central Lab",
    district: "Colombo",
    phoneNumber: "0112345678",
    operationalStatus: "OPEN",
    operatingHours: [
      { day: "General", openTime: "08:00", closeTime: "17:00" },
    ],
  },
];

describe("LabManagementPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchLabs.mockResolvedValue(mockLabs);
  });

  it("loads labs on mount and displays them", async () => {
    render(<LabManagementPage />);

    // Header text is always visible
    expect(
      screen.getByRole("heading", { name: /lab management/i })
    ).toBeInTheDocument();

    // Wait for labs to be fetched and rendered
    await waitFor(() => {
      expect(fetchLabs).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("Central Lab")).toBeInTheDocument();
    expect(screen.getByText("Colombo")).toBeInTheDocument();
  });

  it("shows empty state when no labs are returned", async () => {
    fetchLabs.mockResolvedValueOnce([]);

    render(<LabManagementPage />);

    await waitFor(() => {
      expect(fetchLabs).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText(/no labs found/i)).toBeInTheDocument();
  });
});
