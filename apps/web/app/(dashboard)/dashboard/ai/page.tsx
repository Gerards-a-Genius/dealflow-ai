'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  Mail,
  Brain,
  FileText,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Send,
  TrendingUp,
  User,
} from 'lucide-react';

type ToolType = 'email' | 'analyze' | 'market';

interface EmailResult {
  subject: string;
  body: string;
}

interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

interface MarketReport {
  summary: string;
  marketTrends: string[];
  pricing: string;
  recommendations: string[];
}

export default function AIToolsPage() {
  const searchParams = useSearchParams();
  const initialTool = (searchParams.get('type') as ToolType) || 'email';
  const initialLeadId = searchParams.get('leadId') || '';

  const { token } = useAuth();
  const [activeTool, setActiveTool] = useState<ToolType>(initialTool);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Email state
  const [emailContext, setEmailContext] = useState({
    leadId: initialLeadId,
    purpose: 'follow_up',
    tone: 'professional',
    customContext: '',
  });
  const [emailResult, setEmailResult] = useState<EmailResult | null>(null);

  // Analysis state
  const [analysisLeadId, setAnalysisLeadId] = useState(initialLeadId);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Market report state
  const [marketParams, setMarketParams] = useState({
    location: '',
    propertyType: 'SINGLE_FAMILY',
    priceRange: '',
  });
  const [marketResult, setMarketResult] = useState<MarketReport | null>(null);

  const handleGenerateEmail = async () => {
    if (!token) return;
    setLoading(true);
    setEmailResult(null);

    try {
      const response = await apiClient.post<EmailResult>(
        '/api/ai/generate-email',
        {
          leadId: emailContext.leadId || undefined,
          purpose: emailContext.purpose,
          tone: emailContext.tone,
          customContext: emailContext.customContext || undefined,
        },
        token
      );

      if (response.success && response.data) {
        setEmailResult(response.data);
      }
    } catch (error) {
      console.error('Failed to generate email:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeLead = async () => {
    if (!token || !analysisLeadId) return;
    setLoading(true);
    setAnalysisResult(null);

    try {
      const response = await apiClient.post<AnalysisResult>(
        '/api/ai/analyze-lead',
        { leadId: analysisLeadId },
        token
      );

      if (response.success && response.data) {
        setAnalysisResult(response.data);
      }
    } catch (error) {
      console.error('Failed to analyze lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMarketReport = async () => {
    if (!token || !marketParams.location) return;
    setLoading(true);
    setMarketResult(null);

    try {
      const response = await apiClient.post<MarketReport>(
        '/api/ai/market-report',
        marketParams,
        token
      );

      if (response.success && response.data) {
        setMarketResult(response.data);
      }
    } catch (error) {
      console.error('Failed to generate market report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tools = [
    { id: 'email' as ToolType, label: 'Email Generator', icon: Mail, description: 'Generate personalized emails' },
    { id: 'analyze' as ToolType, label: 'Lead Analysis', icon: Brain, description: 'Get AI insights on leads' },
    { id: 'market' as ToolType, label: 'Market Report', icon: TrendingUp, description: 'Generate market analysis' },
  ];

  const purposeOptions = [
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'introduction', label: 'Introduction' },
    { value: 'listing_update', label: 'Listing Update' },
    { value: 'price_reduction', label: 'Price Reduction' },
    { value: 'under_contract', label: 'Under Contract' },
    { value: 'closing', label: 'Closing Congrats' },
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'casual', label: 'Casual' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent-500" />
          AI Tools
        </h1>
        <p className="text-neutral-500 mt-1">Powered by Claude AI to help you work smarter</p>
      </div>

      {/* Tool Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              activeTool === tool.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <tool.icon
                className={`h-5 w-5 ${activeTool === tool.id ? 'text-primary-500' : 'text-neutral-400'}`}
              />
              <span className={`font-medium ${activeTool === tool.id ? 'text-primary-700' : 'text-neutral-900'}`}>
                {tool.label}
              </span>
            </div>
            <p className="text-sm text-neutral-500">{tool.description}</p>
          </button>
        ))}
      </div>

      {/* Email Generator */}
      {activeTool === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Email Settings</h2>
            <div className="space-y-4">
              <Input
                label="Lead ID (Optional)"
                placeholder="Enter lead ID for personalization"
                value={emailContext.leadId}
                onChange={(e) => setEmailContext({ ...emailContext, leadId: e.target.value })}
                leftIcon={User}
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Purpose</label>
                <select
                  value={emailContext.purpose}
                  onChange={(e) => setEmailContext({ ...emailContext, purpose: e.target.value })}
                  className="input-base"
                >
                  {purposeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tone</label>
                <select
                  value={emailContext.tone}
                  onChange={(e) => setEmailContext({ ...emailContext, tone: e.target.value })}
                  className="input-base"
                >
                  {toneOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={emailContext.customContext}
                  onChange={(e) => setEmailContext({ ...emailContext, customContext: e.target.value })}
                  placeholder="Any specific details to include..."
                  rows={3}
                  className="input-base resize-none"
                />
              </div>

              <Button onClick={handleGenerateEmail} loading={loading} fullWidth icon={Sparkles}>
                Generate Email
              </Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Generated Email</h2>
              {emailResult && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={copied ? Check : Copy}
                    onClick={() => handleCopy(`Subject: ${emailResult.subject}\n\n${emailResult.body}`)}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleGenerateEmail}>
                    Regenerate
                  </Button>
                </div>
              )}
            </div>

            {emailResult ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wide">Subject</label>
                  <p className="font-medium text-neutral-900 mt-1">{emailResult.subject}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wide">Body</label>
                  <div className="mt-1 p-4 bg-neutral-50 rounded-lg whitespace-pre-wrap text-neutral-700">
                    {emailResult.body}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-neutral-400">
                <div className="text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2" />
                  <p>Configure settings and generate an email</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Lead Analysis */}
      {activeTool === 'analyze' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Analyze Lead</h2>
            <div className="space-y-4">
              <Input
                label="Lead ID"
                placeholder="Enter the lead ID to analyze"
                value={analysisLeadId}
                onChange={(e) => setAnalysisLeadId(e.target.value)}
                leftIcon={User}
              />
              <Button
                onClick={handleAnalyzeLead}
                loading={loading}
                fullWidth
                icon={Brain}
                disabled={!analysisLeadId}
              >
                Analyze Lead
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Analysis Results</h2>

            {analysisResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-500">{analysisResult.score}</div>
                    <div className="text-xs text-neutral-500">AI Score</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-700">{analysisResult.summary}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Strengths</h4>
                  <ul className="space-y-1">
                    {analysisResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                        <Check className="h-4 w-4 text-secondary-500 flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Concerns</h4>
                  <ul className="space-y-1">
                    {analysisResult.concerns.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                        <span className="w-4 h-4 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                          !
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {analysisResult.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                        <Sparkles className="h-4 w-4 text-primary-500 flex-shrink-0 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-neutral-400">
                <div className="text-center">
                  <Brain className="h-8 w-8 mx-auto mb-2" />
                  <p>Enter a lead ID to get AI-powered insights</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Market Report */}
      {activeTool === 'market' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Market Report Parameters</h2>
            <div className="space-y-4">
              <Input
                label="Location"
                placeholder="e.g., Austin, TX or 78701"
                value={marketParams.location}
                onChange={(e) => setMarketParams({ ...marketParams, location: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Property Type</label>
                <select
                  value={marketParams.propertyType}
                  onChange={(e) => setMarketParams({ ...marketParams, propertyType: e.target.value })}
                  className="input-base"
                >
                  <option value="SINGLE_FAMILY">Single Family</option>
                  <option value="CONDO">Condo/Townhouse</option>
                  <option value="MULTI_FAMILY">Multi-Family</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>

              <Input
                label="Price Range (Optional)"
                placeholder="e.g., $300k-$500k"
                value={marketParams.priceRange}
                onChange={(e) => setMarketParams({ ...marketParams, priceRange: e.target.value })}
              />

              <Button
                onClick={handleGenerateMarketReport}
                loading={loading}
                fullWidth
                icon={FileText}
                disabled={!marketParams.location}
              >
                Generate Report
              </Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Market Report</h2>
              {marketResult && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={copied ? Check : Copy}
                  onClick={() =>
                    handleCopy(
                      `Market Report: ${marketParams.location}\n\n${marketResult.summary}\n\nTrends:\n${marketResult.marketTrends.join('\n')}\n\nPricing: ${marketResult.pricing}\n\nRecommendations:\n${marketResult.recommendations.join('\n')}`
                    )
                  }
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              )}
            </div>

            {marketResult ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Summary</h4>
                  <p className="text-neutral-700">{marketResult.summary}</p>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Market Trends</h4>
                  <ul className="space-y-1">
                    {marketResult.marketTrends.map((trend, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                        <TrendingUp className="h-4 w-4 text-secondary-500 flex-shrink-0 mt-0.5" />
                        {trend}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Pricing Analysis</h4>
                  <p className="text-neutral-700">{marketResult.pricing}</p>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {marketResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                        <Sparkles className="h-4 w-4 text-primary-500 flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-neutral-400">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>Enter a location to generate a market report</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
