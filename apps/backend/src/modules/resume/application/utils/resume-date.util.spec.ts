import { toResumeIsoDate } from '@/modules/resume/application/utils/resume-date.util';

describe('toResumeIsoDate', () => {
  it.each([
    ['2021-03', '2021-03-01T12:00:00.000Z'],
    ['2021/3', '2021-03-01T12:00:00.000Z'],
    ['2021-03-15', '2021-03-01T12:00:00.000Z'],
    ['2021-03-15T00:00:00.000Z', '2021-03-01T12:00:00.000Z'],
    ['04/2026', '2026-04-01T12:00:00.000Z'],
    ['4-2026', '2026-04-01T12:00:00.000Z'],
    ['15/03/2021', '2021-03-01T12:00:00.000Z'],
    ['03/15/2021', '2021-03-01T12:00:00.000Z'],
    ['Mar 2021', '2021-03-01T12:00:00.000Z'],
    ['September, 2021', '2021-09-01T12:00:00.000Z'],
    ['Sept. 2021', '2021-09-01T12:00:00.000Z'],
    ['Tháng 3/2021', '2021-03-01T12:00:00.000Z'],
    ['2021', '2021-01-01T12:00:00.000Z'],
    [' 2018 ', '2018-01-01T12:00:00.000Z'],
  ])('reads %p', (input, expected) => {
    expect(toResumeIsoDate(input)).toBe(expected);
  });

  it.each([
    'Present',
    'Current',
    'now',
    'Hiện tại',
    '',
    'sometime',
    '13/2021',
    'Foo 2021',
    null,
    undefined,
    2021,
  ])('returns null for %p', (input) => {
    expect(toResumeIsoDate(input)).toBeNull();
  });
});
