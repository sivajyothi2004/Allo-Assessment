import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      productId,
      warehouseId,
      quantity,
    } = body;

    const reservation =
      await prisma.$transaction(
        async (tx) => {
          const inventory =
            await tx.inventory.findUnique({
              where: {
                productId_warehouseId: {
                  productId,
                  warehouseId,
                },
              },
            });

          if (!inventory) {
            throw new Error(
              "Inventory not found"
            );
          }

          const available =
            inventory.totalStock -
            inventory.reservedStock;

          if (available < quantity) {
            throw new Error(
              "Not enough stock"
            );
          }

          await tx.inventory.update({
            where: {
              id: inventory.id,
            },
            data: {
              reservedStock: {
                increment: quantity,
              },
            },
          });

          const createdReservation =
            await tx.reservation.create({
              data: {
                productId,
                warehouseId,
                quantity,
                expiresAt: new Date(
                  Date.now() +
                    10 * 60 * 1000
                ),
              },
            });

          return createdReservation;
        }
      );

    return NextResponse.json(
      reservation
    );
  } catch (error: any) {
    console.error(error);

    if (
      error.message ===
      "Not enough stock"
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}