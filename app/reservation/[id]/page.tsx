"use client";

import { use, useEffect, useState } from "react";

type Reservation = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: string;
  expiresAt: string;
};

export default function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [timeLeft, setTimeLeft] =
    useState("");

  async function fetchReservation() {
    const res = await fetch(
      `/api/reservations/${resolvedParams.id}`
    );

    const data = await res.json();

    setReservation(data);
  }

  useEffect(() => {
    fetchReservation();
  }, []);

  useEffect(() => {
    if (!reservation) return;

    const interval = setInterval(() => {
      const expiry = new Date(
        reservation.expiresAt
      ).getTime();

      const now = new Date().getTime();

      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired");

        fetch(
            `/api/reservations/${resolvedParams.id}/release`,
            {
            method: "POST",
            }
        );

        clearInterval(interval);

        return;
    }

      const minutes = Math.floor(
        diff / 1000 / 60
      );

      const seconds = Math.floor(
        (diff / 1000) % 60
      );

      setTimeLeft(
        `${minutes}m ${seconds}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  async function confirmReservation() {
    const res = await fetch(
      `/api/reservations/${resolvedParams.id}/confirm`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (res.status === 410) {
      alert("Reservation expired");
      return;
    }

    alert(data.message);

    window.location.replace("/");
  }

  async function cancelReservation() {
    const res = await fetch(
      `/api/reservations/${resolvedParams.id}/release`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    alert(data.message);

    window.location.replace("/");
  }

  if (!reservation) {
    return (
      <main className="p-10">
        Loading...
      </main>
    );
  }

  return (
  <main className="min-h-screen bg-gray-100 p-10 flex justify-center items-center">
    <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        Reservation Details
      </h1>

      <div className="space-y-4">
        <p>
          <span className="font-semibold">
            Reservation ID:
          </span>{" "}
          {reservation.id}
        </p>

        <p>
          <span className="font-semibold">
            Quantity:
          </span>{" "}
          {reservation.quantity}
        </p>

        <p>
          <span className="font-semibold">
            Status:
          </span>{" "}
          {reservation.status}
        </p>

        <p className="text-red-500 text-xl font-bold">
          Expires In: {timeLeft}
        </p>

        <div className="flex gap-4 pt-6">
          <button
            onClick={confirmReservation}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
          >
            Confirm Purchase
          </button>

          <button
            onClick={cancelReservation}
            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </main>
);
}