"""
Sitemaps for static frontend routes.

These sitemap entries cover the SPA's primary routes so search engines can
discover them more reliably. If you add server-rendered detail pages later,
extend this with dynamic sitemaps.
"""
from __future__ import annotations

from django.contrib.sitemaps import Sitemap  # type: ignore


class StaticViewSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.6

    def items(self):
        # Single-page Next.js application root
        return ["/"]

    def location(self, item):  # type: ignore[override]
        return item
