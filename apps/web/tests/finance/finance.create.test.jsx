import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AdminFinanceDashboard from "@pages/AdminFinanceDashboard.jsx";

vi.mock("@/api/financeApi", () => ({
  fetchFinanceSummary: vi.fn(),
  fetchPayments: vi.fn(),
  fetchUnpaidBookings: vi.fn(),
  recordCashPayment: vi.fn(),
}));

import {
  fetchFinanceSummary,
  fetchPayments,
  fetchUnpaidBookings,
  recordCashPayment,
} from "@/api/financeApi";

describe("Finance create/record cash payment (critical)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    fetchFinanceSummary.mockResolvedValue({
      totalRevenue: 5000,
      totalPaid: 3500,
      pendingCount: 2,
    });

    fetchPayments.mockResolvedValue({ items: [] });

    fetchUnpaidBookings.mockResolvedValue({
      items: [
        {
          bookingId: "BK-100",
          patientName: "Jane Patient",
          testName: "FBC",
          centerName: "Central Lab",
          price: 1500,
          createdAt: new Date().toISOString(),
          paymentMethod: "CASH",
        },
      ],
    });

    recordCashPayment.mockResolvedValue({ success: true });
  });

  it("marks an unpaid booking as paid via Record Cash Payment flow", async () => {
    const user = userEvent.setup();

    render(<AdminFinanceDashboard />);

    await waitFor(() => {
      expect(fetchFinanceSummary).toHaveBeenCalledTimes(1);
      expect(fetchPayments).toHaveBeenCalledTimes(1);
    });

    // Switch to UNPAID tab to display unpaid bookings list
    await user.click(screen.getByRole("button", { name: /unpaid/i }));

    await waitFor(() => {
      expect(fetchUnpaidBookings).toHaveBeenCalledTimes(1);
    });

    await user.click(await screen.findByRole("button", { name: /mark paid/i }));

    // Modal should open
    expect(await screen.findByRole("heading", { name: /record cash payment/i })).toBeInTheDocument();

    // Enter amount and confirm
    const amountInput = screen.getByPlaceholderText(/e\.g\. 1500/i);
    await user.clear(amountInput);
    await user.type(amountInput, "1500");

    await user.click(screen.getByRole("button", { name: /confirm payment/i }));

    await waitFor(() => {
      expect(recordCashPayment).toHaveBeenCalledTimes(1);
    });

    expect(recordCashPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: "BK-100",
        amount: 1500,
      })
    );

    // Successful submit triggers reload (summary + payments are fetched again)
    await waitFor(() => {
      expect(fetchFinanceSummary.mock.calls.length).toBeGreaterThanOrEqual(2);
      expect(fetchPayments.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
