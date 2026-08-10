"""
Shopify Admin API client for BlackFeel backend.

This module is the ONLY place the Shopify Admin API access token is read
or transmitted. The token never leaves the server process.

Usage:
    from shopify_admin import ShopifyAdmin
    admin = ShopifyAdmin()  # reads from env
    admin.publish_to_headless(product_id)

The frontend Storefront API client (`frontend/src/lib/shopify/`) is a
separate code path that uses the public Storefront token only.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Iterable

import requests

ROOT_DIR = Path(__file__).parent


class ShopifyAdminError(RuntimeError):
    """Raised when the Admin API returns a non-2xx response or GraphQL errors."""


class ShopifyAdmin:
    """Thin wrapper around the Shopify Admin GraphQL API (2025-04 stable)."""

    def __init__(
        self,
        store_domain: str | None = None,
        admin_token: str | None = None,
        api_version: str | None = None,
        session: requests.Session | None = None,
    ) -> None:
        # Lazy import dotenv so the module is usable in environments that
        # already have the env vars set.
        try:
            from dotenv import load_dotenv

            load_dotenv(ROOT_DIR / ".env")
        except ImportError:
            pass

        self.store_domain = (
            store_domain
            or os.environ.get("SHOPIFY_STORE_DOMAIN")
            or ""
        ).strip()
        self.admin_token = (
            admin_token or os.environ.get("SHOPIFY_ADMIN_TOKEN") or ""
        ).strip()
        self.api_version = (
            api_version or os.environ.get("SHOPIFY_ADMIN_API_VERSION") or "2025-04"
        ).strip()
        self.session = session or requests.Session()

        if not self.store_domain:
            raise ShopifyAdminError(
                "SHOPIFY_STORE_DOMAIN is not set. Add it to backend/.env."
            )
        if not self.admin_token:
            raise ShopifyAdminError(
                "SHOPIFY_ADMIN_TOKEN is not set. Add it to backend/.env. "
                "Never put the Admin token in frontend/.env.local or any "
                "REACT_APP_* variable."
            )

    @property
    def endpoint(self) -> str:
        return (
            f"https://{self.store_domain}/admin/api/{self.api_version}"
            "/graphql.json"
        )

    @property
    def rest_base(self) -> str:
        return f"https://{self.store_domain}/admin/api/{self.api_version}"

    def request(self, query: str, variables: dict[str, Any] | None = None) -> dict:
        """Execute a GraphQL request and return the `data` payload."""
        response = self.session.post(
            self.endpoint,
            json={"query": query, "variables": variables or {}},
            headers={
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": self.admin_token,
            },
            timeout=30,
        )
        if response.status_code == 401:
            raise ShopifyAdminError(
                "Admin API returned 401 Unauthorized. The token is invalid, "
                "expired, or does not have the scopes required by this query."
            )
        if not response.ok:
            raise ShopifyAdminError(
                f"Admin API HTTP {response.status_code}: {response.text[:500]}"
            )
        payload = response.json()
        if "errors" in payload:
            messages = [
                err.get("message", "unknown")
                for err in payload["errors"]
            ]
            raise ShopifyAdminError(
                f"Admin GraphQL errors: {'; '.join(messages)}"
            )
        return payload.get("data") or {}

    # ---- Sales channels ----

    HEADLESS_CHANNEL_HANDLE = "headless"

    def list_sales_channels(self) -> list[dict]:
        """Return all sales channels on the store."""
        data = self.request(
            """
            query Channels {
              salesChannels(first: 25) {
                nodes { id name handle }
              }
            }
            """
        )
        return data.get("salesChannels", {}).get("nodes", [])

    def find_headless_channel(self) -> dict | None:
        """Find the Headless sales channel by handle."""
        for ch in self.list_sales_channels():
            if ch.get("handle") == self.HEADLESS_CHANNEL_HANDLE:
                return ch
        return None

    def install_headless_channel(self) -> dict:
        """Install the Headless sales channel. Idempotent."""
        existing = self.find_headless_channel()
        if existing:
            return existing
        data = self.request(
            """
            mutation InstallHeadless {
              salesChannelInstall(input: { name: "Headless", handle: "headless" }) {
                salesChannel { id name handle }
                userErrors { field message }
              }
            }
            """
        )
        result = data.get("salesChannelInstall") or {}
        for err in result.get("userErrors") or []:
            raise ShopifyAdminError(f"salesChannelInstall: {err.get('message')}")
        return result.get("salesChannel") or {}

    # ---- Storefront access tokens (public token permissions) ----

    def list_storefront_tokens(self) -> list[dict]:
        """List storefront API access tokens (the public ones)."""
        response = self.session.get(
            f"{self.rest_base}/storefront_access_tokens.json",
            headers={"X-Shopify-Access-Token": self.admin_token},
            timeout=30,
        )
        if not response.ok:
            raise ShopifyAdminError(
                f"storefront_access_tokens HTTP {response.status_code}: "
                f"{response.text[:200]}"
            )
        return response.json().get("storefront_access_tokens") or []

    def create_storefront_token(self, title: str = "Headless Storefront") -> dict:
        """Create a public storefront access token."""
        response = self.session.post(
            f"{self.rest_base}/storefront_access_tokens.json",
            json={"storefront_access_token": {"title": title}},
            headers={
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": self.admin_token,
            },
            timeout=30,
        )
        if not response.ok:
            raise ShopifyAdminError(
                f"create_storefront_access_token HTTP {response.status_code}: "
                f"{response.text[:200]}"
            )
        return response.json().get("storefront_access_token") or {}

    def enable_storefront_api_scopes(self) -> dict:
        """Ensure the storefront API has the read scopes we need.

        The Admin endpoint to update storefront API permissions is a
        Shopify Plus / managed feature. For a typical store the scopes
        are auto-enabled when the Headless channel is installed and the
        storefront token is created via this admin. We just report.
        """
        return {
            "note": (
                "Storefront API scopes are managed at "
                "https://admin.shopify.com/store/<shop>/channels/headless "
                "or in the Headless app settings. Confirm Products, "
                "Product listings, Collections, and Cart are enabled."
            ),
            "tokens": self.list_storefront_tokens(),
        }

    # ---- Products ----

    def list_products(self, first: int = 50, query: str | None = None) -> list[dict]:
        data = self.request(
            """
            query Products($first: Int!, $query: String) {
              products(first: $first, query: $query) {
                nodes {
                  id
                  handle
                  title
                  status
                  productType
                  vendor
                  tags
                  publishedAt
                  collections(first: 10) {
                    nodes { id handle title }
                  }
                }
              }
            }
            """,
            {"first": first, "query": query},
        )
        return data.get("products", {}).get("nodes", [])

    def get_product_by_handle(self, handle: str) -> dict | None:
        data = self.request(
            """
            query ProductByHandle($handle: String!) {
              productByHandle(handle: $handle) {
                id handle title status productType
                publishedAt
              }
            }
            """,
            {"handle": handle},
        )
        return data.get("productByHandle")

    # ---- Variants ----

    def list_variants(self, product_id: str) -> list[dict]:
        data = self.request(
            """
            query Variants($id: ID!) {
              product(id: $id) {
                variants(first: 100) {
                  nodes {
                    id title sku price availableForSale
                    selectedOptions { name value }
                  }
                }
              }
            }
            """,
            {"id": product_id},
        )
        return data.get("product", {}).get("variants", {}).get("nodes", [])

    # ---- Publishable: publish a product to a sales channel ----

    def publish_to_channel(self, product_id: str, channel_id: str) -> dict:
        data = self.request(
            """
            mutation Publish($id: ID!, $input: [PublicationInput!]!) {
              publishablePublish(id: $id, input: $input) {
                publishable { ... on Product { id } }
                userErrors { field message }
              }
            }
            """,
            {"id": product_id, "input": [{"publicationId": channel_id}]},
        )
        result = data.get("publishablePublish") or {}
        for err in result.get("userErrors") or []:
            raise ShopifyAdminError(f"publish: {err.get('message')}")
        return result

    def publish_products_to_headless(self, product_ids: Iterable[str]) -> list[dict]:
        channel = self.install_headless_channel()
        results = []
        for pid in product_ids:
            try:
                results.append(
                    {"productId": pid, "result": self.publish_to_channel(pid, channel["id"])}
                )
            except ShopifyAdminError as exc:
                results.append({"productId": pid, "error": str(exc)})
        return results

    # ---- Collections ----

    def find_collection_by_handle(self, handle: str) -> dict | None:
        data = self.request(
            """
            query Collection($handle: String!) {
              collectionByHandle(handle: $handle) {
                id handle title
              }
            }
            """,
            {"handle": handle},
        )
        return data.get("collectionByHandle")

    def create_collection(
        self, title: str, handle: str, description: str | None = None
    ) -> dict:
        existing = self.find_collection_by_handle(handle)
        if existing:
            return existing
        data = self.request(
            """
            mutation CreateCollection($input: CollectionInput!) {
              collectionCreate(input: $input) {
                collection { id handle title }
                userErrors { field message }
              }
            }
            """,
            {
                "input": {
                    "title": title,
                    "handle": handle,
                    "description": description or "",
                }
            },
        )
        result = data.get("collectionCreate") or {}
        for err in result.get("userErrors") or []:
            raise ShopifyAdminError(f"collectionCreate: {err.get('message')}")
        return result.get("collection") or {}

    def add_products_to_collection(self, collection_id: str, product_ids: list[str]) -> dict:
        data = self.request(
            """
            mutation Collect($id: ID!, $productIds: [ID!]!) {
              collectionAddProducts(id: $id, productIds: $productIds) {
                collection { id handle }
                userErrors { field message }
              }
            }
            """,
            {"id": collection_id, "productIds": product_ids},
        )
        result = data.get("collectionAddProducts") or {}
        for err in result.get("userErrors") or []:
            raise ShopifyAdminError(f"collectionAddProducts: {err.get('message')}")
        return result.get("collection") or {}

    # ---- Create product ----

    def create_product(
        self,
        title: str,
        handle: str | None = None,
        description: str = "",
        product_type: str = "",
        vendor: str = "BlackFeel",
        tags: list[str] | None = None,
        status: str = "ACTIVE",
    ) -> dict:
        data = self.request(
            """
            mutation CreateProduct($input: ProductInput!, $media: [CreateMediaInput!]) {
              productCreate(input: $input, media: $media) {
                product {
                  id handle title status productType
                  variants(first: 1) { nodes { id title } }
                }
                userErrors { field message }
              }
            }
            """,
            {
                "input": {
                    "title": title,
                    "handle": handle,
                    "descriptionHtml": description,
                    "productType": product_type,
                    "vendor": vendor,
                    "tags": tags or [],
                    "status": status,
                },
                "media": [],
            },
        )
        result = data.get("productCreate") or {}
        for err in result.get("userErrors") or []:
            raise ShopifyAdminError(f"productCreate: {err.get('message')}")
        return result.get("product") or {}

    def add_product_options(
        self,
        product_id: str,
        options: list[dict],
    ) -> dict:
        """Add options to a product. `options` is a list of {name, values}.

        Each value is a string like "Black" or "S". The Admin API expects
        OptionValueInput objects, so we transform to {name: value} pairs.
        """
        data = self.request(
            """
            mutation AddOptions($productId: ID!, $options: [OptionCreateInput!]!) {
              productOptionsCreate(productId: $productId, options: $options) {
                product { id }
                userErrors { field message }
              }
            }
            """,
            {
                "productId": product_id,
                "options": [
                    {
                        "name": opt["name"],
                        "values": [{"name": v} for v in opt["values"]],
                    }
                    for opt in options
                ],
            },
        )
        result = data.get("productOptionsCreate") or {}
        for err in result.get("userErrors") or []:
            raise ShopifyAdminError(f"productOptionsCreate: {err.get('message')}")
        return result.get("product") or {}

    def set_variant_prices(
        self,
        variant_updates: list[dict],
    ) -> list[dict]:
        """Bulk update variants. Each update: {id, price, compareAtPrice?, barcode?, inventoryItem?}."""
        data = self.request(
            """
            mutation UpdateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
              productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                product { id }
                productVariants { id title price }
                userErrors { field message }
              }
            }
            """,
            {
                "productId": variant_updates[0]["productId"],
                "variants": [
                    {
                        "id": v["id"],
                        "price": str(v["price"]),
                        "compareAtPrice": (
                            str(v["compareAtPrice"])
                            if v.get("compareAtPrice") is not None
                            else None
                        ),
                    }
                    for v in variant_updates
                ],
            },
        )
        result = data.get("productVariantsBulkUpdate") or {}
        for err in result.get("userErrors") or []:
            raise ShopifyAdminError(f"variantsBulkUpdate: {err.get('message')}")
        return result.get("productVariants") or []

    def upload_image_from_url(self, product_id: str, image_url: str, alt: str = "") -> dict:
        """Upload a remote image to a product via staged upload + create."""
        # Stage the upload using the file's URL.
        data = self.request(
            """
            mutation StageUpload($input: [StagedUploadInput!]!) {
              stagedUploadsCreate(input: $input) {
                stagedTargets {
                  url
                  resourceUrl
                  parameters { name value }
                }
                userErrors { field message }
              }
            }
            """,
            {
                "input": [
                    {
                        "filename": "image.jpg",
                        "mimeType": "image/jpeg",
                        "httpMethod": "POST",
                        "resource": "IMAGE",
                    }
                ]
            },
        )
        staged = (data.get("stagedUploadsCreate") or {}).get("stagedTargets") or []
        if not staged:
            raise ShopifyAdminError("stagedUploadsCreate returned no targets")
        # The Admin API now supports `fileCreate` for remote URLs without
        # the full staged-upload dance for typical public URLs:
        return self._attach_remote_image(product_id, image_url, alt)

    def _attach_remote_image(self, product_id: str, image_url: str, alt: str) -> dict:
        """Use the modern productCreateMedia GraphQL to attach a remote URL."""
        data = self.request(
            """
            mutation AttachMedia($productId: ID!, $media: [CreateMediaInput!]!) {
              productCreateMedia(productId: $productId, media: $media) {
                media { alt }
                product { id }
                userErrors { field message }
              }
            }
            """,
            {
                "productId": product_id,
                "media": [
                    {
                        "originalSource": image_url,
                        "alt": alt,
                        "mediaContentType": "IMAGE",
                    }
                ],
            },
        )
        result = data.get("productCreateMedia") or {}
        for err in result.get("userErrors") or []:
            raise ShopifyAdminError(f"productCreateMedia: {err.get('message')}")
        return result.get("product") or {}

    def set_metafield(
        self,
        owner_id: str,
        namespace: str,
        key: str,
        value: str,
        type_: str = "boolean",
    ) -> dict:
        """Set a product metafield (e.g. custom.cod_available = 'true')."""
        data = self.request(
            """
            mutation SetMetafield($input: MetafieldsSetInput!) {
              metafieldsSet(
                metafields: [$input]
                ownerId: $ownerId
              ) {
                metafields { id key value }
                userErrors { field message }
              }
            }
            """,
            {
                "ownerId": owner_id,
                "input": None,  # placeholder
            },
        )

    # ---- Convenience: full product creation flow ----

    def bootstrap_headless(self) -> dict:
        """Ensure Headless channel is installed. Return a summary dict."""
        channel = self.install_headless_channel()
        tokens = self.list_storefront_tokens()
        return {
            "headlessChannel": channel,
            "storefrontTokens": tokens,
            "note": (
                "If `storefrontTokens` is empty and the public token in "
                "frontend/.env.local returns 401, create a new token here "
                "or in the Headless channel admin and update "
                "frontend/.env.local."
            ),
        }