const fs = require("node:fs");
const path = require("node:path");
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} = require("docx");

const outputPath = path.resolve(__dirname, "../docs/reviews/PRACTICE_HUB_APPROVAL_FORM.docx");

const COLORS = {
  ink: "17141F",
  muted: "5F5A6B",
  gold: "C9A84C",
  goldLight: "F7F1DE",
  green: "006B3F",
  red: "CE1126",
  border: "D8D2C4",
  white: "FFFFFF",
};

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
};

function text(value, options = {}) {
  return new TextRun({ text: value, font: "Aptos", size: 20, color: COLORS.ink, ...options });
}

function paragraph(value, options = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    ...options,
    children: Array.isArray(value) ? value : [text(value)],
  });
}

function field(label, width = 9360) {
  return new Table({
    width: { size: width, type: WidthType.DXA },
    columnWidths: [width],
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: width, type: WidthType.DXA },
            margins: { top: 120, bottom: 280, left: 140, right: 140 },
            children: [paragraph([text(label, { bold: true, size: 18, color: COLORS.muted })], { spacing: { after: 80 } })],
          }),
        ],
      }),
    ],
  });
}

function checklistTable() {
  const rows = [
    ["Access boundary", "Normal and unverified users are denied; verified pharmacist can enter."],
    ["Clinical taxonomy", "Condition, issue, severity, and outcome labels match pharmacy practice."],
    ["Claims boundary", "Nothing implies PSGH, NHIA, Ghana FDA, or Pharmacy Council endorsement or submission."],
    ["Identifier controls", "Email, Ghana phone, and NHIS-labelled identifiers are rejected."],
    ["Offline workflow", "One synthetic record queues offline and creates exactly one record after reconnect."],
    ["Metrics", "Thirty-day counts and acceptance-rate definition are clinically understandable."],
    ["CSV export", "Export is pharmacist-scoped, contains expected fields, and contains no patient identifiers."],
    ["Residual risks", "Reviewer accepts or assigns actions for free text, IndexedDB, retention, and escalation risks."],
  ];

  const widths = [1900, 5360, 2100];
  const header = new TableRow({
    tableHeader: true,
    children: ["Control", "What to verify with synthetic data", "Result / note"].map((label, index) => new TableCell({
      width: { size: widths[index], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: COLORS.ink, color: "auto" },
      margins: { top: 110, bottom: 110, left: 110, right: 110 },
      children: [paragraph([text(label, { bold: true, color: COLORS.white, size: 18 })], { spacing: { after: 0 } })],
    })),
  });

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: widths,
    borders: tableBorders,
    rows: [header, ...rows.map((row, rowIndex) => new TableRow({
      children: row.map((value, index) => new TableCell({
        width: { size: widths[index], type: WidthType.DXA },
        shading: rowIndex % 2 ? { type: ShadingType.CLEAR, fill: "FBFAF7", color: "auto" } : undefined,
        margins: { top: 100, bottom: index === 2 ? 300 : 100, left: 110, right: 110 },
        children: [paragraph(index === 2 ? "Pass / Change required / N/A:" : value, { spacing: { after: 0 } })],
      })),
    }))],
  });
}

const document = new Document({
  creator: "PozosPharma",
  title: "Practice Hub Pharmacist Approval Form",
  description: "Clinical and governance sign-off record for controlled Practice Hub staging UAT.",
  styles: {
    default: {
      document: { run: { font: "Aptos", size: 20, color: COLORS.ink } },
      heading1: { run: { font: "Aptos Display", size: 30, bold: true, color: COLORS.ink }, paragraph: { spacing: { before: 240, after: 120 } } },
      heading2: { run: { font: "Aptos Display", size: 24, bold: true, color: COLORS.green }, paragraph: { spacing: { before: 200, after: 100 } } },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 900, right: 900, bottom: 850, left: 900 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [text("PozosPharma Practice Hub approval record  |  Page ", { size: 16, color: COLORS.muted }), new TextRun({ children: [PageNumber.CURRENT], font: "Aptos", size: 16, color: COLORS.muted })],
        })],
      }),
    },
    children: [
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 3120, 3120],
        borders: {
          top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
        },
        rows: [new TableRow({ children: [COLORS.red, COLORS.gold, COLORS.green].map((fill) => new TableCell({
          width: { size: 3120, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill, color: "auto" },
          margins: { top: 55, bottom: 55, left: 0, right: 0 },
          children: [paragraph("", { spacing: { after: 0 } })],
        })) })],
      }),
      paragraph([text("POZOS", { bold: true, size: 23, color: COLORS.ink }), text("PHARMA", { bold: true, size: 23, color: COLORS.gold })], { spacing: { before: 180, after: 60 } }),
      paragraph([text("Practice Hub Pharmacist Approval Form", { bold: true, size: 40, font: "Aptos Display" })], { spacing: { after: 80 } }),
      paragraph([text("Controlled staging user-acceptance testing and clinical governance decision", { size: 22, color: COLORS.muted })], { spacing: { after: 220 } }),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        borders: tableBorders,
        rows: [new TableRow({ children: [new TableCell({
          width: { size: 9360, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLORS.goldLight, color: "auto" },
          margins: { top: 150, bottom: 150, left: 170, right: 170 },
          children: [paragraph([text("Approval boundary: ", { bold: true }), text("This form approves or rejects a controlled staging pilot. It does not certify the product, endorse it on behalf of PSGH, or authorize production deployment.")], { spacing: { after: 0 } })],
        })] })],
      }),
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [text("1. Release under review", { bold: true, size: 30 })] }),
      field("Staging URL"),
      paragraph(""),
      field("Git commit / release identifier"),
      paragraph(""),
      field("Review date and time"),
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [text("2. Reviewer identity", { bold: true, size: 30 })] }),
      field("Full name"),
      paragraph(""),
      field("Pharmacy Council registration number"),
      paragraph(""),
      field("Organisation / practice and professional role"),
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [text("3. How to perform the review", { bold: true, size: 30 })] }),
      paragraph("Use only the synthetic reviewer account and synthetic clinical records supplied by the project owner."),
      paragraph("Complete every test below on the staging URL. Do not enter a real patient name, contact detail, address, NHIS number, prescription image, or clinical narrative."),
      paragraph("Record Pass, Change required, or N/A in the result column. A Change required result must identify the wording, rule, workflow, or control that should change."),
      paragraph("Review the residual-risk section in the accompanying review packet before selecting a decision."),
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [text("4. Staging UAT checklist", { bold: true, size: 30 })] }),
      checklistTable(),
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [text("5. Required clinical decisions", { bold: true, size: 30 })] }),
      field("Approved severity rubric, or changes required"),
      paragraph(""),
      field("Approved outcome list and acceptance-rate definition, or changes required"),
      paragraph(""),
      field("Approved wording for the professional-review flag, or changes required"),
      paragraph(""),
      field("Required retention, correction, deletion, and escalation policy"),
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [text("6. Decision", { bold: true, size: 30 })] }),
      paragraph([text("Select one: ", { bold: true }), text("[  ] Approve for staging pilot   [  ] Approve with conditions   [  ] Reject pending redesign")]),
      field("Conditions, required changes, or reason for rejection"),
      paragraph(""),
      field("Reviewer signature"),
      paragraph(""),
      field("Date"),
      paragraph([text("Project-owner acknowledgement: ", { bold: true }), text("I have recorded this decision against the release identifier above and will not treat conditional approval as production approval.")], { spacing: { before: 220, after: 140 } }),
      field("Project owner name, signature, and date"),
    ],
  }],
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
Packer.toBuffer(document).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  process.stdout.write(`${outputPath}\n`);
});
