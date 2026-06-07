export const dynamic = "force-dynamic";
export const revalidate = 0;

import React from "react";
import Link from "next/link";
import ProductActions from "@/components/admin/ProductActions";
import { prisma } from "@/lib/db/prisma";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      category: true,
      images: {
        orderBy: {
          position: "asc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-serif">Products</h1>

        <Link href="/admin/products/new" className="btn btn-primary">
          New Product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2">Image</th>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Brand</th>
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">SKU</th>
              <th className="text-left p-2">Price</th>
              <th className="text-left p-2">Stock</th>
              <th className="text-left p-2">Published</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const firstImage = product.images[0];

                return (
                  <tr key={product.id} className="border-t">
                    <td className="p-2">
                      {firstImage ? (
                        <img
                          src={firstImage.url}
                          alt={firstImage.altText || product.title}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-slate-100" />
                      )}
                    </td>

                    <td className="p-2">{product.title}</td>
                    <td className="p-2">{product.brand?.name ?? "—"}</td>
                    <td className="p-2">{product.category?.name ?? "—"}</td>
                    <td className="p-2">{product.sku ?? "—"}</td>
                    <td className="p-2">${(product.price / 100).toFixed(2)}</td>
                    <td className="p-2">{product.stock}</td>

                    <td className="p-2">
                      {product.isPublished ? (
                        <span className="rounded bg-gold px-2 py-1 text-sm text-white">
                          Published
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-600">
                          Draft
                        </span>
                      )}
                    </td>

                    <td className="p-2">
                      <ProductActions
                        productId={product.id}
                        editHref={`/admin/products/${product.id}/edit`}
                        productTitle={product.title}
                        isPublished={product.isPublished}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}