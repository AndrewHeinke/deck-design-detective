import { Textarea } from '@/components/ui/textarea';

interface RulesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const defaultRules = `- Text colors allowed: black, red
- All titles must be font size 36 or higher  
- No images allowed on title slides`;

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
      
      <div className="text-xs text-muted-foreground">
        <p>Use Markdown syntax to define your design rules. Each rule should be on a separate line starting with a dash (-).</p>
      </div>
    </div>
  );
}