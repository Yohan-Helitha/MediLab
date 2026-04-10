import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import "@/i18n.js";
import BookingCreatePage from "@pages/BookingCreatePage.jsx";
import { AuthContext } from "@context/AuthContext.jsx";

vi.mock("@/api/bookingApi", () => ({
  createBooking: vi.fn(),
  createPayHereCheckout: vi.fn(),
}));

import { createBooking } from "@/api/bookingApi";

describe("Booking create (critical)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a booking via 'Save Booking' and navigates to /booking", async () => {
    createBooking.mockResolvedValueOnce({ booking: { _id: "b1" } });

    const user = userEvent.setup();

    const authValue = {
      user: {
        profile: {
          _id: "p1",
          full_name: "John Patient",
          contact_number: "0712345678",
          email: "john@example.com",
        },
      },
    };

    const entry = {
      pathname: "/booking/create",
      state: {
        lab: {
          _id: "lab1",
          name: "Central Lab",
          operatingHours: [{ day: "General", openTime: "08:00", closeTime: "17:00" }],
        },
        labTest: {
          labId: "lab1",
          price: 1500,
          diagnosticTestId: { _id: "t1", name: "Full Blood Count" },
        },
      },
    };

    const { container } = render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[entry]}>
          <Routes>
            <Route path="/booking/create" element={<BookingCreatePage />} />
            <Route path="/booking" element={<div>Booking List</div>} />
            <Route path="/health-centers" element={<div>Health Centers</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Fill only required field
    const dateInput = container.querySelector('input[type="date"]');
    expect(dateInput).toBeTruthy();
    await user.type(dateInput, "2026-04-10");

    await user.click(screen.getByRole("button", { name: /save booking/i }));

    await waitFor(() => {
      expect(createBooking).toHaveBeenCalledTimes(1);
    });

    expect(createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        patientProfileId: "p1",
        healthCenterId: "lab1",
        diagnosticTestId: "t1",
        bookingDate: "2026-04-10",
      })
    );

    expect(await screen.findByText("Booking List")).toBeInTheDocument();
  });
});
