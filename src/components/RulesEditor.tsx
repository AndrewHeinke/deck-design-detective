import { Textarea } from '@/components/ui/textarea';

interface RulesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const defaultRules = `- Text colors allowed: black, red
- All titles must be font size 36 or higher  
- No images allowed on title slides
- Font family allowed: Arial, Helvetica
- Maximum font size: 72pt`;

export function RulesEditor({ value, onChange }: RulesEditorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        Define your design rules (in Markdown format)
      </label>
      
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={defaultRules}
          className="min-h-[200px] font-mono text-sm resize-none"
          style={{ lineHeight: '1.6' }}
        />
      </div>
      
      <div className="text-xs text-muted-foreground space-y-2">
        <p>Use Markdown syntax to define your design rules. Each rule should be on a separate line starting with a dash (-).</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-medium mb-1">Supported rule types:</p>
          <ul className="space-y-1">
            <li>• <strong>Colors:</strong> "Text colors allowed: black, red"</li>
            <li>• <strong>Font size:</strong> "Font size minimum: 24pt" or "Font size 36 or higher"</li>
            <li>• <strong>Font family:</strong> "Font family allowed: Arial, Helvetica"</li>
            <li>• <strong>Images:</strong> "No images allowed on title slides"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}