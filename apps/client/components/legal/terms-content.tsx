import type { LegalSection } from '@/components/legal/legal-page';

export const termsSections: LegalSection[] = [
  {
    heading: '1. Acceptance of Terms',
    body: (
      <p>
        By creating an account or using CraftCV (&quot;the Service&quot;,
        &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms
        of Service. If you do not agree, please do not use the Service.
      </p>
    ),
  },
  {
    heading: '2. Description of the Service',
    body: (
      <p>
        CraftCV is an AI-powered platform that helps you build, edit, and
        export professional resumes and CVs, including template selection,
        AI-generated content suggestions, job-description matching, and
        related career tools.
      </p>
    ),
  },
  {
    heading: '3. Accounts & Eligibility',
    body: (
      <>
        <p>
          You must provide accurate information when creating an account and
          are responsible for keeping your login credentials secure. You must
          be at least 16 years old to use CraftCV.
        </p>
        <p>
          You are responsible for all activity that occurs under your
          account.
        </p>
      </>
    ),
  },
  {
    heading: '4. Your Content',
    body: (
      <>
        <p>
          You retain ownership of the resume content, personal information,
          and other material you upload or create in CraftCV (&quot;Your
          Content&quot;). By using the Service, you grant us a limited
          license to store, process, and display Your Content solely to
          provide and improve the Service.
        </p>
        <p>
          You are solely responsible for the accuracy of Your Content,
          including any claims made in a resume generated with the help of
          our AI tools.
        </p>
      </>
    ),
  },
  {
    heading: '5. AI-Generated Content',
    body: (
      <p>
        CraftCV uses AI models to suggest wording, summaries, and content
        improvements. AI-generated suggestions may be inaccurate or require
        editing, and are provided &quot;as is&quot; without warranty. You are
        responsible for reviewing and verifying any AI-generated content
        before using it, such as in a job application.
      </p>
    ),
  },
  {
    heading: '6. Acceptable Use',
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose or to impersonate another person.</li>
          <li>Attempt to gain unauthorized access to the Service or other users&apos; accounts.</li>
          <li>Interfere with or disrupt the integrity or performance of the Service.</li>
          <li>Scrape, resell, or redistribute templates or Service content without authorization.</li>
        </ul>
      </>
    ),
  },
  {
    heading: '7. Free & Premium Plans',
    body: (
      <p>
        CraftCV offers free templates and features, as well as premium plans
        with additional templates and capabilities. Prices and plan features
        may change; any such changes will be communicated before they take
        effect for existing subscribers.
      </p>
    ),
  },
  {
    heading: '8. Intellectual Property',
    body: (
      <p>
        The Service, including its design, templates, branding, and
        underlying software, is owned by CraftCV and protected by
        intellectual property laws. Except for Your Content, nothing in
        these Terms grants you rights to our intellectual property beyond
        what is needed to use the Service as intended.
      </p>
    ),
  },
  {
    heading: '9. Termination',
    body: (
      <p>
        You may stop using the Service and delete your account at any time.
        We may suspend or terminate accounts that violate these Terms or
        pose a risk to the Service or other users.
      </p>
    ),
  },
  {
    heading: '10. Disclaimers & Limitation of Liability',
    body: (
      <p>
        The Service is provided &quot;as is&quot; without warranties of any
        kind. CraftCV does not guarantee job interviews, offers, or hiring
        outcomes. To the maximum extent permitted by law, CraftCV is not
        liable for indirect, incidental, or consequential damages arising
        from your use of the Service.
      </p>
    ),
  },
  {
    heading: '11. Changes to These Terms',
    body: (
      <p>
        We may update these Terms from time to time. Material changes will
        be notified through the Service or by email. Continued use of
        CraftCV after changes take effect constitutes acceptance of the
        updated Terms.
      </p>
    ),
  },
  {
    heading: '12. Contact Us',
    body: (
      <p>
        Questions about these Terms can be sent to{' '}
        <a href='mailto:support@craftcv.local'>support@craftcv.local</a>.
      </p>
    ),
  },
];
