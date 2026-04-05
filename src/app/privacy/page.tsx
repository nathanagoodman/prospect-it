import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold text-slate-900">
            Prospect <span className="text-orange-500">IT</span>
          </span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-10">Last updated: April 5, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">1. Introduction</h2>
            <p>Prospect IT LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the Prospect IT platform. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. Information We Collect</h2>
            <p>We collect information you provide directly: name, email address, company name, phone number, trade type, and payment information. We also collect usage data including IP addresses, browser type, pages visited, and feature usage patterns.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. How We Use Your Information</h2>
            <p>We use your information to: provide and maintain the Service; process transactions; send service-related communications; improve our Service; provide customer support; detect and prevent fraud; and comply with legal obligations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">4. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with: service providers who assist in operating our platform (hosting, payment processing, email delivery); law enforcement when required by law; and in connection with a merger, acquisition, or asset sale.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">5. Data Security</h2>
            <p>We implement industry-standard security measures including encryption in transit (TLS) and at rest, secure password hashing, and regular security assessments. However, no method of electronic transmission or storage is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">6. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide services. After account deletion, we retain data for up to 30 days for backup purposes, after which it is permanently deleted.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">7. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We may also use analytics cookies to understand how users interact with our Service. You can control cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">8. Your Rights</h2>
            <p>You have the right to: access your personal data; correct inaccurate data; request deletion of your data; export your data; and opt out of marketing communications. To exercise these rights, contact us at the email below.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">9. CCPA Compliance</h2>
            <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected and the right to request deletion. We do not sell personal information as defined by the CCPA.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">10. International Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for any international data transfers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">11. Children&apos;s Privacy</h2>
            <p>The Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we discover that we have collected data from a child, we will delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">12. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the Service. Your continued use after changes take effect constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">13. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our data practices, please contact us at <a href="mailto:nathan@prospectit.com" className="text-orange-500 hover:text-orange-600">nathan@prospectit.com</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
