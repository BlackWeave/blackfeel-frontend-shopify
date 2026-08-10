"""
Bulk-create the missing 11 variants for the demo product
'hello-blackfeel-crew'. The existing Black/S variant stays; we add the
other 11 combinations and price them all to INR 39.00 (compareAt 49.00).

Idempotent — re-running detects already-present option values and skips
them.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

from shopify_admin import ShopifyAdmin, ShopifyAdminError  # noqa: E402


DEMO_HANDLE = "hello-blackfeel-crew"

# All 12 (Color, Size) combinations we want.
COMBINATIONS = [
    (color, size)
    for color in ["Black", "White", "Charcoal"]
    for size in ["S", "M", "L", "XL"]
]


def banner(msg: str) -> None:
    print()
    print("=" * 60)
    print(msg)
    print("=" * 60)


def main() -> int:
    admin = ShopifyAdmin()

    banner(f"Reading current state of '{DEMO_HANDLE}'")
    product = admin.get_product_by_handle(DEMO_HANDLE)
    if not product:
        print("ERROR: product not found")
        return 1
    product_id = product["id"]

    data = admin.request(
        """
        query ProductFull($id: ID!) {
          product(id: $id) {
            options { id name values }
            variants(first: 100) {
              nodes {
                id title
                selectedOptions { name value }
              }
            }
          }
        }
        """,
        {"id": product_id},
    )
    options = data["product"]["options"]
    variants = data["product"]["variants"]["nodes"]
    print(f"  options: {[(o['name'], o['values']) for o in options]}")
    print(f"  existing variants: {len(variants)}")
    for v in variants:
        print(f"    {v['title']:20s} {v['id']}")

    existing_keys = set()
    for v in variants:
        key = tuple(
            sorted(
                (o["name"], o["value"])
                for o in v["selectedOptions"]
            )
        )
        existing_keys.add(key)

    missing = []
    for color, size in COMBINATIONS:
        key = tuple(sorted([("Color", color), ("Size", size)]))
        if key not in existing_keys:
            missing.append((color, size))

    banner(f"Creating {len(missing)} missing variants")
    if not missing:
        print("  nothing to create — all 12 combinations already exist")
    else:
        variants_input = [
            {
                "optionValues": [
                    {"optionName": "Color", "name": color},
                    {"optionName": "Size", "name": size},
                ],
                "price": "39.00",
                "compareAtPrice": "49.00",
            }
            for color, size in missing
        ]
        data = admin.request(
            """
            mutation CreateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
              productVariantsBulkCreate(productId: $productId, variants: $variants) {
                productVariants { id title price }
                userErrors { field message }
              }
            }
            """,
            {"productId": product_id, "variants": variants_input},
        )
        result = data.get("productVariantsBulkCreate") or {}
        for err in result.get("userErrors") or []:
            print(f"  userError: {err}")
        new_variants = result.get("productVariants") or []
        print(f"  created {len(new_variants)} variants")
        for v in new_variants:
            print(f"    {v['title']:20s} {v['id']}")

    banner("Setting prices on every variant")
    all_variants = admin.list_variants(product_id)
    price_updates = [
        {
            "productId": product_id,
            "id": v["id"],
            "price": "39.00",
            "compareAtPrice": "49.00",
        }
        for v in all_variants
    ]
    admin.set_variant_prices(price_updates)
    print(f"  priced {len(price_updates)} variants at INR 39.00")

    banner("Done")
    print(f"Demo product: /products/{DEMO_HANDLE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())