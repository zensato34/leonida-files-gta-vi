import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import update_news


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def read(self):
        return self.payload


class NewsFeedUpdaterTests(unittest.TestCase):
    def test_fetch_feed_skips_missing_or_invalid_dates_and_unrelated_titles(self):
        xml = b"""<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0"><channel>
          <item>
            <title>GTA VI gameplay details reported</title>
            <link>https://example.com/gta-vi-story</link>
            <description><![CDATA[New gameplay details.]]></description>
            <pubDate>Sun, 15 Nov 2026 12:00:00 -0400</pubDate>
            <source>Example Gaming News</source>
          </item>
          <item>
            <title>GTA VI article without a date</title>
            <link>https://example.com/gta-vi-no-date</link>
            <description>No date.</description>
          </item>
          <item>
            <title>GTA 6 article with malformed date</title>
            <link>https://example.com/gta-vi-bad-date</link>
            <pubDate>not-a-date</pubDate>
          </item>
          <item>
            <title>GTA V weekly update</title>
            <link>https://example.com/gta-v</link>
            <pubDate>Sun, 15 Nov 2026 12:00:00 -0400</pubDate>
          </item>
        </channel></rss>"""
        with patch.object(update_news.urllib.request, "urlopen", return_value=FakeResponse(xml)):
            entries = update_news.fetch_feed("GTA VI", "es-419", "DO", "DO:es")

        self.assertEqual(1, len(entries))
        item = entries[0]
        self.assertEqual("2026-11-15T16:00:00+00:00", item["published_at"])
        self.assertEqual("2026-11-15", item["date"])
        self.assertEqual("Pendiente de verificación", item["status"])
        self.assertEqual("reported", item["kind"])
        self.assertEqual("Google News RSS", item["discovery_source"])
        self.assertEqual(
            "gta-vi-gameplay-details-reported-" +
            hashlib.sha256(b"https://example.com/gta-vi-story").hexdigest()[:12],
            item["id"],
        )

    def test_fetch_feed_uses_the_requested_locale_parameters(self):
        xml = b"""<?xml version="1.0"?><rss><channel></channel></rss>"""
        with patch.object(update_news.urllib.request, "urlopen", return_value=FakeResponse(xml)) as mocked:
            update_news.fetch_feed("GTA VI", "es-419", "DO", "DO:es")

        request = mocked.call_args.args[0]
        params = parse_qs(urlparse(request.full_url).query)
        self.assertEqual(["es-419"], params["hl"])
        self.assertEqual(["DO"], params["gl"])
        self.assertEqual(["DO:es"], params["ceid"])

    def test_main_merges_by_url_and_preserves_previous_feed_items(self):
        with tempfile.TemporaryDirectory() as directory:
            feed_path = Path(directory) / "news-feed.json"
            previous = {
                "generated_at": "2026-11-14T12:00:00+00:00",
                "notice": "Previous feed",
                "items": [{
                    "id": "old-entry",
                    "title": "Old preserved item",
                    "url": "https://example.com/old",
                    "published_at": "2026-11-14T12:00:00+00:00",
                    "kind": "reported",
                    "status": "Pendiente de verificación",
                }],
            }
            feed_path.write_text(json.dumps(previous), encoding="utf-8")
            fresh = {
                "id": "new-entry",
                "title": "New GTA VI item",
                "description": "Pending item",
                "url": "https://example.com/new",
                "source": "Example News",
                "published_at": "2026-11-15T16:00:00+00:00",
                "date": "2026-11-15",
                "status": "Pendiente de verificación",
                "kind": "reported",
                "discovery_source": "Google News RSS",
                "verification_required": True,
            }
            with patch.object(update_news, "OUT", feed_path), \
                 patch.object(update_news, "fetch_feed", return_value=[fresh]), \
                 patch.object(update_news.time, "sleep"):
                update_news.main()

            final = json.loads(feed_path.read_text(encoding="utf-8"))
            urls = {item["url"] for item in final["items"]}
            self.assertEqual({"https://example.com/old", "https://example.com/new"}, urls)
            self.assertEqual(2, len(final["items"]))
            self.assertIn("ni una confirmación editorial", final["notice"])
            self.assertTrue(all(item["status"] == "Pendiente de verificación" for item in final["items"] if item["url"].endswith("/new")))


    def test_normalize_url_ignores_tracking_parameters_and_fragment(self):
        first = "https://Example.com/story?b=2&utm_source=news&a=1#section"
        second = "https://example.com/story?a=1&b=2"
        self.assertEqual(update_news.normalize_url(first), update_news.normalize_url(second))

    def test_main_preserves_editorial_review_when_rss_rediscovers_same_url(self):
        with tempfile.TemporaryDirectory() as directory:
            feed_path = Path(directory) / "news-feed.json"
            reviewed = {
                "id": "reviewed-vgc",
                "title": "VGC review, checked by the editor",
                "description": "Editorially reviewed report.",
                "url": "https://example.com/gta-vi-review?utm_source=editorial",
                "source": "VGC",
                "published_at": "2026-11-18T11:00:00+00:00",
                "date": "2026-11-18",
                "kind": "reported",
                "status": "Reportado",
            }
            previous = {"generated_at": "2026-11-18T12:00:00+00:00", "items": [reviewed]}
            feed_path.write_text(json.dumps(previous), encoding="utf-8")
            rss_duplicate = {
                "id": "rss-review-duplicate",
                "title": "Unreviewed RSS version",
                "description": "Automatic duplicate.",
                "url": "https://example.com/gta-vi-review?utm_campaign=rss",
                "source": "Example News",
                "published_at": "2026-11-18T12:00:00+00:00",
                "date": "2026-11-18",
                "status": "Pendiente de verificación",
                "kind": "reported",
                "discovery_source": "Google News RSS",
                "verification_required": True,
            }
            with patch.object(update_news, "OUT", feed_path), \
                 patch.object(update_news, "fetch_feed", return_value=[rss_duplicate]), \
                 patch.object(update_news.time, "sleep"):
                update_news.main()

            final = json.loads(feed_path.read_text(encoding="utf-8"))
            self.assertEqual(1, len(final["items"]))
            self.assertEqual("reviewed-vgc", final["items"][0]["id"])
            self.assertEqual("Reportado", final["items"][0]["status"])
            self.assertEqual("VGC review, checked by the editor", final["items"][0]["title"])

    def test_main_does_not_truncate_existing_feed_over_sixty_items(self):
        with tempfile.TemporaryDirectory() as directory:
            feed_path = Path(directory) / "news-feed.json"
            existing_items = [{
                "id": f"old-{index}",
                "title": f"Old GTA VI item {index}",
                "description": "Preserve this historical feed item.",
                "url": f"https://example.com/archive/{index}",
                "source": "Example News",
                "published_at": "2026-11-10T12:00:00+00:00",
                "date": "2026-11-10",
                "kind": "reported",
                "status": "Pendiente de verificación",
                "discovery_source": "Google News RSS",
            } for index in range(65)]
            feed_path.write_text(json.dumps({"items": existing_items}), encoding="utf-8")
            new_item = {
                "id": "new-arrival",
                "title": "New GTA VI item",
                "description": "New discovery.",
                "url": "https://example.com/new-arrival",
                "source": "Example News",
                "published_at": "2026-11-18T12:00:00+00:00",
                "date": "2026-11-18",
                "status": "Pendiente de verificación",
                "kind": "reported",
                "discovery_source": "Google News RSS",
                "verification_required": True,
            }
            with patch.object(update_news, "OUT", feed_path), \
                 patch.object(update_news, "fetch_feed", return_value=[new_item]), \
                 patch.object(update_news.time, "sleep"):
                update_news.main()

            final = json.loads(feed_path.read_text(encoding="utf-8"))
            self.assertEqual(66, len(final["items"]))
            self.assertIn("old-0", {item["id"] for item in final["items"]})

if __name__ == "__main__":
    unittest.main(verbosity=2)
