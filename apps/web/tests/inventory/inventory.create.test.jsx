import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AdminInventoryDashboard from "@pages/AdminInventoryDashboard.jsx";

vi.mock("@/api/inventoryApi", () => ({
  fetchInventoryStock: vi.fn(),
  restockInventory: vi.fn(),
}));

import { fetchInventoryStock, restockInventory } from "@/api/inventoryApi";

describe("Inventory create/restock (critical)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("restocks an equipment item and reloads inventory", async () => {
    fetchInventoryStock
      .mockResolvedValueOnce({
        items: [
          {
            _id: "s1",
            equipmentId: { _id: "e1", name: "Syringe", type: "Consumable" },
            availableQuantity: 2,
            minimumThreshold: 5,
          },
        ],
      })
      .mockResolvedValueOnce({
        items: [
          {
            _id: "s1",
            equipmentId: { _id: "e1", name: "Syringe", type: "Consumable" },
            availableQuantity: 12,
            minimumThreshold: 5,
          },
        ],
      });

    restockInventory.mockResolvedValueOnce({ success: true });

    const user = userEvent.setup();

    render(<AdminInventoryDashboard />);

    await waitFor(() => {
      expect(fetchInventoryStock).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("Syringe")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /restock/i }));

    const modalHeading = await screen.findByRole("heading", { name: /restock equipment/i });
    expect(modalHeading).toBeInTheDocument();

    const quantityInput = document.querySelector('input[type="number"]');
    expect(quantityInput).toBeTruthy();
    await user.clear(quantityInput);
    await user.type(quantityInput, "10");

    await user.click(screen.getByRole("button", { name: /confirm restock/i }));

    await waitFor(() => {
      expect(restockInventory).toHaveBeenCalledTimes(1);
    });

    expect(restockInventory).toHaveBeenCalledWith({ equipmentId: "e1", quantity: 10 });

    await waitFor(() => {
      expect(fetchInventoryStock).toHaveBeenCalledTimes(2);
    });
  });
});
