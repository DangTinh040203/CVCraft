import { contactSignature } from '@/modules/resume/application/utils/contact-signature.util';

const info = (pairs: Array<[string, string]>) => ({
  information: pairs.map(([label, value]) => ({ label, value })),
});

describe('contactSignature', () => {
  it('signs with the contacts, in signature order, as the CV labels them', () => {
    const resume = info([
      ['Github', 'github.com/DangTinh040203'],
      ['Address', 'Ho Chi Minh, Viet Nam'],
      ['Email', 'tinhcaodang.work@gmail.com'],
      ['Portfolio', 'https://tinh.dev'],
      ['Phone', '+84 862040542'],
      ['LinkedIn', 'linkedin.com/in/tinh'],
    ]);

    expect(contactSignature(resume)).toEqual([
      'Phone: +84 862040542',
      'Email: tinhcaodang.work@gmail.com',
      'LinkedIn: linkedin.com/in/tinh',
      'Github: github.com/DangTinh040203',
      'Portfolio: https://tinh.dev',
    ]);
  });

  it('leaves out personal details that only look like contacts', () => {
    const resume = info([
      ['Date of Birth', '1999-01-01'],
      ['Ngày sinh', '01.01.1999'],
      ['Địa chỉ', 'Hà Nội'],
      ['Gender', 'Male'],
      ['Mobile', '0901 234 567'],
    ]);

    expect(contactSignature(resume)).toEqual(['Mobile: 0901 234 567']);
  });

  it('recognises unlabelled values and skips blanks and duplicates', () => {
    const resume = info([
      ['', 'jane@doe.com'],
      ['E-mail', 'JANE@doe.com'],
      ['Site', ''],
      ['Blog', 'janedoe.blog'],
    ]);

    expect(contactSignature(resume)).toEqual([
      'jane@doe.com',
      'Blog: janedoe.blog',
    ]);
  });

  it('skips what the draft already mentions', () => {
    const resume = info([
      ['Email', 'jane@doe.com'],
      ['Phone', '+1 555 123 4567'],
    ]);

    expect(contactSignature(resume, 'Reach me at jane@doe.com')).toEqual([
      'Phone: +1 555 123 4567',
    ]);
  });

  it('is empty without a contact section', () => {
    expect(contactSignature({})).toEqual([]);
  });
});
