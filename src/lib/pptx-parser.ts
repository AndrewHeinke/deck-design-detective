import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

function parseXml(xml: string): Promise<any> {
  const parser = new XMLParser();
  return parser.parse(xml);
}

export interface SlideContent {
  slideNumber: number;
  texts: Array<{
    content: string;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    isBold?: boolean;
    isItalic?: boolean;
  }>;
  images: Array<{
    name: string;
    type: string;
  }>;
  shapes: Array<{
    type: string;
    text?: string;
  }>;
  background?: {
    type: string;
    color?: string;
    image?: string;
  };
}

export interface ParsedPresentation {
  slides: SlideContent[];
  theme?: {
    colors: string[];
    fonts: string[];
  };
}

export async function parsePptxFile(file: File): Promise<ParsedPresentation> {
  try {
    const zip = await JSZip.loadAsync(file);
    const slides: SlideContent[] = [];

    // Get slide files
    const slideFiles = Object.keys(zip.files).filter(
      (fileName) =>
        fileName.startsWith("ppt/slides/slide") && fileName.endsWith(".xml")
    );

    // Sort slides by number
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || "0");
      const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || "0");
      return numA - numB;
    });

    // Parse each slide
    for (let i = 0; i < slideFiles.length; i++) {
      const slideFile = slideFiles[i];
      const slideContent = await zip.file(slideFile)?.async("string");

      if (slideContent) {
        const slide = await parseSlideXml(slideContent, i + 1);
        slides.push(slide);
      }
    }

    // Parse theme if available
    const themeFile = zip.file("ppt/theme/theme1.xml");
    let theme;
    if (themeFile) {
      const themeContent = await themeFile.async("string");
      theme = await parseThemeXml(themeContent);
    }

    return { slides, theme };
  } catch (error) {
    console.error("Error parsing PPTX file:", error);
    throw new Error(
      "Failed to parse PowerPoint file. Please ensure it is a valid .pptx file."
    );
  }
}

async function parseSlideXml(
  xmlContent: string,
  slideNumber: number
): Promise<SlideContent> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const result = parser.parse(xmlContent);

  const slide: SlideContent = {
    slideNumber,
    texts: [],
    images: [],
    shapes: [],
  };

  // Navigate to paragraphs (a:p), then runs (a:r), then text (a:t)
  const shapes = findElementsRecursive(result, "p:sp");
  console.log(shapes);
  shapes.forEach((shape) => {
    const paragraphs = shape?.["p:txBody"]?.["a:p"];
    if (!paragraphs) return;

    const paragraphArray = Array.isArray(paragraphs)
      ? paragraphs
      : [paragraphs];

    paragraphArray.forEach((p) => {
      const runs = p["a:r"]
        ? Array.isArray(p["a:r"])
          ? p["a:r"]
          : [p["a:r"]]
        : [];
      runs.forEach((run) => {
        const text = run?.["a:t"];
        const props = run?.["a:rPr"];

        if (typeof text === "string") {
          slide.texts.push({
            content: text,
            fontSize: extractFontSize(props),
            fontFamily: extractFontFamily(props),
            color: extractColor(props),
            isBold: props?.["@_b"] === "1",
            isItalic: props?.["@_i"] === "1",
          });
        }
      });
    });
  });

  console.log({ slide });

  return slide;
}

async function parseThemeXml(xmlContent: string): Promise<{
  colors: string[];
  fonts: string[];
}> {
  const result = await parseXml(xmlContent);

  const theme = {
    colors: [] as string[],
    fonts: [] as string[],
  };

  try {
    const clrScheme =
      result?.["a:theme"]?.["a:themeElements"]?.[0]?.["a:clrScheme"]?.[0];

    if (clrScheme) {
      for (const key in clrScheme) {
        const val = clrScheme[key]?.[0]?.["a:srgbClr"]?.[0]?.["$"]?.["val"];
        if (val) {
          theme.colors.push(val);
        }
      }
    }

    const fontScheme =
      result?.["a:theme"]?.["a:themeElements"]?.[0]?.["a:fontScheme"]?.[0];

    if (fontScheme) {
      const extractFonts = (fontBlock: any) => {
        Object.values(fontBlock || {}).forEach((fontArr) => {
          if (Array.isArray(fontArr)) {
            fontArr.forEach((font) => {
              const face = font?.["$"]?.["typeface"];
              if (face) theme.fonts.push(face);
            });
          }
        });
      };

      extractFonts(fontScheme["a:majorFont"]?.[0]);
      extractFonts(fontScheme["a:minorFont"]?.[0]);
    }
  } catch (e) {
    console.warn("Warning: Failed to fully extract theme:", e);
  }

  return theme;
}

function findElementsRecursive(obj: any, tagName: string): any[] {
  const results: any[] = [];

  function search(current: any) {
    if (current && typeof current === "object") {
      if (Array.isArray(current)) {
        current.forEach(search);
      } else {
        Object.keys(current).forEach((key) => {
          if (key === tagName) {
            if (Array.isArray(current[key])) {
              results.push(...current[key]);
            } else {
              results.push(current[key]);
            }
          } else {
            search(current[key]);
          }
        });
      }
    }
  }

  search(obj);
  return results;
}

function extractFontSize(rPr: any): number | undefined {
  const rawSize = rPr?.["@_sz"];
  if (rawSize) {
    return parseInt(rawSize, 10) / 100; // 2400 => 24 pt
  }
  return undefined;
}

function extractFontFamily(rPr: any): string | undefined {
  return rPr?.["a:latin"]?.["@_typeface"];
}

function extractColor(rPr: any): string | undefined {
  return rPr?.["a:solidFill"]?.["a:srgbClr"]?.["@_val"];
}

function extractShapeText(shape: any): string | undefined {
  // Extract text from shape
  const texts = findElementsRecursive(shape, "a:t");
  return texts.join(" ") || undefined;
}
