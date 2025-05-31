import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms and Conditions | Videogen.ai",
  description: "Read the Terms and Conditions for using the Videogen.ai platform.",
};

const TermsPage = () => {
  const lastUpdatedDate = "January 1, 2024"; // Placeholder: Update with actual date

  return (
    <div className="bg-gray-900 text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Disclaimer Section */}
        <div className="bg-yellow-500 text-black p-4 rounded-lg border-2 border-yellow-700 mb-10">
          <h2 className="text-xl font-bold mb-2">IMPORTANT DISCLAIMER</h2>
          <p className="text-sm">
            These Terms and Conditions are a sample and for informational purposes only.
            They are not legal advice. You should consult with a qualified legal professional
            to ensure these terms are appropriate and complete for your specific business
            and jurisdiction before publishing or relying on them.
          </p>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center text-teal-400">Terms and Conditions</h1>
        <p className="mb-6 text-gray-400 text-sm text-center">Last Updated: {lastUpdatedDate}</p>

        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">1. Introduction</h2>
          <p className="text-gray-300 leading-relaxed">
            Welcome to Videogen.ai (the "Service"), an AI video generation platform provided by [Your Company Name Here] ("Videogen.ai", "we", "us", or "our"). These Terms and Conditions ("Terms") govern your access to and use of our Service, including our website, software, and any related services.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">2. Description of Services</h2>
          <p className="text-gray-300 leading-relaxed">
            Videogen.ai provides an artificial intelligence-powered platform that allows users to generate videos from text prompts, customize templates, utilize AI voice cloning, and other related functionalities for creating video content (collectively, the "Services").
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">3. User Accounts</h2>
          <p className="text-gray-300 leading-relaxed">
            <strong>3.1 Eligibility:</strong> You must be at least 18 years old to create an account and use the Services. If you are between the ages of 13 and 18, you may use the Services only with the consent and supervision of a parent or legal guardian who agrees to be bound by these Terms.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            <strong>3.2 Account Creation:</strong> To access certain features of the Service, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            <strong>3.3 Account Security:</strong> You are responsible for safeguarding your account password and for any activities or actions under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">4. License to Use Videogen.ai Services</h2>
          <p className="text-gray-300 leading-relaxed">
            <strong>4.1 Grant of License:</strong> Subject to your full and ongoing compliance with these Terms, Videogen.ai grants you a limited, personal, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Service.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            <strong>4.2 Scope of Use:</strong> This license permits you to use the features and functionalities of Videogen.ai as intended and made available to you, which may vary depending on your chosen subscription plan (if applicable). This includes generating videos, utilizing templates, and accessing other tools provided as part of the Service.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            <strong>4.3 Restrictions on Use:</strong> In addition to the conditions outlined in the "Acceptable Use Policy" (Section 6), you agree not to:
            <ul className="list-disc list-inside ml-4 mt-2 text-gray-400">
              <li>Modify, adapt, translate, create derivative works of, decompile, reverse engineer, disassemble, or otherwise attempt to extract the source code or underlying algorithms of the Service, its software, or its AI models, except to the extent that such a restriction is expressly prohibited by applicable law.</li>
              <li>Remove, obscure, or alter any copyright notices, trademarks, or other proprietary rights notices affixed to or contained within the Service.</li>
              <li>Use the Service or any of its outputs to directly or indirectly develop, train, or improve a similar or competing product or service.</li>
              <li>Use any automated means, such as robots, spiders, or scrapers, to access the Service for any purpose without our express written permission, unless such means are provided as part of the Service's intended functionality (e.g., APIs).</li>
              <li>Attempt to gain unauthorized access to any portion of the Service, other users' accounts, or any systems or networks connected to the Service.</li>
            </ul>
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            <strong>4.4 Reservation of Rights:</strong> Videogen.ai and its licensors reserve all rights not expressly granted to you in these Terms. The Service and its underlying technology, software, AI models, designs, and all intellectual property rights therein are and will remain the exclusive property of Videogen.ai and its licensors.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            <strong>4.5 Updates and Modifications:</strong> We may update, modify, or discontinue parts of the Service from time to time. Your license to use the Service extends to any updates or modifications to the Service provided by us, unless accompanied by separate terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">5. User Content (Input and Output)</h2>
          <p className="text-gray-300 leading-relaxed">
            <strong>5.1 Responsibility for Input:</strong> You are solely responsible for all data, text, scripts, images, or other materials you upload, submit, or otherwise provide to the Service ("Input"). You represent and warrant that you have all necessary rights, licenses, and permissions to use and submit your Input.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            <strong>5.2 Ownership of Input:</strong> You retain all ownership rights to your Input.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            <strong>5.3 Ownership of Output:</strong> Videogen.ai acknowledges that, as between you and Videogen.ai, and to the fullest extent permitted by applicable law, you own the videos and other content generated by you through the Service using your Input ("Output"). Videogen.ai makes no claim of ownership over your Output. Your ability to use Output for commercial purposes may depend on your subscription plan.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            <strong>5.4 License from User to Videogen.ai:</strong> To enable us to provide and improve the Services, you grant Videogen.ai a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform your Input and Output solely for the purposes of:
            <ul className="list-disc list-inside ml-4 mt-2 text-gray-400">
              <li>Operating, maintaining, providing, and improving the Services.</li>
              <li>Developing new features and services.</li>
              <li>Training our artificial intelligence models to enhance the accuracy, quality, and functionality of the Services. This may include using Input and Output for model training in an anonymized or aggregated form where feasible.</li>
              <li>Preventing harm, security incidents, or complying with legal obligations.</li>
            </ul>
            This license continues even if you stop using our Services with respect to aggregated and de-identified data and any residual backup copies. You can manage your content and privacy settings within your account where applicable.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">6. Acceptable Use Policy</h2>
          <p className="text-gray-300 leading-relaxed">
            You agree not to use the Services to create, upload, transmit, or distribute any content or engage in any activity that:
            <ul className="list-disc list-inside ml-4 mt-2 text-gray-400">
              <li>Is unlawful, harmful, threatening, abusive, defamatory, obscene, or otherwise objectionable.</li>
              <li>Infringes upon any third party's intellectual property rights, privacy rights, or other proprietary rights.</li>
              <li>Contains viruses, malware, or other harmful code.</li>
              {/* The following were moved to/reinforced in Section 4.3 for more direct license context:
              <li>Attempts to reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code or underlying algorithms of the Services.</li>
              <li>Is used to develop a competing product or service.</li>
              */}
              <li>Violates any applicable local, state, national, or international law or regulation.</li>
            </ul>
            Additional restrictions on the use of the Service are detailed in Section 4.3. We reserve the right to investigate and take appropriate action, including removing content or suspending/terminating your account, if we believe you have violated these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">7. Videogen.ai's Intellectual Property Rights</h2>
          <p className="text-gray-300 leading-relaxed">
            Excluding your Input and Output, all rights, title, and interest in and to the Services, including the website, software, AI models, templates (excluding user-customized elements based on their Input), and documentation, are and will remain the exclusive property of Videogen.ai and its licensors. The Services are protected by copyright, trademark, and other laws of [Your Jurisdiction] and foreign countries. This is further clarified in Section 4.4 (Reservation of Rights).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">8. Fees, Payments, and Subscriptions</h2>
          <p className="text-gray-300 leading-relaxed">
            Details of our subscription plans, associated fees, payment terms, and renewal policies are available on our Pricing page (if applicable) or will be provided to you at the time of purchase. These details are incorporated herein by reference. We reserve the right to change our pricing and payment terms with reasonable notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">9. Term and Termination</h2>
          <p className="text-gray-300 leading-relaxed">
            <strong>9.1 Term:</strong> These Terms will remain in full force and effect while you use the Services.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            <strong>9.2 Termination by You:</strong> You may terminate your account and these Terms at any time by discontinuing use of the Services and deleting your account (if applicable).
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            <strong>9.3 Termination by Videogen.ai:</strong> We may suspend or terminate your access to the Services at any time, with or without cause, and with or without notice, for any reason, including, but not limited to, if we believe you have violated these Terms.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            <strong>9.4 Effect of Termination:</strong> Upon termination, your right to use the Services will immediately cease. Provisions that by their nature should survive termination (including ownership provisions, warranty disclaimers, indemnity, and limitations of liability) shall survive.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">10. Disclaimers of Warranties</h2>
          <p className="text-gray-300 leading-relaxed">
            THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE. VIDEOGEN.AI DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR THAT DEFECTS WILL BE CORRECTED. YOU ACKNOWLEDGE THAT OUTPUTS GENERATED BY AI MAY BE INACCURATE, INCOMPLETE, OR NOT UNIQUE, AND YOU USE THEM AT YOUR OWN RISK.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">11. Limitation of Liability</h2>
          <p className="text-gray-300 leading-relaxed">
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL VIDEOGEN.AI, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES) ARISING OUT OF OR RELATING TO YOUR ACCESS TO OR USE OF, OR YOUR INABILITY TO ACCESS OR USE, THE SERVICES OR ANY CONTENT OR MATERIALS THEREON, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STATUTE, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT VIDEOGEN.AI HAS BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            IN NO EVENT SHALL VIDEOGEN.AI'S AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS RELATING TO THE SERVICES EXCEED THE GREATER OF ONE HUNDRED U.S. DOLLARS (USD $100.00) OR THE AMOUNTS PAID BY YOU TO VIDEOGEN.AI FOR THE SERVICES IN THE TWELVE (12) MONTHS PRIOR TO THE CLAIM.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">12. Indemnification</h2>
          <p className="text-gray-300 leading-relaxed">
            You agree to defend, indemnify, and hold harmless Videogen.ai and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including, without limitation, reasonable legal and accounting fees, arising out of or in any way connected with your access to or use of the Services, your Input or Output, or your violation of these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">13. Dispute Resolution</h2>
          <p className="text-gray-300 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction - e.g., the State of California, USA], without regard to its conflict of law principles. Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in [Your City, Your State - e.g., San Francisco, California], and the parties hereby irrevocably consent to the personal jurisdiction and venue therein. We encourage you to contact us first if you have an issue, as many disputes can be resolved informally.
            {/* Placeholder: Consider adding an arbitration clause here based on legal advice. */}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">14. Changes to Terms</h2>
          <p className="text-gray-300 leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect (e.g., by posting on our website or sending an email). What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">15. DMCA / Copyright Policy</h2>
          <p className="text-gray-300 leading-relaxed">
            Videogen.ai respects the intellectual property rights of others and expects its users to do the same. It is our policy to respond to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act ("DMCA"). If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible via the Service, please notify our copyright agent as set forth in our Copyright Policy [Link to Copyright Policy page - create later if needed].
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">16. Contact Information</h2>
          <p className="text-gray-300 leading-relaxed">
            If you have any questions about these Terms, please contact us at: legal@videogen.ai (Placeholder: Replace with actual contact email or method).
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            [Your Company Name Here]<br />
            [Your Company Address - Placeholder]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">17. Miscellaneous</h2>
          <p className="text-gray-300 leading-relaxed">
            These Terms constitute the entire agreement between you and Videogen.ai regarding our Service and supersede and replace any prior agreements we might have had between us regarding the Service. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          </p>
        </section>

      </div>
    </div>
  );
};

export default TermsPage;
