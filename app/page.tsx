"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProductItem = {
  inventoryId: string;
  productId: string;
  warehouseId: string;
  product: string;
  warehouse: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
};

type GroupedProduct = {
  productId: string;
  product: string;
  inventories: ProductItem[];
};

export default function HomePage() {
  const [products, setProducts] = useState<
    GroupedProduct[]
  >([]);

  const [loading, setLoading] =
    useState(false);
  const router = useRouter();

  async function fetchProducts() {
    const res = await fetch("/api/products", {
    cache: "no-store",
  });

    const data: ProductItem[] =
      await res.json();

    const groupedMap = new Map<
      string,
      GroupedProduct
    >();

    data.forEach((item) => {
      if (
        !groupedMap.has(item.productId)
      ) {
        groupedMap.set(item.productId, {
          productId: item.productId,
          product: item.product,
          inventories: [],
        });
      }

      groupedMap
        .get(item.productId)!
        .inventories.push(item);
    });

    setProducts(
      Array.from(groupedMap.values())
    );
  }

  useEffect(() => {
    fetchProducts();

    const interval = setInterval(() => {
      fetchProducts();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  async function reserveItem(
    productId: string,
    warehouseId: string
  ) {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            productId,
            warehouseId,
            quantity: 1,
          }),
        }
      );

      const data = await res.json();

      if (res.status === 409) {
        alert("Not enough stock");
        return;
      }

      router.refresh();

    window.location.href =
      `/reservation/${data.id}`;

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold mb-8">
        Inventory System
      </h1>

      <div className="space-y-8">
        {products.map((product) => (
          <div
            key={product.productId}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-4">
              {product.product}
            </h2>

            <div className="space-y-4">
              {product.inventories.map(
                (inventory) => (
                  <div
                    key={
                      inventory.inventoryId
                    }
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p>
                        <span className="font-semibold">
                          Warehouse:
                        </span>{" "}
                        {
                          inventory.warehouse
                        }
                      </p>

                      <p>
                        <span className="font-semibold">
                          Total Stock:
                        </span>{" "}
                        {
                          inventory.totalStock
                        }
                      </p>

                      <p>
                        <span className="font-semibold">
                          Reserved Stock:
                        </span>{" "}
                        {
                          inventory.reservedStock
                        }
                      </p>

                      <p className="font-bold">
                        Available Stock:{" "}
                        {
                          inventory.availableStock
                        }
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        reserveItem(
                          inventory.productId,
                          inventory.warehouseId
                        )
                      }
                      disabled={
                        loading ||
                        inventory.availableStock <=
                          0
                      }
                      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                    >
                      Reserve
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}