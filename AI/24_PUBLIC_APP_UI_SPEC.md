# AI/24_PUBLIC_APP_UI_SPEC.md

Version: 1.0

Last Updated: 2026-07-14

---

# PUBLIC APP UI SPECIFICATION

This document defines the visual and interaction rules for the Public App.

These rules MUST be followed.

Do NOT change branding.

---

# DO NOT CHANGE

- Logo
- Color Palette
- Typography
- Existing Images
- Brand Identity

Only improve

- Layout
- Spacing
- Navigation
- Components
- Responsiveness
- User Experience

---

# DESIGN GOAL

The application should feel like a modern commercial mobile app.

References

- Spotify
- Gojek
- Traveloka
- Shopee
- Alfagift
- Duolingo

---

# HOME

Required Sections

1. Promo Banner Slider

2. Live Radio

3. Today's Missions

4. Rewards Preview

5. Latest Podcast

6. Featured Content

The homepage should never feel empty.

---

# PROMO SLIDER

Source

WordPress Promo Post Type

Requirements

- Auto Slide
- Swipe Support
- Infinite Loop
- View All button
- Promo Detail Page

Recommended Banner Size

1080 × 540 px

Aspect Ratio

2 : 1

Image should remain below 300 KB.

---

# LIVE PLAYER

Keep existing player.

Improve

- Card layout
- Metadata
- Program information
- CTA buttons

---

# MISSION CARD

Display

- Mission Image
- XP Reward
- Badge Reward
- Difficulty
- Time Remaining

Buttons

- Detail
- Join
- Claim

Never display more than one primary button.

---

# REWARD CARD

Display

- Reward Image
- Required Points
- Category
- Stock

Button

Redeem

Guest users can view.

Login required before redeem.

---

# PODCAST

Source

WordPress

/voks-plus

Card

- Thumbnail
- Duration
- Guest
- Category

Detail

- Large Thumbnail
- Description
- YouTube Player

---

# PROFILE

Sections

- Avatar
- Level
- Badge
- Total VXP
- WhatsApp
- Instagram
- TikTok
- Edit Profile

---

# NAVIGATION

Maximum

5 Tabs

Required

- Home
- Live
- VOKS+
- More
- Profile

Bottom Navigation only.

---

# REWARD POPUP

Replace blocking dialog.

Use

Small Toast Notification

Display

Mission Complete

+50 VXP

Auto Close

3–5 seconds

Must not block interaction.

---

# BUTTONS

Primary

Filled

Secondary

Outlined

Danger

Red

Never create more than two button styles.

---

# CARD STYLE

Rounded

Medium Shadow

Consistent Padding

Touch Friendly

---

# ANIMATION

Allowed

- Fade

- Slide

- Scale

Avoid

Heavy animations

Long transitions

---

# EMPTY STATES

Every page must have

- Empty State

- Loading State

- Error State

Never leave blank screens.

---

# RESPONSIVE

Primary Target

Mobile

Secondary

Tablet

Desktop

Desktop should remain usable.

---

# PERFORMANCE

Lazy load

- Images

- Podcast

- Promo

Avoid unnecessary renders.

---

# ACCESSIBILITY

Minimum touch target

44px

Readable text

High contrast

---

# SUCCESS CRITERIA

The application should feel polished, modern, lightweight, and fast.

Users should immediately understand

- where to listen

- where to join missions

- where to redeem rewards

- where to find promotions

without guidance.