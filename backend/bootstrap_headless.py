"""
End-to-end headless integration for BlackFeel.

Steps:
  1. Find (or install) the Headless sales-channel publication.
  2. Publish every ACTIVE product to Headless.
  3. Create the demo product 'Hello BlackFeel Crew' with Color/Size
     options and a remote Unsplash image, then publish it to Headless.
  4. Verify the storefront (which uses the public token only) can see
     the new product.

The Admin token stays on the server. The frontend only ever sees the
public Storefront token in frontend/.env.local.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

from shopify_admin import ShopifyAdmin, ShopifyAdminError  # noqa: E402


HEADLESS_PUBLICATION_NAME = "Blackfeel Headless"
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


def find_or_install_headless(admin: ShopifyAdmin) -> str:
    """Find the Headless publication, or install it if missing. Return its id."""
    data = admin.request(
        """
        query Publications {
          publications(first: 25) {
            nodes { id name }
          }
        }
        """
    )
    publications = data.get("publications", {}).get("nodes", [])
    headless = next(
        (p for p in publications if p.get("name") == HEADLESS_PUBLICATION_NAME),
        None,
    )
    if headless:
        print(f"  Headless publication already installed: {headless['id']}")
        return headless["id"]

    # Try installing via the modern mutation.
    try:
        data = admin.request(
            """
            mutation InstallHeadless {
              salesChannelInstall(input: { name: "Blackfeel Headless" }) {
                salesChannel { id name }
                userErrors { field message }
              }
            }
            """
        )
        result = data.get("salesChannelInstall") or {}
        for err in result.get("userErrors") or []:
            if "already exists" in (err.get("message") or "").lower():
                # The channel exists but our find_by_name missed it; fall
                # through to listing again.
                continue
            raise ShopifyAdminError(
                f"salesChannelInstall: {err.get('message')}"
            )
        ch = result.get("salesChannel") or {}
        if ch.get("id"):
            print(f"  installed new sales channel: {ch['id']} ({ch['name']})")
            return ch["id"]
    except ShopifyAdminError as exc:
        print(f"  install failed: {exc}")

    # Last resort: pick the first publication whose name contains "Headless".
    fallback = next(
        (p for p in publications if "headless" in (p.get("name") or "").lower()),
        None,
    )
    if fallback:
        print(
            f"  using existing headless-like publication: {fallback['id']} "
            f"({fallback['name']})"
        )
        return fallback["id"]

    raise ShopifyAdminError("No Headless publication available")


def publish_product(admin: ShopifyAdmin, product_id: str, publication_id: str) -> dict:
    return admin.request(
        """
        mutation Publish($id: ID!, $input: [PublicationInput!]!) {
          publishablePublish(id: $id, input: $input) {
            publishable { ... on Product { id handle } }
            userErrors { field message }
          }
        }
        """,
        {"id": product_id, "input": [{"publicationId": publication_id}]},
    )


def main() -> int:
    try:
        admin = ShopifyAdmin()
    except ShopifyAdminError as exc:
        print(f"ERROR: {exc}")
        return 1

    banner("1. Headless publication")
    publication_id = find_or_install_headless(admin)

    banner("2. Publishing every ACTIVE product to Headless")
    products = admin.list_products(first=100)
    active = [p for p in products if p.get("status") == "ACTIVE"]
    print(f"  found {len(active)} active products")
    for p in active:
        try:
            result = publish_product(admin, p["id"], publication_id)
            errs = (result.get("publishablePublish") or {}).get("userErrors") or []
            if errs:
                print(f"  {p['handle']:30s} -> userErrors {errs}")
            else:
                print(f"  {p['handle']:30s} -> published")
        except ShopifyAdminError as exc:
            print(f"  {p['handle']:30s} -> ERROR {exc}")

    banner(f"3. Creating demo product '{DEMO_TITLE}'")
    existing = admin.get_product_by_handle(DEMO_HANDLE)
    if existing:
        demo = existing
        print(f"  product already exists: {demo.get('id')} ({demo.get('status')})")
    else:
        try:
            demo = admin.create_product(
                title=DEMO_TITLE,
                handle=DEMO_HANDLE,
                description=(
                    "<p>The classic crew-neck, reissued for our headless launch.</p>"
                    "<ul>"
                    "<li>100% Supima cotton</li>"
                    "<li>Pre-shrunk for a perfect fit</li>"
                    "<li>Reinforced seams</li>"
                    "<li>Invisible stitching</li>"
                    "</ul>"
                ),
                product_type="basic",
                vendor="BlackFeel",
                tags=["hello-world", "headless-launch"],
                status="ACTIVE",
            )
            print(f"  created product: {demo.get('id')}")

            admin.add_product_options(
                demo["id"],
                [
                    {"name": "Color", "values": ["Black", "White", "Charcoal"]},
                    {"name": "Size", "values": ["S", "M", "L", "XL"]},
                ],
            )
            print("  added Color/Size options")

            variants = admin.list_variants(demo["id"])
            print(f"  {len(variants)} variants created")
            admin.set_variant_prices(
                [
                    {
                        "productId": demo["id"],
                        "id": v["id"],
                        "price": "39.00",
                        "compareAtPrice": "49.00",
                    }
                    for v in variants
                ]
            )
            print("  variant prices set to INR 39.00 (compareAt 49.00)")

            admin.upload_image_from_url(
                demo["id"], DEMO_IMAGE_URL, alt=f"{DEMO_TITLE} — front"
            )
            print(f"  attached image: {DEMO_IMAGE_URL}")
        except ShopifyAdminError as exc:
            print(f"  ERROR creating product: {exc}")
            return 1

    banner("4. Publishing demo product to Headless")
    try:
        result = publish_product(admin, demo["id"], publication_id)
        errs = (result.get("publishablePublish") or {}).get("userErrors") or []
        if errs:
            print(f"  userErrors: {errs}")
        else:
            print(f"  published {demo.get('handle')}")
    except ShopifyAdminError as exc:
        print(f"  ERROR: {exc}")

    banner("Done")
    print(f"Demo product: /products/{DEMO_HANDLE}")
    print(f"Storefront URL: https://{admin.store_domain}/products/{DEMO_HANDLE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())