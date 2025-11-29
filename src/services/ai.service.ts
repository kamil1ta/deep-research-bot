import { AIConfig } from '../utils/types';
import logger from './logger.service';

export class AIService {
  private config: AIConfig;
  private promptImprover: PromptImprover;

  constructor(config: AIConfig) {
    this.config = config;
    this.promptImprover = new PromptImprover();
  }

  async analyzeContent(
    content: string,
    sourceType: string,
    researchTopic: string
  ): Promise<any> {
    try {
      const prompt = this.promptImprover.getContentAnalysisPrompt(
        content,
        sourceType,
        researchTopic
      );

      if (this.config.openaiApiKey) {
        return await this.callOpenAI(prompt);
      } else if (this.config.anthropicApiKey) {
        return await this.callAnthropic(prompt);
      } else {
        throw new Error('No AI API key configured');
      }
    } catch (error) {
      logger.error('AI analysis failed:', error);
      throw error;
    }
  }

  async synthesizeResearch(
    sources: any[],
    researchTopic: string
  ): Promise<any> {
    try {
      const prompt = this.promptImprover.getSynthesisPrompt(sources, researchTopic);

      if (this.config.openaiApiKey) {
        return await this.callOpenAI(prompt);
      } else if (this.config.anthropicApiKey) {
        return await this.callAnthropic(prompt);
      } else {
        throw new Error('No AI API key configured');
      }
    } catch (error) {
      logger.error('Research synthesis failed:', error);
      throw error;
    }
  }

  private async callOpenAI(prompt: string): Promise<any> {
    // This would implement the actual OpenAI API call
    // For now, return a mock response
    logger.info('Calling OpenAI API for content analysis');

    return {
      tldr: 'AI-generated summary would go here',
      mainPoints: ['Point 1', 'Point 2', 'Point 3'],
      keyQuotes: ['Quote 1', 'Quote 2'],
      relevanceScore: 8,
      credibility: 'high',
      insights: ['Insight 1', 'Insight 2'],
    };
  }

  private async callAnthropic(prompt: string): Promise<any> {
    // This would implement the actual Anthropic API call
    // For now, return a mock response
    logger.info('Calling Anthropic API for content analysis');

    return {
      tldr: 'AI-generated summary would go here',
      mainPoints: ['Point 1', 'Point 2', 'Point 3'],
      keyQuotes: ['Quote 1', 'Quote 2'],
      relevanceScore: 8,
      credibility: 'high',
      insights: ['Insight 1', 'Insight 2'],
    };
  }
}

class PromptImprover {
  getContentAnalysisPrompt(
    content: string,
    sourceType: string,
    researchTopic: string
  ): string {
    return `You are analyzing a research source for a tech blog thinkpiece. Your task is to extract and structure the key information from the following content:

CONTENT: ${content.substring(0, 10000)}${content.length > 10000 ? '...' : ''}
SOURCE TYPE: ${sourceType}
RESEARCH TOPIC: ${researchTopic}

Provide the following analysis:

1. **TL;DR Summary** (1-2 sentences):
   What is the absolute core message or finding?

2. **Main Points** (bullet points, 3-5 max):
   - What are the key arguments, data points, or insights?
   - What evidence or examples support these points?
   - What trends or patterns are identified?

3. **Key Quotes** (2-3 most impactful quotes):
   - Select quotes that capture the essence of the argument
   - Include context if necessary

4. **Relevance Score** (1-10):
   How relevant is this content to understanding "${researchTopic}"?
   Justify your rating in 1-2 sentences.

5. **Connections**:
   How might this connect to other discussions in the tech ecosystem?
   What broader implications or related topics does this suggest?

6. **Credibility Assessment** (High/Medium/Low):
   Consider the source authority, evidence quality, and potential biases
   Briefly explain your assessment

Format your response in a structured, scannable format suitable for research organization.`;
  }

  getSynthesisPrompt(sources: any[], researchTopic: string): string {
    const summarizedSources = sources
      .slice(0, 10)
      .map((source, index) => `Source ${index + 1}: ${source.tldr}`)
      .join('\n');

    return `You are synthesizing research findings for a tech thinkpiece on "${researchTopic}".

I have collected ${sources.length} sources from various platforms. Here are the summarized findings:

${summarizedSources}

Your task is to create a comprehensive analysis that identifies:

1. **Core Themes & Patterns**:
   - What are the most prominent themes across all sources?
   - What consensus points emerge?
   - What areas show disagreement or tension?

2. **Key Insights**:
   - What novel perspectives or unique insights appear?
   - What surprising or counterintuitive findings emerge?
   - What questions remain unanswered?

3. **Source Connections**:
   - How do different source types complement each other?
   - Which sources reinforce each other's arguments?
   - Where do sources contradict or challenge each other?

4. **Trend Analysis**:
   - What emerging trends are visible across the content?
   - What historical context is important?
   - What future developments are suggested?

5. **Gaps & Opportunities**:
   - What important aspects seem underexplored?
   - What follow-up research would be valuable?
   - What unique angle could this thinkpiece take?

6. **Narrative Arc**:
   - Suggest a logical flow for organizing these insights into a compelling narrative
   - Identify the most compelling opening hook and concluding thought

Provide your analysis in a structured format that can serve as the foundation for the thinkpiece structure.`;
  }
}