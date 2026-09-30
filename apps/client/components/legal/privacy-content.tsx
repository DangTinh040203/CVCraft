import type { LegalSection } from '@/components/legal/legal-page';

export const privacySections: LegalSection[] = [
  {
    heading: '1. Overview',
    body: (
      <p>
        This Privacy Policy explains what information CraftCV collects, how
        we use it, and the choices you have. By using CraftCV, you agree to
        the collection and use of information as described here.
      </p>
    ),
  },
  {
    heading: '2. Information We Collect',
    body: (
      <>
        <p>We collect the following types of information:</p>
        <ul>
          <li>
            <strong>Account information</strong> — name, email address, and
            authentication data handled by our sign-in provider.
          </li>
          <li>
            <strong>Resume content</strong> — work experience, education,
            skills, and other details you enter to build your CV.
          </li>
          <li>
            <strong>Usage data</strong> — pages visited, features used, and
            device/browser information, collected to improve the Service.
          </li>
          <li>
            <strong>Uploaded files</strong> — existing resumes or documents
            you upload for AI parsing or import.
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: '3. How We Use Your Information',
    body: (
      <ul>
        <li>To provide, operate, and maintain the CraftCV service.</li>
        <li>
          To generate AI-powered suggestions, summaries, and job-matching
          insights.
        </li>
        <li>To communicate with you about your account or the Service.</li>
        <li>To detect, prevent, and address technical issues or abuse.</li>
        <li>
          To improve our templates, features, and overall user experience.
        </li>
      </ul>
    ),
  },
  {
    heading: '4. AI Processing',
    body: (
      <p>
        Resume content you submit for AI features (such as content
        suggestions, parsing, or job-description matching) is sent to our AI
        provider strictly to generate that output. We do not permit our AI
        provider to use your content to train their general-purpose models
        outside of providing the Service to you.
      </p>
    ),
  },
  {
    heading: '5. Cookies & Similar Technologies',
    body: (
      <p>
        We use cookies and similar technologies to keep you signed in,
        remember your preferences, and understand how the Service is used.
        You can control cookies through your browser settings, though
        disabling them may affect some features.
      </p>
    ),
  },
  {
    heading: '6. Data Storage & Security',
    body: (
      <p>
        Your data is stored on secure, encrypted infrastructure. We apply
        industry-standard technical and organizational measures to protect
        your information against unauthorized access, alteration, or loss.
        No method of transmission or storage is 100% secure, and we cannot
        guarantee absolute security.
      </p>
    ),
  },
  {
    heading: '7. Sharing of Information',
    body: (
      <>
        <p>We do not sell your personal information. We share data only with:</p>
        <ul>
          <li>
            Service providers who help us operate CraftCV (authentication,
            hosting, database, and AI processing providers), bound by
            confidentiality obligations.
          </li>
          <li>Authorities, when required to comply with the law.</li>
          <li>
            A successor entity, in the event of a merger, acquisition, or
            asset sale, subject to this Privacy Policy.
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: '8. Data Retention',
    body: (
      <p>
        We retain your account and resume data for as long as your account
        is active. If you delete your account, we delete or anonymize your
        personal data within a reasonable period, except where retention is
        required by law.
      </p>
    ),
  },
  {
    heading: '9. Your Rights & Choices',
    body: (
      <>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access, correct, or export the personal data we hold about you.</li>
          <li>Request deletion of your account and associated data.</li>
          <li>Opt out of non-essential communications at any time.</li>
        </ul>
        <p>
          To exercise these rights, contact us at{' '}
          <a href='mailto:privacy@craftcv.local'>privacy@craftcv.local</a>.
        </p>
      </>
    ),
  },
  {
    heading: "10. Children's Privacy",
    body: (
      <p>
        CraftCV is not intended for children under 16, and we do not
        knowingly collect personal information from them. If you believe a
        child has provided us with personal data, please contact us so we
        can remove it.
      </p>
    ),
  },
  {
    heading: '11. International Data Transfers',
    body: (
      <p>
        Your information may be processed and stored in countries other than
        your own. We take steps to ensure appropriate safeguards are in
        place when your data is transferred internationally.
      </p>
    ),
  },
  {
    heading: '12. Changes to This Policy',
    body: (
      <p>
        We may update this Privacy Policy from time to time. Material
        changes will be communicated through the Service or by email before
        they take effect.
      </p>
    ),
  },
  {
    heading: '13. Contact Us',
    body: (
      <p>
        If you have questions about this Privacy Policy or how your data is
        handled, contact us at{' '}
        <a href='mailto:privacy@craftcv.local'>privacy@craftcv.local</a>.
      </p>
    ),
  },
];
