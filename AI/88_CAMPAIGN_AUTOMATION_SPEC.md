# Campaign Automation Specification

## Philosophy

Campaign should manage itself.

Marketing creates Campaign.

System runs Campaign.

Developer never manually starts or stops Campaign.

---

Campaign States

Draft

Upcoming

Running

Ending Soon

Ended

Archived

Hidden

---

Scheduler

Every application load

or

Background scheduler

evaluates

campaign_start

campaign_end

campaign_active

featured

priority

---

Automation

Auto Publish

Auto Hide

Auto Archive

Auto Featured

Auto Countdown

Auto Status

---

Automation never edits Mission.

Mission Engine decides mission availability.

Campaign Engine only changes Campaign status.
