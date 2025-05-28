export interface NLPResult {
    target: string;
    property: string;
    value: string;
    confidence: number;
    explanation?: string;
} 