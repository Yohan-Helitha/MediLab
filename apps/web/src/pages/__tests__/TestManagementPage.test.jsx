import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TestManagementPage from "../TestManagementPage";

vi.mock("../../api/testApi", () => ({
  fetchTests: vi.fn(),
  createTest: vi.fn(),
  updateTest: vi.fn(),
  deleteTest: vi.fn(),
}));

import { fetchTests } from "../../api/testApi";

const mockTests = [
  {
    _id: "t1",
    name: "Full Blood Count",
    code: "FBC",
    category: "Hematology",
    entryMethod: "form",
  },
  {
    _id: "t2",
    name: "Chest X-Ray",
    code: "CXR",
    category: "Imaging",
    entryMethod: "upload",
  },
];

describe("TestManagementPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchTests.mockResolvedValue(mockTests);
  });

  it("loads tests on mount and displays them", async () => {
    render(<TestManagementPage />);

    expect(
      screen.getByRole("heading", { name: /test management/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchTests).toHaveBeenCalledTimes(1);
    });

    const fullBloodRows = await screen.findAllByText("Full Blood Count");
    expect(fullBloodRows.length).toBeGreaterThan(0);
    expect(screen.getAllByText("Chest X-Ray").length).toBeGreaterThan(0);
  });

  it("filters tests using the search box", async () => {
    render(<TestManagementPage />);

    await waitFor(() => {
      expect(fetchTests).toHaveBeenCalledTimes(1);
    });

    // Both tests visible initially (may be rendered more than once in tests)
    const fullBloodBefore = await screen.findAllByText("Full Blood Count");
    const chestXrayBefore = screen.getAllByText("Chest X-Ray");
    expect(fullBloodBefore.length).toBeGreaterThan(0);
    expect(chestXrayBefore.length).toBeGreaterThan(0);

    // In the test environment the component may render twice, so there can be
    // multiple matching search inputs. Use the first one.
    const [searchInput] = screen.getAllByPlaceholderText(
      /search tests by name, code, or category/i,
    );

    fireEvent.change(searchInput, { target: { value: "FBC" } });

    // After filtering, matching tests for the query should still be visible
    const fullBloodAfter = await screen.findAllByText("Full Blood Count");
    expect(fullBloodAfter.length).toBeGreaterThan(0);

    // And the number of "Chest X-Ray" rows should decrease (often to zero)
    await waitFor(() => {
      expect(screen.queryAllByText("Chest X-Ray").length).toBeLessThan(
        chestXrayBefore.length,
      );
    });

    expect(screen.queryAllByText("Chest X-Ray").length).toBe(0);
  });
});
