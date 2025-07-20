import { CheckCircle, AlertTriangle, FileText, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Violation {
  slide: number;
  description: string;
  elements: string[];
}

interface ResultsPanelProps {
  violations: Violation[];
  isProcessing: boolean;
  onReset: () => void;
}

export function ResultsPanel({ violations, isProcessing, onReset }: ResultsPanelProps) {
  if (isProcessing) {
    return (
      <Card className="mt-8">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing your PowerPoint file...</p>
        </CardContent>
      </Card>
    );
  }

  const hasViolations = violations.length > 0;

  return (
    <Card className="mt-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {hasViolations ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className="h-5 w-5 text-success" />
            )}
            <span>
              {hasViolations ? 'Design Violations Found' : 'No Violations Found'}
            </span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {hasViolations ? (
          <div className="space-y-4">
            <div className="bg-destructive-muted p-4 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive font-medium mb-2">
                {violations.length} violation{violations.length === 1 ? '' : 's'} detected
              </p>
              <p className="text-xs text-muted-foreground">
                Review the issues below and update your presentation accordingly.
              </p>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {violations.map((violation, index) => (
                <div
                  key={index}
                  className="border border-destructive/20 rounded-lg p-4 bg-destructive-muted/50"
                >
                  <div className="flex items-start space-x-3">
                    <FileText className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">
                        Slide {violation.slide}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {violation.description}
                      </p>
                      {violation.elements.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">
                            Offending elements:
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {violation.elements.map((element, idx) => (
                              <li key={idx} className="flex items-center space-x-1">
                                <span className="w-1 h-1 bg-destructive rounded-full flex-shrink-0"></span>
                                <span>{element}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              All Rules Passed!
            </h3>
            <p className="text-muted-foreground mb-4">
              Your PowerPoint presentation meets all the defined design rules.
            </p>
            <div className="bg-success-muted p-4 rounded-lg border border-success/20">
              <p className="text-sm text-success">
                Great work! Your presentation maintains consistent design standards.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}