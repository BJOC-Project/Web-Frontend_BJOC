export default function PrivacyPolicy() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 740, margin: "0 auto", padding: "48px 24px", color: "#102033", lineHeight: 1.7 }}>
      <p style={{ fontSize: 12, letterSpacing: "0.2em", color: "#0D5B33", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
        BJOC Mobile
      </p>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#5C7A69", fontSize: 14, marginBottom: 40 }}>
        Effective date: April 18, 2026 &nbsp;·&nbsp; Last updated: April 18, 2026
      </p>

      <Section title="1. Overview">
        BJOC Mobile ("the App") is operated by the Bicolano Jeepney Operators Corporation (BJOC).
        This Privacy Policy explains what information we collect, how we use it, and your rights
        regarding that information. By using the App, you agree to the practices described here.
      </Section>

      <Section title="2. Information We Collect">
        <strong>Account information</strong> — When you register, we collect your name, email
        address, and password (stored as a salted hash).
        <br /><br />
        <strong>Location data</strong> — For passengers, we request your approximate location to
        show nearby boarding points. For drivers, we collect precise GPS coordinates while a trip
        is active to enable real-time fleet tracking. Location access stops the moment the trip ends.
        <br /><br />
        <strong>Trip records</strong> — Route selections, boarding stops, trip history, and passenger
        counts associated with your account.
        <br /><br />
        <strong>Profile photo</strong> — If you upload a profile picture, it is stored on our servers
        and used only to display your avatar inside the App.
        <br /><br />
        <strong>Device information</strong> — We may collect anonymous device identifiers (Expo
        project ID) for push notification delivery and crash diagnostics.
      </Section>

      <Section title="3. How We Use Your Information">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>To provide real-time jeepney tracking and trip management features</li>
          <li>To match passengers with available routes and drivers</li>
          <li>To allow fleet operators to monitor their vehicles during active trips</li>
          <li>To send in-app notifications about trip status changes</li>
          <li>To improve app reliability and diagnose technical issues</li>
        </ul>
        We do <strong>not</strong> sell, rent, or share your personal data with third-party advertisers.
      </Section>

      <Section title="4. Data Sharing">
        We share data only as needed to operate the service:
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li><strong>Operators and dispatchers</strong> — can see driver locations and passenger counts for trips on their assigned routes</li>
          <li><strong>Infrastructure providers</strong> — Supabase (database hosting) and Vercel (API hosting) process data on our behalf under data processing agreements</li>
          <li><strong>Mapbox</strong> — anonymised route coordinates are sent to Mapbox to compute travel-time estimates; Mapbox does not receive user identity information</li>
        </ul>
      </Section>

      <Section title="5. Data Retention">
        Trip records are retained for 12 months to support reporting and dispute resolution.
        Account data is retained for the lifetime of your account. You may request deletion at
        any time by contacting us (see Section 8).
      </Section>

      <Section title="6. Security">
        We use HTTPS for all network communication, encrypted credential storage on-device
        (Expo SecureStore), and access-controlled databases. No system is perfectly secure;
        if you suspect unauthorized access to your account, contact us immediately.
      </Section>

      <Section title="7. Children's Privacy">
        The App is intended for users aged 13 and older. We do not knowingly collect personal
        information from children under 13. If you believe a child has created an account,
        please contact us and we will promptly delete the data.
      </Section>

      <Section title="8. Your Rights">
        You may at any time:
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and associated data</li>
          <li>Withdraw location permission via your device settings</li>
        </ul>
        To exercise these rights, email us at <a href="mailto:bjoc.app.support@gmail.com" style={{ color: "#0D5B33" }}>bjoc.app.support@gmail.com</a>.
      </Section>

      <Section title="9. Changes to This Policy">
        We may update this policy from time to time. When we do, we will revise the "Last updated"
        date at the top. Continued use of the App after changes are posted constitutes acceptance
        of the new policy.
      </Section>

      <Section title="10. Contact Us">
        Bicolano Jeepney Operators Corporation (BJOC)<br />
        Email: <a href="mailto:bjoc.app.support@gmail.com" style={{ color: "#0D5B33" }}>bjoc.app.support@gmail.com</a>
      </Section>

      <p style={{ marginTop: 48, fontSize: 12, color: "#5C7A69", borderTop: "1px solid #D9E4D8", paddingTop: 24 }}>
        © 2026 Bicolano Jeepney Operators Corporation. All rights reserved.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0D5B33", marginBottom: 8 }}>{title}</h2>
      <p style={{ margin: 0, fontSize: 15, color: "#102033" }}>{children}</p>
    </section>
  );
}
