import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy | Videogen.ai",
  description: "Learn about how Videogen.ai collects, uses, and protects your personal information. This is a placeholder document.",
};

const PrivacyPolicyPage = () => {
  const lastUpdatedDate = "January 1, 2024"; // Placeholder: Update with actual date

  return (
    <div className="bg-gray-900 text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Disclaimer Section */}
        <div className="bg-yellow-500 text-black p-4 rounded-lg border-2 border-yellow-700 mb-10">
          <h2 className="text-xl font-bold mb-2">IMPORTANT DISCLAIMER</h2>
          <p className="text-sm">
            This Privacy Policy is a sample/placeholder and for informational purposes only.
            It is not legal advice. You should consult with a qualified legal professional
            to ensure this policy is appropriate and complete for your specific business and data handling practices,
            and compliant with all applicable laws and regulations (like GDPR, CCPA, etc.),
            before publishing or relying on it.
          </p>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center text-teal-400">Privacy Policy</h1>
        <p className="mb-6 text-gray-400 text-sm text-center">Last Updated: {lastUpdatedDate}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">1. Introduction</h2>
          <p className="text-gray-300 leading-relaxed">
            Welcome to Videogen.ai ("Videogen.ai", "we", "us", or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            [This section will further detail the scope of the policy and consent.]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">2. Information We Collect</h2>
          <p className="text-gray-300 leading-relaxed">
            We may collect personal information that you voluntarily provide to us when you register an account, use the Services, or contact us.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            [This section will detail types of information collected, e.g., personal identification information (name, email), payment information (processed by third parties), user content (Input and Output for service provision), usage data, cookies, etc.]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">3. How We Use Your Information</h2>
          <p className="text-gray-300 leading-relaxed">
            We use the information we collect or receive to:
            <ul className="list-disc list-inside ml-4 mt-2 text-gray-400">
              <li>Create and manage your account.</li>
              <li>Provide, operate, and maintain our Services.</li>
              <li>Improve, personalize, and expand our Services.</li>
              <li>Understand and analyze how you use our Services.</li>
              <li>Develop new products, services, features, and functionality.</li>
              <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Service, and for marketing and promotional purposes (with your consent where required).</li>
              <li>Process your transactions.</li>
              <li>Find and prevent fraud.</li>
              <li>For compliance purposes, including enforcing our Terms and Conditions or other legal rights.</li>
            </ul>
            [This section will provide more specific details on each use case.]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">4. Data Sharing and Disclosure</h2>
          <p className="text-gray-300 leading-relaxed">
            We may share your information in certain situations.
            [This section will detail circumstances of data sharing, e.g., with service providers, for legal obligations, business transfers, with your consent. It will also clarify that we do not sell personal information, if applicable.]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">5. Data Security</h2>
          <p className="text-gray-300 leading-relaxed">
            We implement a variety of security measures to maintain the safety of your personal information. However, no electronic storage or transmission over the Internet is 100% secure.
            [This section will describe security measures taken and acknowledge limitations.]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">6. Data Retention</h2>
          <p className="text-gray-300 leading-relaxed">
            We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy, and to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
            [This section will detail retention periods or criteria.]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">7. Your Data Protection Rights</h2>
          <p className="text-gray-300 leading-relaxed">
            Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, update, or delete your information.
            [This section will outline user rights, e.g., under GDPR, CCPA if applicable, and how to exercise them.]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">8. Children's Privacy</h2>
          <p className="text-gray-300 leading-relaxed">
            Our Service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13.
            [This section will detail policies regarding children's data.]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">9. International Data Transfers</h2>
          <p className="text-gray-300 leading-relaxed">
            Your information, including personal data, may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ.
            [This section will explain how international transfers are handled.]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">10. Changes to This Privacy Policy</h2>
          <p className="text-gray-300 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-300">11. Contact Us</h2>
          <p className="text-gray-300 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            By email: privacy@videogen.ai (Placeholder: Replace with actual contact email)
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            By mail: [Your Company Name Here], [Your Company Address - Placeholder]
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
