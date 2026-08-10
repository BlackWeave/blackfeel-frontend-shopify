"""
Replace the default Title option on the demo product with Color/Size
options and ensure variants exist with the correct prices.

Idempotent — safe to re-run.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

from shopify_admin import ShopifyAdmin, ShopifyAdminError  # noqa: E402


DEMO_HANDLE = "hello-blackfeel-crew"
DEMO_TITLE = "Hello BlackFeel Crew"
DEMO_IMAGE_URL = (
    "https://images.unsplash.com/photo-1562135291-7728cc647783?w=800&q=80"
)


def banner(msg: str) -> None:
    print()
    print("=" * 60)
    print(msg)
    print("=" * 60)


def main() -> int:
    admin = ShopifyAdmin()

    banner(f"Looking up demo product '{DEMO_HANDLE}'")
    product = admin.get_product_by_handle(DEMO_HANDLE)
    if not product:
        print("ERROR: demo product does not exist; run bootstrap_headless.py first")
        return 1
    product_id = product["id"]
    print(f"  found {product_id} ({product.get('status')})")

    banner("Reading current options / variants / media")
    full = admin.request(
        """
        query ProductFull($id: ID!) {
          product(id: $id) {
            id handle
            options { id name values }
            variants(first: 100) {
              nodes { id title }
            }
            media(first: 10) { nodes { alt } }
          }
        }
        """,
        {"id": product_id},
    )
    options = full["product"].get("options") or []
    variants = full["product"]["variants"]["nodes"]
    media = full["product"]["media"]["nodes"]
    print(f"  options: {[(o['name'], o['values']) for o in options]}")
    print(f"  variants: {len(variants)}")
    print(f"  media: {len(media)}")

    has_color_or_size = any(
        o.get("name", "").lower() in ("color", "size")
        for o in options
    )

    if not has_color_or_size and options:
        banner("Removing default Title option (and its default variant)")
        title_opt = options[0]
        title_opt_id = title_opt["id"]
        # Delete the default variant first (cannot delete last option if
        # variants exist).
        if variants:
            variant_ids = [v["id"] for v in variants]
            data = admin.request(
                """
                mutation DeleteVariants($productId: ID!, $variantsIds: [ID!]!) {
                  productVariantsBulkDelete(productId: $productId, variantsIds: $variantsIds) {
                    product { id }
                    userErrors { field message }
                  }
                }
                """,
                {"productId": product_id, "variantsIds": variant_ids},
            )
            errs = (data.get("productVariantsBulkDelete") or {}).get("userErrors") or []
            if errs:
                print(f"  variant delete errors: {errs}")
            else:
                print(f"  deleted {len(variant_ids)} default variant(s)")

        data = admin.request(
            """
            mutation DeleteOption($productId: ID!, $options: [ID!]!) {
              productOptionsDelete(productId: $productId, options: $options) {
                deletedOptionsIds
                userErrors { field message }
              }
            }
            """,
            {"productId": product_id, "options": [title_opt_id]},
        )
        errs = (data.get("productOptionsDelete") or {}).get("userErrors") or []
        if errs:
            print(f"  option delete errors: {errs}")
        else:
            print(f"  deleted default Title option")

    banner("Adding Color/Size options")
    data = admin.request(
        """
        query Recheck($id: ID!) {
          product(id: $id) {
            options { id name values }
          }
        }
        """,
        {"id": product_id},
    )
    options = data["product"].get("options") or []
    has_color_size = any(
        o.get("name", "").lower() in ("color", "size") for o in options
    )
    if not has_color_size:
        admin.add_product_options(
            product_id,
            [
                {"name": "Color", "values": ["Black", "White", "Charcoal"]},
                {"name": "Size", "values": ["S", "M", "L", "XL"]},
            ],
        )
        print("  options added")
    else:
        print("  options already present")

    banner("Setting prices on variants")
    variants = admin.list_variants(product_id)
    print(f"  {len(variants)} variants present")
    if variants:
        admin.set_variant_prices(
            [
                {
                    "productId": product_id,
                    "id": v["id"],
                    "price": "39.00",
                    "compareAtPrice": "49.00",
                }
                for v in variants
            ]
        )
        print(f"  priced {len(variants)} variants at INR 39.00 (compareAt 49.00)")

    banner("Image attachment")
    if not media:
        admin.upload_image_from_url(product_id, DEMO_IMAGE_URL, alt=f"{DEMO_TITLE} — front")
        print(f"  attached image: {DEMO_IMAGE_URL}")
    else:
        print(f"  already has {len(media)} media item(s)")

    banner("Done")
    print(f"Demo product: /products/{DEMO_HANDLE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())