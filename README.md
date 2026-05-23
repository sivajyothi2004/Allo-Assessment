# Allo Inventory Reservation System

## Overview

This project implements an inventory reservation system for multi-warehouse e-commerce inventory management.

Customers can temporarily reserve inventory during checkout to prevent overselling while payment is in progress.

Reservations automatically expire after 10 minutes if not confirmed.

---

## Tech Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- Neon PostgreSQL
- Tailwind CSS

---

## Features

- Product inventory listing
- Multi-warehouse stock management
- Reservation creation
- Reservation confirmation
- Reservation release/cancel
- Reservation expiry handling
- Live countdown timer
- Concurrency-safe reservation transactions

---

## Database Design

### Product
Stores products.

### Warehouse
Stores warehouse locations.

### Inventory
Tracks:
- total stock
- reserved stock

Available stock is calculated as:

availableStock = totalStock - reservedStock

### Reservation
Tracks:
- reservation status
- quantity
- expiry time

---

## Concurrency Handling

Reservation creation uses database transactions through Prisma.

Inventory checks and reservation creation happen atomically to prevent overselling under concurrent requests.

---

## Expiry Handling

Reservations automatically release inventory when the countdown expires on the frontend.

In production, this would ideally be implemented using:
- Vercel Cron Jobs
- Background workers
- Queue-based cleanup

---

## Run Locally

Install dependencies:

```bash
npm install