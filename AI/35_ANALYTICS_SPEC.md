# ANALYTICS 2.0 SPEC

Purpose

Transform Admin Dashboard into Business Dashboard.

---

Sources

Supabase

- profiles

- xp_transactions

- rewards

- reward_redemptions

- missions

- notifications

WordPress

https://voksradio.com/wp-json/wp/v2/promo?_embed

https://voksradio.com/wp-json/wp/v2/voks-plus?_embed

https://voksradio.com/wp-json/wp/v2/notification?_embed

Azuracast

GET

https://a7.alhastream.com/api/station/42/listeners
API Key AzuraCast : 6ddf926794d5ca81:89292106ffa9e0d6cf9a7e16f78d5b79

---

Dashboard Cards

Users

Listeners

Rewards

Mission Completion

Podcast

Promo

Broadcast

Notifications

Current Listener

---

Charts

Daily Listener

Daily User

Reward Trend

Mission Trend

XP Trend

Broadcast Trend

---

Export

CSV

Excel

---

Performance

Realtime cards

Charts cached

No duplicate queries

Reuse Edge Functions whenever possible