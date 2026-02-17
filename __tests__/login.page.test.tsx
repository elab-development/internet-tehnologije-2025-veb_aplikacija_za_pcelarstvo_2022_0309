/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";

// Mock next/navigation useRouter
const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
});

describe("LoginPage (frontend)", () => {
  beforeEach(() => {
    pushMock.mockClear();
    localStorage.clear();

    // mock fetch
    (global as any).fetch = jest.fn();
  });

  it("logs in successfully: stores token/user and redirects to /hives", async () => {
    // arrange: mock fetch response OK
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "abc123",
        user: { id: 7, role: "BEEKEEPER", fullName: "Pčelar Demo", email: "beekeeper@demo.com" },
      }),
    });

    render(<LoginPage />);

    // Input label-i su "Email" i "Lozinka" u  komponenti
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "beekeeper@demo.com" } });
    fireEvent.change(screen.getByLabelText("Lozinka"), { target: { value: "Demo123!" } });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    // assert: fetch pozvan kako treba
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledTimes(1);
    });

    expect((global as any).fetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );

    // assert: localStorage set
    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("abc123");
    });

    const userRaw = localStorage.getItem("user");
    expect(userRaw).toBeTruthy();
    expect(JSON.parse(userRaw as string)).toMatchObject({
      id: 7,
      role: "BEEKEEPER",
      email: "beekeeper@demo.com",
    });

    // assert: redirect
    expect(pushMock).toHaveBeenCalledWith("/hives");
  });
});
