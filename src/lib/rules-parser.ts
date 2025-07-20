import { marked } from 'marked';

export interface DesignRule {
  id: string;
  description: string;
  type: 'color' | 'font-size' | 'font-family' | 'image' | 'text' | 'slide-type' | 'custom';
  parameters: {
    allowedValues?: string[];
    minValue?: number;
    maxValue?: number;
    forbidden?: string[];
    slideTypes?: string[];
    pattern?: string;
  };
}

export function parseMarkdownRules(markdownText: string): DesignRule[] {
  const rules: DesignRule[] = [];
  
  // Parse markdown to get structured content
  const tokens = marked.lexer(markdownText);
  
  let currentRule: Partial<DesignRule> = {};
  let ruleCounter = 0;
  
  tokens.forEach((token) => {
    if (token.type === 'list') {
      token.items.forEach((item) => {
        const ruleText = item.text.toLowerCase().trim();
        const rule = parseRuleText(ruleText, ++ruleCounter);
        if (rule) {
          rules.push(rule);
        }
      });
    } else if (token.type === 'paragraph') {
      // Handle paragraph-style rules
      const lines = token.text.split('\n');
      lines.forEach((line) => {
        const ruleText = line.toLowerCase().trim();
        if (ruleText.length > 0) {
          const rule = parseRuleText(ruleText, ++ruleCounter);
          if (rule) {
            rules.push(rule);
          }
        }
      });
    }
  });
  
  return rules;
}

function parseRuleText(ruleText: string, id: number): DesignRule | null {
  const cleanText = ruleText.replace(/^[-*]\s*/, '').trim();
  
  // Text colors allowed rule
  if (cleanText.includes('text color') && cleanText.includes('allowed')) {
    const colors = extractAllowedValues(cleanText);
    return {
      id: `rule-${id}`,
      description: cleanText,
      type: 'color',
      parameters: { allowedValues: colors }
    };
  }
  
  // Font size rules
  if (cleanText.includes('font size') || cleanText.includes('title') && cleanText.includes('size')) {
    const minSize = extractMinValue(cleanText);
    const maxSize = extractMaxValue(cleanText);
    return {
      id: `rule-${id}`,
      description: cleanText,
      type: 'font-size',
      parameters: { minValue: minSize, maxValue: maxSize }
    };
  }
  
  // Image rules
  if (cleanText.includes('image') || cleanText.includes('picture')) {
    if (cleanText.includes('no ') || cleanText.includes('not allowed') || cleanText.includes('forbidden')) {
      const slideTypes = extractSlideTypes(cleanText);
      return {
        id: `rule-${id}`,
        description: cleanText,
        type: 'image',
        parameters: { forbidden: ['all'], slideTypes }
      };
    }
  }
  
  // Font family rules
  if (cleanText.includes('font') && (cleanText.includes('family') || cleanText.includes('type'))) {
    const allowedFonts = extractAllowedValues(cleanText);
    return {
      id: `rule-${id}`,
      description: cleanText,
      type: 'font-family',
      parameters: { allowedValues: allowedFonts }
    };
  }
  
  // Generic text content rules
  if (cleanText.includes('text') && !cleanText.includes('color') && !cleanText.includes('size')) {
    return {
      id: `rule-${id}`,
      description: cleanText,
      type: 'text',
      parameters: {}
    };
  }
  
  // If we can't categorize it, treat as custom rule
  if (cleanText.length > 0) {
    return {
      id: `rule-${id}`,
      description: cleanText,
      type: 'custom',
      parameters: {}
    };
  }
  
  return null;
}

function extractAllowedValues(text: string): string[] {
  // Extract values from patterns like "allowed: black, red" or "only black and red"
  const colonMatch = text.match(/allowed?:\s*([^.]+)/i);
  if (colonMatch) {
    return colonMatch[1].split(/[,&]|\s+and\s+/).map(s => s.trim()).filter(Boolean);
  }
  
  const onlyMatch = text.match(/only\s+([^.]+?)(?:\s+are?\s+allowed|$)/i);
  if (onlyMatch) {
    return onlyMatch[1].split(/[,&]|\s+and\s+/).map(s => s.trim()).filter(Boolean);
  }
  
  return [];
}

function extractMinValue(text: string): number | undefined {
  const minMatch = text.match(/min(?:imum)?\s*(?:is\s*|:\s*)?(\d+)/i);
  if (minMatch) {
    return parseInt(minMatch[1]);
  }
  
  const atLeastMatch = text.match(/at\s+least\s+(\d+)/i);
  if (atLeastMatch) {
    return parseInt(atLeastMatch[1]);
  }
  
  const orHigherMatch = text.match(/(\d+)\s*(?:pt|px|points?)\s*or\s*higher/i);
  if (orHigherMatch) {
    return parseInt(orHigherMatch[1]);
  }
  
  return undefined;
}

function extractMaxValue(text: string): number | undefined {
  const maxMatch = text.match(/max(?:imum)?\s*(?:is\s*|:\s*)?(\d+)/i);
  if (maxMatch) {
    return parseInt(maxMatch[1]);
  }
  
  const noMoreThanMatch = text.match(/no\s+more\s+than\s+(\d+)/i);
  if (noMoreThanMatch) {
    return parseInt(noMoreThanMatch[1]);
  }
  
  return undefined;
}

function extractSlideTypes(text: string): string[] {
  const slideTypes: string[] = [];
  
  if (text.includes('title slide')) {
    slideTypes.push('title');
  }
  if (text.includes('content slide')) {
    slideTypes.push('content');
  }
  if (text.includes('all slide')) {
    slideTypes.push('all');
  }
  
  return slideTypes;
}