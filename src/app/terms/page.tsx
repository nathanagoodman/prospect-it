import Link from "next/link";

export default function TermsOfService() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 mb-10">Last updated: April 5, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">1. Acceptance of Terms</h2>
            <p>By accessing or using Prospect IT (&quot;the Service&quot;), operated by Prospect IT LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. Description of Service</h2>
            <p>Prospect IT is a software-as-a-service (SaaS) platform that provides bid estimation, profit margin calculation, job tracking, client relationship management, and email outreach tools for construction companies, general contractors, and trade professionals.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. Account Registration</h2>
            <p>You must provide accurate, complete, and current information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">4. Subscriptions and Billing</h2>
            <p>Paid features of the Service are billed on a recurring subscription basis. You authorize us to charge your payment method on a recurring basis. Subscription fees are non-refundable except as required by law. We reserve the right to change our pricing with 30 days&apos; notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">5. Cancellation</h2>
            <p>You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period. You will continue to have access to paid features until the end of your billing period.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">6. Acceptable Use</h2>
            <p>You agree not to: (a) use the Service for any illegal purpose; (b) upload malicious code; (c) attempt to gain unauthorized access to other accounts or systems; (d) scrape or harvest data from the Service; (e) interfere with the proper functioning of the Service; (f) use the Service to send unsolicited communications in violation of applicable laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">7. Data Ownership</h2>
            <p>You retain all ownership rights to the data you input into the Service, including bid information, client data, job details, and financial records. We do not claim ownership over your data. Upon account termination, you may request an export of your data within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">8. Intellectual Property</h2>
            <p>The Service, including its original content, features, and functionality, is owned by Prospect IT LLC and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or reverse-engineer any part of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">9. Disclaimer</h2>
            <p>The Service provides tools for estimation and calculation purposes only. Prospect IT does not provide financial, legal, or professional construction advice. Bid estimates, profit calculations, and other outputs are tools to assist your decision-making and should not be relied upon as the sole basis for business decisions. You are solely responsible for verifying the accuracy of all calculations and estimates.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Prospect IT LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from your use of or inability to use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">11. Indemnification</h2>
            <p>You agree to indemnify and hold harmless Prospect IT LLC, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">12. Modifications to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">13. Termination</h2>
            <p>We may suspend or terminate your account at our discretion if you violate these Terms. Upon termination, your right to use the Service ceases immediately. Provisions that by their nature should survive termination shall survive.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">14. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">15. Contact</h2>
            <p>If you have questions about these Terms, please contact us at <a href="mailto:nathan@prospectit.com" className="text-orange-500 hover:text-orange-600">nathan@prospectit.com</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
