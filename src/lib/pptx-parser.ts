import JSZip from 'jszip';
import { parseString } from 'xml2js';

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
    const slideFiles = Object.keys(zip.files).filter(fileName => 
      fileName.startsWith('ppt/slides/slide') && fileName.endsWith('.xml')
    );
    
    // Sort slides by number
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
      return numA - numB;
    });
    
    // Parse each slide
    for (let i = 0; i < slideFiles.length; i++) {
      const slideFile = slideFiles[i];
      const slideContent = await zip.file(slideFile)?.async('string');
      
      if (slideContent) {
        const slide = await parseSlideXml(slideContent, i + 1);
        slides.push(slide);
      }
    }
    
    // Parse theme if available
    const themeFile = zip.file('ppt/theme/theme1.xml');
    let theme;
    if (themeFile) {
      const themeContent = await themeFile.async('string');
      theme = await parseThemeXml(themeContent);
    }
    
    return { slides, theme };
  } catch (error) {
    console.error('Error parsing PPTX file:', error);
    throw new Error('Failed to parse PowerPoint file. Please ensure it is a valid .pptx file.');
  }
}

async function parseSlideXml(xmlContent: string, slideNumber: number): Promise<SlideContent> {
  return new Promise((resolve, reject) => {
    parseString(xmlContent, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      
      const slide: SlideContent = {
        slideNumber,
        texts: [],
        images: [],
        shapes: [],
      };
      
      try {
        // Parse text content
        const textElements = findElementsRecursive(result, 'a:t');
        textElements.forEach(textEl => {
          if (textEl && typeof textEl === 'string') {
            // Find parent elements to get formatting
            const fontSize = extractFontSize(result, textEl);
            const fontFamily = extractFontFamily(result, textEl);
            const color = extractColor(result, textEl);
            
            slide.texts.push({
              content: textEl,
              fontSize,
              fontFamily,
              color,
            });
          }
        });
        
        // Parse images
        const imageElements = findElementsRecursive(result, 'a:blip');
        imageElements.forEach((img: any) => {
          if (img && img.$ && img.$['r:embed']) {
            slide.images.push({
              name: img.$['r:embed'],
              type: 'embedded'
            });
          }
        });
        
        // Parse shapes
        const shapeElements = findElementsRecursive(result, 'p:sp');
        shapeElements.forEach((shape: any) => {
          if (shape) {
            slide.shapes.push({
              type: 'shape',
              text: extractShapeText(shape)
            });
          }
        });
        
        resolve(slide);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

async function parseThemeXml(xmlContent: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(xmlContent, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      
      const theme = {
        colors: [],
        fonts: []
      };
      
      // Extract theme colors and fonts
      // This is a simplified extraction
      resolve(theme);
    });
  });
}

function findElementsRecursive(obj: any, tagName: string): any[] {
  const results: any[] = [];
  
  function search(current: any) {
    if (current && typeof current === 'object') {
      if (Array.isArray(current)) {
        current.forEach(search);
      } else {
        Object.keys(current).forEach(key => {
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

function extractFontSize(xmlObj: any, textContent: string): number | undefined {
  // Simplified font size extraction
  // In a real implementation, you'd traverse the XML to find the parent formatting
  return undefined;
}

function extractFontFamily(xmlObj: any, textContent: string): string | undefined {
  // Simplified font family extraction
  return undefined;
}

function extractColor(xmlObj: any, textContent: string): string | undefined {
  // Simplified color extraction
  return undefined;
}

function extractShapeText(shape: any): string | undefined {
  // Extract text from shape
  const texts = findElementsRecursive(shape, 'a:t');
  return texts.join(' ') || undefined;
}