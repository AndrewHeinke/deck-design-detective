import { DesignRule } from './rules-parser';
import { ParsedPresentation, SlideContent } from './pptx-parser';

export interface Violation {
  slide: number;
  rule: DesignRule;
  description: string;
  elements: string[];
  severity: 'error' | 'warning';
}

export function validatePresentation(
  presentation: ParsedPresentation,
  rules: DesignRule[]
): Violation[] {
  const violations: Violation[] = [];
  
  rules.forEach(rule => {
    presentation.slides.forEach(slide => {
      const slideViolations = validateSlideAgainstRule(slide, rule);
      violations.push(...slideViolations);
    });
  });
  
  return violations;
}

function validateSlideAgainstRule(slide: SlideContent, rule: DesignRule): Violation[] {
  const violations: Violation[] = [];
  
  switch (rule.type) {
    case 'color':
      violations.push(...validateColorRule(slide, rule));
      break;
    case 'font-size':
      violations.push(...validateFontSizeRule(slide, rule));
      break;
    case 'font-family':
      violations.push(...validateFontFamilyRule(slide, rule));
      break;
    case 'image':
      violations.push(...validateImageRule(slide, rule));
      break;
    case 'text':
      violations.push(...validateTextRule(slide, rule));
      break;
    case 'custom':
      violations.push(...validateCustomRule(slide, rule));
      break;
  }
  
  return violations;
}

function validateColorRule(slide: SlideContent, rule: DesignRule): Violation[] {
  const violations: Violation[] = [];
  const allowedColors = rule.parameters.allowedValues || [];
  
  if (allowedColors.length === 0) return violations;
  
  slide.texts.forEach((text, index) => {
    if (text.color) {
      const colorMatch = allowedColors.some(allowed => 
        text.color?.toLowerCase().includes(allowed.toLowerCase())
      );
      
      if (!colorMatch) {
        violations.push({
          slide: slide.slideNumber,
          rule,
          description: `Text color not in allowed list (found ${text.color}, only ${allowedColors.join(', ')} are allowed)`,
          elements: [`Text "${text.content.substring(0, 50)}..." with color ${text.color}`],
          severity: 'error'
        });
      }
    }
  });
  
  return violations;
}

function validateFontSizeRule(slide: SlideContent, rule: DesignRule): Violation[] {
  const violations: Violation[] = [];
  const minSize = rule.parameters.minValue;
  const maxSize = rule.parameters.maxValue;
  
  slide.texts.forEach(text => {
    if (text.fontSize) {
      let violationFound = false;
      let violationMessage = '';
      
      if (minSize && text.fontSize < minSize) {
        violationFound = true;
        violationMessage = `Font size is below minimum requirement (found ${text.fontSize}pt, minimum is ${minSize}pt)`;
      }
      
      if (maxSize && text.fontSize > maxSize) {
        violationFound = true;
        violationMessage = `Font size exceeds maximum requirement (found ${text.fontSize}pt, maximum is ${maxSize}pt)`;
      }
      
      if (violationFound) {
        violations.push({
          slide: slide.slideNumber,
          rule,
          description: violationMessage,
          elements: [`Text "${text.content.substring(0, 30)}...": ${text.fontSize}pt`],
          severity: 'error'
        });
      }
    }
  });
  
  return violations;
}

function validateFontFamilyRule(slide: SlideContent, rule: DesignRule): Violation[] {
  const violations: Violation[] = [];
  const allowedFonts = rule.parameters.allowedValues || [];
  
  if (allowedFonts.length === 0) return violations;
  
  slide.texts.forEach(text => {
    if (text.fontFamily) {
      const fontMatch = allowedFonts.some(allowed => 
        text.fontFamily?.toLowerCase().includes(allowed.toLowerCase())
      );
      
      if (!fontMatch) {
        violations.push({
          slide: slide.slideNumber,
          rule,
          description: `Font family not in allowed list (found ${text.fontFamily}, only ${allowedFonts.join(', ')} are allowed)`,
          elements: [`Text with font ${text.fontFamily}`],
          severity: 'error'
        });
      }
    }
  });
  
  return violations;
}

function validateImageRule(slide: SlideContent, rule: DesignRule): Violation[] {
  const violations: Violation[] = [];
  const forbidden = rule.parameters.forbidden || [];
  const slideTypes = rule.parameters.slideTypes || [];
  
  // Check if images are forbidden on this slide type
  if (forbidden.includes('all') || forbidden.includes('images')) {
    const isTitleSlide = slide.slideNumber === 1 || slideTypes.includes('title');
    const shouldApplyRule = slideTypes.length === 0 || 
                           slideTypes.includes('all') || 
                           (isTitleSlide && slideTypes.includes('title'));
    
    if (shouldApplyRule && slide.images.length > 0) {
      violations.push({
        slide: slide.slideNumber,
        rule,
        description: `Slide contains images, which violates the '${rule.description}' rule`,
        elements: slide.images.map(img => `Image: ${img.name}`),
        severity: 'error'
      });
    }
  }
  
  return violations;
}

function validateTextRule(slide: SlideContent, rule: DesignRule): Violation[] {
  const violations: Violation[] = [];
  
  // Generic text validation - this would be expanded based on specific rule requirements
  // For now, just check if there's any text content
  if (slide.texts.length === 0 && rule.description.includes('required')) {
    violations.push({
      slide: slide.slideNumber,
      rule,
      description: 'Slide has no text content but text is required',
      elements: ['No text found on slide'],
      severity: 'warning'
    });
  }
  
  return violations;
}

function validateCustomRule(slide: SlideContent, rule: DesignRule): Violation[] {
  const violations: Violation[] = [];
  
  // For custom rules, we can only do basic validation
  // In a real implementation, this would need more sophisticated rule parsing
  
  return violations;
}