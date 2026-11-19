import { ImportService } from './import.service';

// ESM only, which Jest does not transform here
jest.mock('@sindresorhus/slugify', () => ({ default: (text: string) => text }));

const service = new ImportService(
  {} as any,
  {} as any,
  {} as any,
  {} as any,
  {} as any,
);

function markdownTable(columns: number): string {
  const row = (cell: (i: number) => string) =>
    `| ${Array.from({ length: columns }, (_, i) => cell(i + 1)).join(' | ')} |`;
  return [
    row((i) => `Column ${i}`),
    row(() => '---'),
    row((i) => `Text ${i}`),
  ].join('\n');
}

function findTable(doc: any): any {
  if (doc?.type === 'table') return doc;
  for (const child of doc?.content ?? []) {
    const table = findTable(child);
    if (table) return table;
  }
  return null;
}

function rowWidths(doc: any, rowIndex: number): unknown[] {
  const row = findTable(doc).content[rowIndex];
  return row.content.map((cell: any) => cell.attrs.colwidth);
}

describe('ImportService table column widths', () => {
  it.each([1, 3, 4, 5])(
    'leaves a %i column markdown table without widths so it fills the editor',
    async (columns) => {
      const doc = await service.processMarkdown(markdownTable(columns));

      expect(rowWidths(doc, 0)).toEqual(new Array(columns).fill(null));
      expect(rowWidths(doc, 1)).toEqual(new Array(columns).fill(null));
    },
  );

  it.each([6, 9])(
    'gives a %i column markdown table the default widths so it scrolls',
    async (columns) => {
      const doc = await service.processMarkdown(markdownTable(columns));

      expect(rowWidths(doc, 0)).toEqual(new Array(columns).fill([150]));
    },
  );

  it('counts spanned columns when deciding whether a table fits', async () => {
    const doc = await service.processHTML(
      '<table><tr><td colspan="3">a</td><td>b</td><td>c</td><td>d</td></tr>' +
        '<tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr></table>',
    );

    expect(rowWidths(doc, 0)).toEqual([[150, 150, 150], [150], [150], [150]]);
  });

  it('keeps the widths an html table already has, however few columns', async () => {
    const doc = await service.processHTML(
      '<table><colgroup><col style="width: 120px"><col style="width: 240px"></colgroup>' +
        '<tr><td>a</td><td>b</td></tr></table>',
    );

    expect(rowWidths(doc, 0)).toEqual([[120], [240]]);
  });
});
