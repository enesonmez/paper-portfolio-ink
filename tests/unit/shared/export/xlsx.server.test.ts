import { describe, expect, it } from "vitest";

import { buildExcelWorkbook } from "~/shared/export/xlsx.server";

function parseStoredZipEntries(bytes: Uint8Array) {
  const entries = new Map<string, string>();
  let offset = 0;

  while (
    offset + 4 <= bytes.length &&
    bytes[offset] === 0x50 &&
    bytes[offset + 1] === 0x4b &&
    bytes[offset + 2] === 0x03 &&
    bytes[offset + 3] === 0x04
  ) {
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset);
    const compressedSize = view.getUint32(18, true);
    const fileNameLength = view.getUint16(26, true);
    const extraFieldLength = view.getUint16(28, true);
    const fileNameStart = offset + 30;
    const fileNameEnd = fileNameStart + fileNameLength;
    const dataStart = fileNameEnd + extraFieldLength;
    const dataEnd = dataStart + compressedSize;
    const fileName = new TextDecoder().decode(bytes.slice(fileNameStart, fileNameEnd));
    const fileContents = new TextDecoder().decode(bytes.slice(dataStart, dataEnd));

    entries.set(fileName, fileContents);
    offset = dataEnd;
  }

  return entries;
}

describe("buildExcelWorkbook", () => {
  it("produces a valid xlsx archive with the expected worksheet contents", () => {
    const workbook = buildExcelWorkbook({
      columns: [
        { key: "createdAt", label: "Created At" },
        { key: "message", label: "Message" },
        { key: "metadataJson", label: "Metadata JSON" },
      ] as const,
      rows: [
        {
          createdAt: new Date("2026-03-31T12:46:00.000Z"),
          message: "First line\nSecond line",
          metadataJson: '{"status":"ok","nested":{"count":2}}',
        },
      ],
      sheetName: "Audit Logs",
    });
    const entries = parseStoredZipEntries(workbook);

    expect(workbook.slice(0, 2)).toEqual(new Uint8Array([0x50, 0x4b]));
    expect(entries.get("[Content_Types].xml")).toContain(
      "spreadsheetml.sheet.main+xml",
    );
    expect(entries.get("xl/workbook.xml")).toContain('sheet name="Audit Logs"');
    expect(entries.get("xl/worksheets/sheet1.xml")).toContain(
      "First line\nSecond line",
    );
    expect(entries.get("xl/worksheets/sheet1.xml")).toContain(
      "&quot;status&quot;:&quot;ok&quot;",
    );
    expect(entries.get("xl/worksheets/sheet1.xml")).toContain('s="2"><v>');
  });
});
