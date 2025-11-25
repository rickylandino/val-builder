# VAL PDF Generation Specification

## Overview
Generate PDF documents from VAL (Valuation Actuary Letter) data using PuppeteerSharp for HTML-to-PDF conversion.

## Technology Stack
- **PuppeteerSharp** (recommended) - Headless Chrome automation
  - NuGet: `PuppeteerSharp`
  - No server dependencies (downloads Chromium automatically)
  - Excellent HTML/CSS rendering fidelity
  - Modern, actively maintained

### Alternative Options
- **QuestPDF** - Fluent API, code-based layout (more control, steeper learning curve)
- **SelectPdf** - HTML to PDF converter (commercial license required for production)

## API Endpoint Specification

### Endpoint
```
GET /api/vals/{valId}/pdf
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `includeHeaders` | boolean | No | false | Include section headers in output |
| `mode` | string | No | "final" | Output mode: "final" or "sections" |

### Response
- **Content-Type**: `application/pdf`
- **File Name**: `VAL-{valId}-{timestamp}.pdf`
- **Status Codes**:
  - 200: Success
  - 404: VAL not found
  - 500: PDF generation failed

## Data Requirements

### API Should Fetch
1. **ValHeader** (valId)
   - valDescription
   - planYearBeginDate
   - planYearEndDate
   - client name (from related table)

2. **ValSections** (filter by valId)
   - groupId
   - sectionText
   - displayOrder

3. **ValDetails** (filter by valId)
   - valDetailsId
   - groupId (to associate with section)
   - detailText
   - displayOrder
   - **Formatting Properties**:
     - bullet (boolean)
     - indent (int, 0-4)
     - bold (boolean)
     - center (boolean)
     - tightLineHeight (boolean)
     - blankLineAfter (int, 0-3)

### Data Structure Example
```json
{
  "valHeader": {
    "valId": 123,
    "valDescription": "2024 Annual Valuation",
    "planYearBeginDate": "2024-01-01",
    "planYearEndDate": "2024-12-31",
    "clientName": "ABC Corporation"
  },
  "sections": [
    {
      "groupId": 1,
      "sectionText": "Executive Summary",
      "displayOrder": 1,
      "details": [
        {
          "valDetailsId": "det-001",
          "detailText": "This valuation was performed as of December 31, 2024.",
          "displayOrder": 1,
          "bullet": false,
          "indent": 0,
          "bold": false,
          "center": false,
          "tightLineHeight": false,
          "blankLineAfter": 1
        },
        {
          "valDetailsId": "det-002",
          "detailText": "Key findings from the analysis",
          "displayOrder": 2,
          "bullet": true,
          "indent": 1,
          "bold": true,
          "center": false,
          "tightLineHeight": false,
          "blankLineAfter": 0
        }
      ]
    }
  ]
}
```

## HTML Template Specification

### Page Layout
- **Page Size**: 8.5" × 11" (US Letter)
- **Margins**: 1 inch on all sides
- **Effective Content Area**: 6.5" × 9"

### Header Section
```html
<div class="val-header">
  <div class="client-name">{clientName}</div>
  <div class="val-title">{valDescription}</div>
  <div class="plan-year">Plan Year: {planYearBeginDate} - {planYearEndDate}</div>
</div>
```

### Watermark (Optional)
```html
<div class="watermark">VAL DRAFT</div>
```

### Content Sections
**Mode: "sections" (includeHeaders = true)**
```html
<div class="section">
  <h2 class="section-header">{sectionText}</h2>
  <div class="section-content">
    <!-- ValDetails here -->
  </div>
</div>
```

**Mode: "final" (includeHeaders = false)**
```html
<div class="document-content">
  <!-- All ValDetails without section headers -->
</div>
```

### ValDetail Rendering

Each ValDetail should be rendered as a `<p>` element with appropriate classes:

```html
<p class="{classes}" style="{inline-styles}">
  {bullet ? '• ' : ''}{detailText}
</p>
```

#### CSS Classes Based on Properties

| Property | Value | CSS Class | Styling |
|----------|-------|-----------|---------|
| bullet | true | `bullet` | • prefix, padding-left: 20px |
| indent | 1 | `indent-1` | margin-left: 1.2rem |
| indent | 2 | `indent-2` | margin-left: 2.4rem |
| indent | 3 | `indent-3` | margin-left: 3.6rem |
| indent | 4 | `indent-4` | margin-left: 4.8rem |
| bold | true | `font-bold` | font-weight: 700 |
| center | true | `text-center` | text-align: center |
| tightLineHeight | true | `tight` | line-height: 1.2 |
| blankLineAfter | 1 | `blank-1` | margin-bottom: 1em |
| blankLineAfter | 2 | `blank-2` | margin-bottom: 2em |
| blankLineAfter | 3 | `blank-3` | margin-bottom: 3em |

#### Indent + Bullet Calculation
When both bullet and indent are present:
```
total-margin-left = (indent * 1.2rem) + 20px
```

Example:
- indent=2, bullet=true → margin-left: calc(2.4rem + 20px)

## Complete CSS Stylesheet

```css
@page {
  size: 8.5in 11in;
  margin: 1in;
}

body {
  font-family: 'Times New Roman', Times, serif;
  font-size: 12pt;
  line-height: 1.6;
  color: #000;
  margin: 0;
  padding: 0;
}

.document-container {
  width: 8.5in;
  min-height: 11in;
  background: white;
  position: relative;
}

/* Watermark */
.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 120pt;
  font-weight: bold;
  color: rgba(200, 200, 200, 0.2);
  z-index: -1;
  pointer-events: none;
  white-space: nowrap;
}

/* Header */
.val-header {
  text-align: center;
  margin-bottom: 2em;
  padding-bottom: 1em;
  border-bottom: 2px solid #333;
}

.client-name {
  font-size: 16pt;
  font-weight: bold;
  margin-bottom: 0.5em;
}

.val-title {
  font-size: 14pt;
  font-weight: bold;
  margin-bottom: 0.5em;
}

.plan-year {
  font-size: 11pt;
  color: #555;
}

/* Sections */
.section {
  margin-bottom: 2em;
  page-break-inside: avoid;
}

.section-header {
  font-size: 14pt;
  font-weight: bold;
  margin-bottom: 1em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #999;
}

/* ValDetail Paragraphs */
.val-detail {
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

.val-detail.tight {
  line-height: 1.2;
}

.val-detail.font-bold {
  font-weight: 700;
}

.val-detail.text-center {
  text-align: center;
}

.val-detail.bullet {
  padding-left: 20px;
  text-indent: -20px;
}

.val-detail.indent-1 {
  margin-left: 1.2rem;
}

.val-detail.indent-2 {
  margin-left: 2.4rem;
}

.val-detail.indent-3 {
  margin-left: 3.6rem;
}

.val-detail.indent-4 {
  margin-left: 4.8rem;
}

/* Combine bullet + indent */
.val-detail.bullet.indent-1 {
  margin-left: calc(1.2rem + 20px);
  padding-left: 20px;
  text-indent: -20px;
}

.val-detail.bullet.indent-2 {
  margin-left: calc(2.4rem + 20px);
  padding-left: 20px;
  text-indent: -20px;
}

.val-detail.bullet.indent-3 {
  margin-left: calc(3.6rem + 20px);
  padding-left: 20px;
  text-indent: -20px;
}

.val-detail.bullet.indent-4 {
  margin-left: calc(4.8rem + 20px);
  padding-left: 20px;
  text-indent: -20px;
}

/* Blank lines after */
.val-detail.blank-1 {
  margin-bottom: 1em;
}

.val-detail.blank-2 {
  margin-bottom: 2em;
}

.val-detail.blank-3 {
  margin-bottom: 3em;
}

/* Print optimization */
@media print {
  .document-container {
    width: 100%;
    margin: 0;
    box-shadow: none;
  }
}
```

## HTML Template Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VAL Document - {valId}</title>
  <style>
    /* Include CSS from above */
  </style>
</head>
<body>
  <div class="document-container">
    <!-- Optional Watermark -->
    <div class="watermark">VAL DRAFT</div>
    
    <!-- Header -->
    <div class="val-header">
      <div class="client-name">ABC Corporation</div>
      <div class="val-title">2024 Annual Valuation</div>
      <div class="plan-year">Plan Year: January 1, 2024 - December 31, 2024</div>
    </div>
    
    <!-- Content -->
    <div class="document-content">
      <!-- Section 1 (if includeHeaders = true) -->
      <div class="section">
        <h2 class="section-header">Executive Summary</h2>
        <div class="section-content">
          <p class="val-detail">This valuation was performed as of December 31, 2024.</p>
          <p class="val-detail bullet indent-1 font-bold">Key findings from the analysis</p>
          <p class="val-detail bullet indent-2">Finding detail one</p>
          <p class="val-detail bullet indent-2">Finding detail two</p>
        </div>
      </div>
      
      <!-- More sections... -->
    </div>
  </div>
</body>
</html>
```

## C# Implementation Example (PuppeteerSharp)

### NuGet Packages
```xml
<PackageReference Include="PuppeteerSharp" Version="13.0.0" />
```

### Controller Method
```csharp
using PuppeteerSharp;
using PuppeteerSharp.Media;

[HttpGet("{valId}/pdf")]
public async Task<IActionResult> GenerateValPdf(int valId, bool includeHeaders = false)
{
    try
    {
        // 1. Fetch data from database
        var valData = await _valService.GetValDataForPdf(valId);
        if (valData == null)
            return NotFound($"VAL {valId} not found");

        // 2. Generate HTML
        var html = GenerateHtmlContent(valData, includeHeaders);

        // 3. Convert to PDF using PuppeteerSharp
        await new BrowserFetcher().DownloadAsync(); // First time only
        
        await using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
        {
            Headless = true,
            Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
        });
        
        await using var page = await browser.NewPageAsync();
        await page.SetContentAsync(html);
        
        var pdfData = await page.PdfDataAsync(new PdfOptions
        {
            Format = PaperFormat.Letter,
            PrintBackground = true,
            MarginOptions = new MarginOptions
            {
                Top = "1in",
                Right = "1in",
                Bottom = "1in",
                Left = "1in"
            }
        });

        // 4. Return PDF
        var fileName = $"VAL-{valId}-{DateTime.Now:yyyyMMdd-HHmmss}.pdf";
        return File(pdfData, "application/pdf", fileName);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error generating PDF for VAL {ValId}", valId);
        return StatusCode(500, "Error generating PDF");
    }
}

private string GenerateHtmlContent(ValPdfData data, bool includeHeaders)
{
    var sb = new StringBuilder();
    
    // Build HTML from template
    sb.Append("<!DOCTYPE html><html><head><style>");
    sb.Append(GetCssStyles()); // CSS from above
    sb.Append("</style></head><body>");
    sb.Append("<div class='document-container'>");
    
    // Watermark (optional - could be controlled by another parameter)
    sb.Append("<div class='watermark'>VAL DRAFT</div>");
    
    // Header
    sb.Append($"<div class='val-header'>");
    sb.Append($"<div class='client-name'>{data.ValHeader.ClientName}</div>");
    sb.Append($"<div class='val-title'>{data.ValHeader.ValDescription}</div>");
    sb.Append($"<div class='plan-year'>Plan Year: {data.ValHeader.PlanYearBeginDate:MMMM d, yyyy} - {data.ValHeader.PlanYearEndDate:MMMM d, yyyy}</div>");
    sb.Append("</div>");
    
    // Content
    sb.Append("<div class='document-content'>");
    
    foreach (var section in data.Sections.OrderBy(s => s.DisplayOrder))
    {
        if (includeHeaders)
        {
            sb.Append("<div class='section'>");
            sb.Append($"<h2 class='section-header'>{section.SectionText}</h2>");
            sb.Append("<div class='section-content'>");
        }
        
        foreach (var detail in section.Details.OrderBy(d => d.DisplayOrder))
        {
            sb.Append(RenderValDetail(detail));
        }
        
        if (includeHeaders)
        {
            sb.Append("</div></div>");
        }
    }
    
    sb.Append("</div></div></body></html>");
    
    return sb.ToString();
}

private string RenderValDetail(ValDetail detail)
{
    var classes = new List<string> { "val-detail" };
    
    if (detail.Bullet) classes.Add("bullet");
    if (detail.Indent > 0) classes.Add($"indent-{detail.Indent}");
    if (detail.Bold) classes.Add("font-bold");
    if (detail.Center) classes.Add("text-center");
    if (detail.TightLineHeight) classes.Add("tight");
    if (detail.BlankLineAfter > 0) classes.Add($"blank-{detail.BlankLineAfter}");
    
    var classAttr = string.Join(" ", classes);
    var prefix = detail.Bullet ? "• " : "";
    
    return $"<p class='{classAttr}'>{prefix}{System.Web.HttpUtility.HtmlEncode(detail.DetailText)}</p>";
}
```

## Frontend Integration

### API Service Method
```typescript
// src/services/api/valPdfService.ts
import { apiClient } from './apiClient';

export const valPdfService = {
  generatePdf: async (valId: number, includeHeaders: boolean = false): Promise<Blob> => {
    const response = await apiClient.get(
      `/vals/${valId}/pdf`, 
      {
        params: { includeHeaders },
        responseType: 'blob'
      }
    );
    return response.data;
  },
  
  openPdfInNewTab: async (valId: number, includeHeaders: boolean = false): Promise<void> => {
    const blob = await valPdfService.generatePdf(valId, includeHeaders);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Cleanup after a delay
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
};
```

### Usage in ValBuilder Component
```typescript
import { valPdfService } from '@/services/api/valPdfService';

const handleGeneratePdf = async () => {
  try {
    const includeHeaders = mode === 'preview-sections';
    await valPdfService.openPdfInNewTab(valHeader.valId, includeHeaders);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    // Show error toast/notification
  }
};

// Add button to footer or toolbar
<Button onClick={handleGeneratePdf}>
  Generate PDF
</Button>
```

## Testing Checklist

- [ ] PDF opens in new browser tab
- [ ] All sections appear in correct order
- [ ] Section headers show/hide based on mode
- [ ] Bullet formatting renders correctly (• character, indentation)
- [ ] Indent levels (1-4) display with correct spacing
- [ ] Bold text renders as bold
- [ ] Centered text is centered
- [ ] Tight line height applied when specified
- [ ] Blank lines after (1-3) create appropriate spacing
- [ ] Combined bullet + indent positioning is correct
- [ ] VAL header displays client, description, and dates
- [ ] Watermark appears (if enabled)
- [ ] Page breaks work correctly (no orphaned headers)
- [ ] File downloads with correct name format
- [ ] Special characters are properly escaped
- [ ] Long text wraps correctly
- [ ] Performance is acceptable (< 3 seconds for typical VAL)

## Performance Considerations

1. **Browser Reuse**: Consider keeping a browser instance alive and reusing it (connection pooling)
2. **Caching**: Cache CSS templates
3. **Async**: Use async/await throughout
4. **Memory**: Dispose browser instances properly
5. **Timeout**: Set reasonable timeouts for PDF generation (30 seconds)

## Security Considerations

1. **Authorization**: Verify user has access to the VAL being exported
2. **Input Sanitization**: HTML-encode all user content (detailText, clientName, etc.)
3. **Rate Limiting**: Prevent abuse of PDF generation endpoint
4. **File Size Limits**: Monitor and limit PDF size (warn if > 50 pages)

## Future Enhancements

- [ ] Remove watermark option (for finalized VALs)
- [ ] Custom header/footer with page numbers
- [ ] Table of contents generation
- [ ] Digital signature support
- [ ] Email PDF directly from API
- [ ] Batch PDF generation for multiple VALs
- [ ] Custom branding/logo support
