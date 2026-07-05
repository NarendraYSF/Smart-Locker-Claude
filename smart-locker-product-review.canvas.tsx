import {
  BarChart,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
} from "cursor/canvas";

export default function SmartLockerProductReview() {
  return (
    <Stack gap={28} style={{ padding: 24, maxWidth: 1080 }}>
      <Stack gap={8}>
        <H1>Loker Pintar FST — Product &amp; UX Review</H1>
        <Text tone="secondary">
          Codebase audit of the kiosk prototype, structured with the skills in
          `skills/`: ux-researcher-designer, cs-ux-researcher,
          product-manager-toolkit (RICE), agile-product-owner (INVEST, sprint
          planning), and product-strategist (OKRs). Source: `smart-locker/`
          prototype · reviewed Jul 5, 2026.
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="9" label="Usability findings" />
        <Stat value="2" label="Critical (block pilot)" tone="danger" />
        <Stat value="4" label="Quick wins (≤1 wk)" tone="success" />
        <Stat value="3" label="Personas (unvalidated)" tone="warning" />
      </Grid>

      <Callout tone="warning" title="Evidence caveat">
        Everything below is derived from code review and heuristics, not user
        data. Per the persona-methodology checklist, these are proto-personas
        (confidence: low, 0 users interviewed). The research plan at the bottom
        is the cheapest way to upgrade this from assumption to evidence.
      </Callout>

      <Stack gap={12}>
        <H2>Proto-personas</H2>
        <Grid columns={3} gap={16}>
          <Card>
            <CardHeader trailing={<Pill size="sm">Primary</Pill>}>
              Dosen — "padat jadwal"
            </CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text size="small" tone="secondary" italic>
                  "Saya cuma punya 10 menit di antara kelas."
                </Text>
                <Text size="small">
                  Teaches most of the day; packages arrive while in class.
                  Wants tap-and-go pickup in under a minute, outside front-desk
                  hours.
                </Text>
                <Text size="small" tone="secondary">
                  Unmet need in app: no notification when mail arrives, no
                  fallback if card is forgotten.
                </Text>
              </Stack>
            </CardBody>
          </Card>
          <Card>
            <CardHeader trailing={<Pill size="sm">Primary</Pill>}>
              Tendik — operational staff
            </CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text size="small" tone="secondary" italic>
                  "Dokumen dinas tidak boleh hilang."
                </Text>
                <Text size="small">
                  Handles official documents; cares about trust and
                  traceability more than speed.
                </Text>
                <Text size="small" tone="secondary">
                  Unmet need in app: no audit trail of who deposited what,
                  when.
                </Text>
              </Stack>
            </CardBody>
          </Card>
          <Card>
            <CardHeader trailing={<Pill size="sm">First-time</Pill>}>
              Kurir — time-pressed guest
            </CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text size="small" tone="secondary" italic>
                  "Dua menit per alamat, lalu lanjut."
                </Text>
                <Text size="small">
                  Has never seen the kiosk; often knows only a (possibly
                  misspelled) recipient name. Needs proof of delivery for their
                  own courier app.
                </Text>
                <Text size="small" tone="secondary">
                  Unmet need in app: no deposit receipt/code, exact-substring
                  search only.
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </Grid>
        <Callout tone="info" title="Missing persona: Sekretariat admin">
          The system has no admin surface at all — no way to register staff,
          reassign lockers, force-open a jammed door, or see an audit log. This
          is the biggest strategic gap, not a screen-level fix.
        </Callout>
      </Stack>

      <Stack gap={12}>
        <H2>Journey map — courier delivery (highest-risk flow)</H2>
        <Text tone="secondary" size="small">
          Stages from the courier flow in `scripts/screens/courier.js`. Emotion
          is a 1–5 estimate pending real observation.
        </Text>
        <Table
          headers={["Stage", "User action", "Pain point", "Opportunity", "Emotion"]}
          rows={[
            [
              "Arrive",
              "Walks up mid-route, taps gold CTA",
              "None — entry is clear",
              "—",
              "4/5",
            ],
            [
              "Find recipient",
              "Types name / dept / NIP",
              "Exact substring match only; typo = zero results; list caps at 12 with no 'more results' hint",
              "Fuzzy match, show result count, keyboard suited to names",
              "3/5",
            ],
            [
              "Choose size",
              "Picks one of 4 size tiles",
              "Guessing between Kecil/Sedang from printed dimensions",
              "Physical size gauge next to kiosk; photos on tiles",
              "3/5",
            ],
            [
              "Deposit",
              "Locker opens, 30s countdown",
              "No door-closed confirmation; 'Batal' behaves like 'Selesai' (false success)",
              "Distinct cancel path; door-sensor state when hardware lands",
              "2/5",
            ],
            [
              "Leave",
              "Sees done screen, walks away",
              "No receipt or deposit code; recipient notification is promised in copy but does not exist",
              "Deposit code + notification — this is the product's core promise",
              "2/5",
            ],
          ]}
          columnAlign={["left", "left", "left", "left", "center"]}
        />
      </Stack>

      <Stack gap={12}>
        <H2>Usability audit — severity-rated findings</H2>
        <Text tone="secondary" size="small">
          Severity scale from the usability-testing framework: Critical
          prevents task completion or blocks deployment; Major causes
          significant difficulty; Minor causes hesitation.
        </Text>
        <Table
          headers={["#", "Finding", "Where", "Severity"]}
          rowTone={[
            "danger",
            "danger",
            "warning",
            "warning",
            "warning",
            "info",
            "info",
            "info",
            "neutral",
          ]}
          rows={[
            [
              "1",
              "Tap-card auto-signs-in a hardcoded user after 3.5s — anyone standing near the kiosk gets a session (prototype artifact; must be gated before any pilot)",
              "tap-card.js",
              "Critical",
            ],
            [
              "2",
              "Locker inventory leaks: state set to 'delivering' on the confirm screen is never reverted on cancel, timeout, or even success — free lockers vanish over a running day",
              "courier.js / data model",
              "Critical",
            ],
            [
              "3",
              "'Batal' on the opening-locker screen calls the same finish() as 'Selesai' — user who cancels still sees a success confirmation",
              "opening-locker.js",
              "Major",
            ],
            [
              "4",
              "Done screen promises 'Penerima akan dihubungi secara otomatis' but no notification exists — a broken core promise once real users rely on it",
              "done.js copy",
              "Major",
            ],
            [
              "5",
              "No failure states anywhere: unreadable card, no free locker mid-flow, door jam, door left open — every path assumes success",
              "all screens",
              "Major",
            ],
            [
              "6",
              "60s inactivity reset has no warning — a slow reader loses the session mid-task with no 'Masih di sana?' prompt",
              "app.js",
              "Minor",
            ],
            [
              "7",
              "Recipient search caps at 12 results silently; fine for 10 mock staff, misleading for a real directory of hundreds",
              "courier.js",
              "Minor",
            ],
            [
              "8",
              "No fallback authentication (PIN / one-time code) when a staff card is lost or forgotten",
              "flow gap",
              "Minor",
            ],
            [
              "9",
              "No help or 'report a problem' affordance for stuck users — kiosk best practice is an always-visible escape hatch",
              "layout",
              "Minor",
            ],
          ]}
          columnAlign={["center", "left", "left", "left"]}
        />
      </Stack>

      <Stack gap={12}>
        <H2>RICE-prioritized backlog</H2>
        <Text tone="secondary" size="small">
          Score = (Reach × Impact × Confidence) / Effort. Reach = estimated
          events per semester (≈250 staff, ≈20 deliveries/day → ≈1,200
          deliveries and ≈3,000 kiosk sessions). Impact on the 0.25–3 RICE
          scale; effort in person-weeks. All inputs are assumptions to validate
          with the Sekretariat.
        </Text>
        <BarChart
          categories={[
            "Fix cancel + inventory bugs",
            "Timeout warning",
            "RFID + backend auth",
            "Recipient notification",
            "Search UX (fuzzy + count)",
            "Deposit receipt code",
            "Help / report problem",
            "Admin console",
            "PIN fallback auth",
          ]}
          series={[
            {
              name: "RICE score",
              data: [3000, 1200, 787, 720, 480, 420, 210, 140, 60],
            },
          ]}
          horizontal
          height={320}
          showValues
        />
        <Text tone="secondary" size="small">
          Source: RICE inputs estimated from the audit above · semester
          horizon.
        </Text>
        <Callout tone="info" title="Portfolio balance check">
          RICE mechanically favors quick wins. Per the toolkit's guidance, pair
          them with the strategic bets: RFID + backend auth and the recipient
          notification are what turn this from a UI demo into a product — they
          should anchor the roadmap even though bug fixes outscore them.
        </Callout>
      </Stack>

      <Stack gap={12}>
        <H2>Sprint 1 proposal</H2>
        <Text tone="secondary" size="small">
          Assumes 2 developers, first sprint, provisional velocity 20 pts →
          commit ≤85% (17 pts) per the sprint-planning guide. Everything here
          is achievable in the prototype without hardware.
        </Text>
        <Table
          headers={["Story", "Persona", "Points", "Slot"]}
          rows={[
            ["Fix 'Batal' → real cancel path on opening screen", "All", "2", "Committed"],
            ["Fix locker inventory lifecycle (release on cancel/timeout, occupy on success)", "All", "3", "Committed"],
            ["Timeout warning dialog 10s before idle reset", "Dosen / Tendik", "2", "Committed"],
            ["Fuzzy recipient search + result count", "Kurir", "3", "Committed"],
            ["Deposit receipt code on courier done screen", "Kurir", "5", "Committed"],
            ["'Laporkan masalah' help affordance on every screen", "All", "2", "Committed"],
            ["Spike: notification channel options (WA / SMS / email)", "Dosen", "3", "Stretch"],
          ]}
          columnAlign={["left", "left", "center", "left"]}
        />
      </Stack>

      <Stack gap={12}>
        <H2>Sample stories with acceptance criteria</H2>
        <Card collapsible defaultOpen>
          <CardHeader trailing={<Pill size="sm">5 pts</Pill>}>
            US-01 · Deposit receipt code
          </CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text size="small" italic>
                As a courier, I want a short deposit code on the confirmation
                screen, so that I have proof of delivery for my own app and
                disputes can be resolved.
              </Text>
              <Divider />
              <Text size="small">
                1. Given a completed deposit, when the done screen shows, then
                a 6-character code and locker number are displayed for 60s.
              </Text>
              <Text size="small">
                2. Given the code is shown, when the session ends, then the
                code is stored with locker ID, recipient NIP, and timestamp.
              </Text>
              <Text size="small">
                3. Given a cancelled deposit, when the flow is aborted, then no
                code is generated and the locker returns to available.
              </Text>
              <Text size="small">
                4. Should render the code at a size readable from 1 m (kiosk
                context).
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card collapsible defaultOpen={false}>
          <CardHeader trailing={<Pill size="sm">2 pts</Pill>}>
            US-02 · Real cancel on opening-locker screen
          </CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text size="small" italic>
                As a kiosk user, I expect "Batal" to abort the operation, so
                that I am not shown a false success confirmation.
              </Text>
              <Divider />
              <Text size="small">
                1. Given the opening-locker screen, when I tap Batal, then I
                return to the previous screen and no success state is shown.
              </Text>
              <Text size="small">
                2. Given a courier cancel, when the flow aborts, then the
                assigned locker is released back to available.
              </Text>
              <Text size="small">
                3. Given the countdown reaches zero, when no cancel occurred,
                then the existing done screen still shows.
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card collapsible defaultOpen={false}>
          <CardHeader trailing={<Pill size="sm">2 pts</Pill>}>
            US-03 · Idle timeout warning
          </CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text size="small" italic>
                As a staff member reading my mail list, I want a warning before
                the kiosk resets, so that I don't lose my session mid-task.
              </Text>
              <Divider />
              <Text size="small">
                1. Given 50s of inactivity on a non-idle screen, when the
                threshold passes, then a "Masih di sana?" dialog appears with a
                10s countdown.
              </Text>
              <Text size="small">
                2. Given the dialog, when I tap anywhere, then the session
                continues and the timer resets.
              </Text>
              <Text size="small">
                3. Given no response, when the countdown ends, then the kiosk
                returns to idle and clears state (current behavior).
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Stack>

      <Stack gap={12}>
        <H2>Success metrics — pilot OKR</H2>
        <Text tone="secondary" size="small">
          One objective, semester horizon, per the product-strategist cascade
          (3–5 measurable KRs, baseline → target).
        </Text>
        <Table
          headers={["Key result", "Baseline", "Target"]}
          rows={[
            ["Incoming staff packages routed through the locker", "0%", "60%"],
            ["Median kiosk session duration", "unknown", "< 45 s"],
            ["Packages picked up within 24h of deposit", "n/a", "> 90%"],
            ["Usability task success (moderated test)", "unmeasured", "> 80%"],
            ["Locker faults unresolved after 1 business day", "n/a", "0"],
          ]}
        />
        <H3>Objective</H3>
        <Text>
          Make the smart locker the default, trusted channel for staff
          deliveries at FST — replacing ad-hoc front-desk handling.
        </Text>
      </Stack>

      <Stack gap={12}>
        <H2>Next research step (1 week, near-zero cost)</H2>
        <Text>
          Guerrilla usability test in the FST lobby before writing more code:
          5–8 participants (2 dosen, 2 tendik, 2–3 real couriers), 3 tasks —
          open your locker, claim a package, deliver a package to a name given
          verbally. Success criteria per the framework: completion &gt; 80%,
          time-on-task &lt; 2× expected, satisfaction &gt; 4/5. Pair it with
          8–10 short intercept interviews to validate the proto-personas and
          the RICE reach numbers.
        </Text>
      </Stack>
    </Stack>
  );
}
