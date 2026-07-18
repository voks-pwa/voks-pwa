# PROMO DEEP LINK SPEC

WordPress Source

https://voksradio.com/wp-json/wp/v2/promo?_embed

Use ONLY ACF.

Fields

acf.open_mode

acf.deep_link.url

acf.deep_link.target

Behavior

--------------------------------

open_mode

External URL

↓

window.open(acf.deep_link.url)

--------------------------------

open_mode

Internal Route

↓

navigate(route)

--------------------------------

open_mode

Mission

↓

Mission Detail

--------------------------------

open_mode

Reward

↓

Reward Detail

--------------------------------

open_mode

Podcast

↓

VOKS+

--------------------------------

Never hardcode URLs.

Never use promo.link.

Always prioritize

acf.deep_link.url.

Fallback

If deep_link.url empty

↓

Do nothing.

Show warning.

Never crash.