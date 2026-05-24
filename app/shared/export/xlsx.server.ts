type SpreadsheetCellValue = boolean | Date | number | string | null | undefined;

interface SpreadsheetColumn<Row extends Record<string, SpreadsheetCellValue>> {
  key: keyof Row;
  label: string;
}

const textEncoder = new TextEncoder();
const EXCEL_EPOCH_OFFSET = 25569;
const DAY_IN_MILLISECONDS = 86_400_000;
const DATE_STYLE_ID = 2;
const HEADER_STYLE_ID = 1;

function sanitizeXmlValue(value: string) {
  let sanitized = "";

  for (const character of value) {
    const codePoint = character.codePointAt(0);

    if (
      codePoint === undefined ||
      codePoint === 0x09 ||
      codePoint === 0x0a ||
      codePoint === 0x0d ||
      codePoint >= 0x20
    ) {
      sanitized += character;
    }
  }

  return sanitized;
}

function escapeXml(value: string) {
  return sanitizeXmlValue(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildInlineStringCell(reference: string, value: string, styleId?: number) {
  const styleAttribute = styleId === undefined ? "" : ` s="${styleId}"`;

  return `<c r="${reference}" t="inlineStr"${styleAttribute}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function buildNumberCell(reference: string, value: number, styleId?: number) {
  const styleAttribute = styleId === undefined ? "" : ` s="${styleId}"`;

  return `<c r="${reference}"${styleAttribute}><v>${String(value)}</v></c>`;
}

function buildBooleanCell(reference: string, value: boolean) {
  return `<c r="${reference}" t="b"><v>${value ? "1" : "0"}</v></c>`;
}

function buildDateCell(reference: string, value: Date) {
  return buildNumberCell(
    reference,
    value.getTime() / DAY_IN_MILLISECONDS + EXCEL_EPOCH_OFFSET,
    DATE_STYLE_ID,
  );
}

function buildColumnReference(columnIndex: number) {
  let index = columnIndex;
  let reference = "";

  while (index >= 0) {
    reference = String.fromCharCode((index % 26) + 65) + reference;
    index = Math.floor(index / 26) - 1;
  }

  return reference;
}

function buildColumnDefinitions<Row extends Record<string, SpreadsheetCellValue>>(
  columns: readonly SpreadsheetColumn<Row>[],
  rows: readonly Row[],
) {
  const renderedColumns = columns.map((column, columnIndex) => {
    const maxLength = rows.reduce((currentMax, row) => {
      const value = row[column.key];
      const renderedValue =
        value instanceof Date
          ? value.toISOString()
          : typeof value === "boolean"
            ? value
              ? "true"
              : "false"
            : value === null || value === undefined
              ? ""
              : String(value);

      return Math.max(currentMax, renderedValue.length);
    }, column.label.length);
    const width = Math.min(Math.max(maxLength * 1.15, 12), 48);

    return `<col min="${columnIndex + 1}" max="${columnIndex + 1}" width="${width.toFixed(2)}" customWidth="1"/>`;
  });

  return `<cols>${renderedColumns.join("")}</cols>`;
}

function buildHeaderRow<Row extends Record<string, SpreadsheetCellValue>>(
  columns: readonly SpreadsheetColumn<Row>[],
) {
  const cells = columns
    .map((column, columnIndex) =>
      buildInlineStringCell(
        `${buildColumnReference(columnIndex)}1`,
        column.label,
        HEADER_STYLE_ID,
      ),
    )
    .join("");

  return `<row r="1" spans="1:${columns.length}">${cells}</row>`;
}

function buildDataRow<Row extends Record<string, SpreadsheetCellValue>>(
  columns: readonly SpreadsheetColumn<Row>[],
  row: Row,
  rowIndex: number,
) {
  const cells = columns
    .map((column, columnIndex) => {
      const value = row[column.key];

      if (value === null || value === undefined || value === "") {
        return "";
      }

      const reference = `${buildColumnReference(columnIndex)}${rowIndex}`;

      if (value instanceof Date) {
        return buildDateCell(reference, value);
      }

      if (typeof value === "number") {
        return buildNumberCell(reference, value);
      }

      if (typeof value === "boolean") {
        return buildBooleanCell(reference, value);
      }

      return buildInlineStringCell(reference, value);
    })
    .join("");

  return `<row r="${rowIndex}" spans="1:${columns.length}">${cells}</row>`;
}

function buildWorksheetXml<Row extends Record<string, SpreadsheetCellValue>>(args: {
  columns: readonly SpreadsheetColumn<Row>[];
  rows: readonly Row[];
}) {
  const lastColumnReference = buildColumnReference(args.columns.length - 1);
  const lastRowIndex = args.rows.length + 1;
  const rows = [
    buildHeaderRow(args.columns),
    ...args.rows.map((row, index) => buildDataRow(args.columns, row, index + 2)),
  ].join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${buildColumnDefinitions(args.columns, args.rows)}
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>${rows}</sheetData>
  <autoFilter ref="A1:${lastColumnReference}${lastRowIndex}"/>
</worksheet>`;
}

function buildWorkbookXml(sheetName: string) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook
  xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(sheetName.slice(0, 31))}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
}

function buildWorkbookRelationshipsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship
    Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"
    Target="worksheets/sheet1.xml"/>
  <Relationship
    Id="rId2"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"
    Target="styles.xml"/>
</Relationships>`;
}

function buildRootRelationshipsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship
    Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="xl/workbook.xml"/>
</Relationships>`;
}

function buildContentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
}

function buildStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="1">
    <numFmt numFmtId="164" formatCode="yyyy-mm-dd hh:mm:ss"/>
  </numFmts>
  <fonts count="2">
    <font>
      <sz val="11"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
    <font>
      <b/>
      <sz val="11"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
  </fonts>
  <fills count="2">
    <fill>
      <patternFill patternType="none"/>
    </fill>
    <fill>
      <patternFill patternType="solid">
        <fgColor rgb="FFE8EEF8"/>
        <bgColor indexed="64"/>
      </patternFill>
    </fill>
  </fills>
  <borders count="1">
    <border>
      <left/>
      <right/>
      <top/>
      <bottom/>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;
}

function concatUint8Arrays(parts: readonly Uint8Array[]) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const buffer = new Uint8Array(totalLength);
  let offset = 0;

  for (const part of parts) {
    buffer.set(part, offset);
    offset += part.length;
  }

  return buffer;
}

function uint16ToBytes(value: number) {
  const buffer = new Uint8Array(2);
  const view = new DataView(buffer.buffer);
  view.setUint16(0, value, true);
  return buffer;
}

function uint32ToBytes(value: number) {
  const buffer = new Uint8Array(4);
  const view = new DataView(buffer.buffer);
  view.setUint32(0, value >>> 0, true);
  return buffer;
}

function buildCrc32Table() {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let crc = index;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 1) === 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }

    table[index] = crc >>> 0;
  }

  return table;
}

const crc32Table = buildCrc32Table();

function calculateCrc32(data: Uint8Array) {
  let crc = 0xffffffff;

  for (const value of data) {
    crc = crc32Table[(crc ^ value) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createZipEntry(name: string, data: Uint8Array, offset: number) {
  const nameBytes = textEncoder.encode(name);
  const crc32 = calculateCrc32(data);
  const localHeader = concatUint8Arrays([
    uint32ToBytes(0x04034b50),
    uint16ToBytes(20),
    uint16ToBytes(0),
    uint16ToBytes(0),
    uint16ToBytes(0),
    uint16ToBytes(0),
    uint32ToBytes(crc32),
    uint32ToBytes(data.length),
    uint32ToBytes(data.length),
    uint16ToBytes(nameBytes.length),
    uint16ToBytes(0),
    nameBytes,
  ]);
  const centralDirectoryHeader = concatUint8Arrays([
    uint32ToBytes(0x02014b50),
    uint16ToBytes(20),
    uint16ToBytes(20),
    uint16ToBytes(0),
    uint16ToBytes(0),
    uint16ToBytes(0),
    uint16ToBytes(0),
    uint32ToBytes(crc32),
    uint32ToBytes(data.length),
    uint32ToBytes(data.length),
    uint16ToBytes(nameBytes.length),
    uint16ToBytes(0),
    uint16ToBytes(0),
    uint16ToBytes(0),
    uint16ToBytes(0),
    uint32ToBytes(0),
    uint32ToBytes(offset),
    nameBytes,
  ]);

  return {
    centralDirectoryHeader,
    localFile: concatUint8Arrays([localHeader, data]),
  };
}

function buildZipArchive(entries: readonly { data: Uint8Array; name: string }[]) {
  const localFiles: Uint8Array[] = [];
  const centralDirectoryHeaders: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const zipEntry = createZipEntry(entry.name, entry.data, offset);
    localFiles.push(zipEntry.localFile);
    centralDirectoryHeaders.push(zipEntry.centralDirectoryHeader);
    offset += zipEntry.localFile.length;
  }

  const centralDirectory = concatUint8Arrays(centralDirectoryHeaders);
  const endOfCentralDirectory = concatUint8Arrays([
    uint32ToBytes(0x06054b50),
    uint16ToBytes(0),
    uint16ToBytes(0),
    uint16ToBytes(entries.length),
    uint16ToBytes(entries.length),
    uint32ToBytes(centralDirectory.length),
    uint32ToBytes(offset),
    uint16ToBytes(0),
  ]);

  return concatUint8Arrays([...localFiles, centralDirectory, endOfCentralDirectory]);
}

export function buildExcelWorkbook<
  Row extends Record<string, SpreadsheetCellValue>,
>(args: {
  columns: readonly SpreadsheetColumn<Row>[];
  rows: readonly Row[];
  sheetName: string;
}) {
  return buildZipArchive([
    {
      data: textEncoder.encode(buildContentTypesXml()),
      name: "[Content_Types].xml",
    },
    {
      data: textEncoder.encode(buildRootRelationshipsXml()),
      name: "_rels/.rels",
    },
    {
      data: textEncoder.encode(buildWorkbookXml(args.sheetName)),
      name: "xl/workbook.xml",
    },
    {
      data: textEncoder.encode(buildWorkbookRelationshipsXml()),
      name: "xl/_rels/workbook.xml.rels",
    },
    {
      data: textEncoder.encode(buildStylesXml()),
      name: "xl/styles.xml",
    },
    {
      data: textEncoder.encode(
        buildWorksheetXml({
          columns: args.columns,
          rows: args.rows,
        }),
      ),
      name: "xl/worksheets/sheet1.xml",
    },
  ]);
}
