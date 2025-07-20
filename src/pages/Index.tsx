import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { RulesEditor } from '@/components/RulesEditor';
import { ResultsPanel } from '@/components/ResultsPanel';
import { Shield, CheckCircle } from 'lucide-react';

interface Violation {
  slide: number;
  description: string;
  elements: string[];
}

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rules, setRules] = useState('');
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const handleSubmit = async () => {
    if (!file || !rules.trim()) return;

    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock violations for demo
    const mockViolations: Violation[] = [
      {
        slide: 1,
        description: "Title slide contains images, which violates the 'No images allowed on title slides' rule",
        elements: ["Background image: company-logo.png", "Decorative element: banner.jpg"]
      },
      {
        slide: 3,
        description: "Text color not in allowed list (found blue, only black and red are allowed)",
        elements: ["Subtitle text in blue color", "Bullet points using blue color"]
      },
      {
        slide: 5,
        description: "Title font size is below minimum requirement (found 24pt, minimum is 36pt)",
        elements: ["Main title: 24pt Arial"]
      }
    ];
    
    setViolations(mockViolations);
    setIsProcessing(false);
    setHasResults(true);
  };

  const handleReset = () => {
    setFile(null);
    setRules('');
    setViolations([]);
    setHasResults(false);
    setIsProcessing(false);
  };

  const isSubmitDisabled = !file || !rules.trim() || isProcessing;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary-muted to-background border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-foreground">
              PowerPoint Design Enforcer
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your deck, define your design rules, and get instant feedback on any violations.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {!hasResults ? (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Upload Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>1. Upload File</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload file={file} onFileChange={setFile} />
              </CardContent>
            </Card>

            {/* Rules Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>2. Define Rules</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RulesEditor value={rules} onChange={setRules} />
              </CardContent>
            </Card>

            {/* Submit Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={handleSubmit}
                      disabled={isSubmitDisabled}
                      className="px-8"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Check for Design Violations
                        </>
                      )}
                    </Button>
                    {isSubmitDisabled && !isProcessing && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Please upload a file and define rules to continue
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <ResultsPanel
            violations={violations}
            isProcessing={isProcessing}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
