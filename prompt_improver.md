# Prompt Improver for Deep Research Bot

This document contains optimized prompts for different LLM interactions throughout the research bot workflow.

## Content Analysis & Summarization Prompts

### Source Content Summarization
```
You are analyzing a research source for a tech blog thinkpiece. Your task is to extract and structure the key information from the following content:

CONTENT: {content}
SOURCE: {source_type} - {url}
AUTHOR: {author}
DATE: {date}

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
   How relevant is this content to understanding "{research_topic}"?
   Justify your rating in 1-2 sentences.

5. **Connections**:
   How might this connect to other discussions in the tech ecosystem?
   What broader implications or related topics does this suggest?

6. **Credibility Assessment** (High/Medium/Low):
   Consider the source authority, evidence quality, and potential biases
   Briefly explain your assessment

Format your response in a structured, scannable format suitable for research organization.
```

### Topic Synthesis & Connection Mapping
```
You are synthesizing research findings for a tech thinkpiece on "{research_topic}".

I have collected {number_of_sources} sources from various platforms. Here are the summarized findings:

{summarized_sources}

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
   - How do different source types (academic articles, social media, VC reports) complement each other?
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

Provide your analysis in a structured format that can serve as the foundation for the thinkpiece structure.
```

### Search Query Optimization
```
You are optimizing search queries for deep research on "{research_topic}".

Generate 10-15 optimized search queries that will uncover diverse, high-quality content across different platforms. For each query, specify:

1. **Query string** (exact phrase to search)
2. **Platform(s)** most suitable (Twitter, YouTube, Reddit, academic, news, VC blogs)
3. **Content type** expected (opinions, data, tutorials, discussions, news)
4. **Search intent** (broad overview, specific angle, counterarguments, examples)

Consider these research dimensions:
- Technical implementation details
- Business/market implications
- User perspectives and experiences
- Expert opinions and predictions
- Historical context and evolution
- Related technologies or trends
- Contradictory viewpoints
- Real-world case studies

Format as a search strategy that can be executed programmatically.
```

## Notion Content Generation Prompts

### Source Page Creation
```
Create a Notion page content for a research source with the following structure:

PAGE TITLE: {source_title}

## Source Information
**URL**: {url}
**Platform**: {source_type}
**Author**: {author}
**Date**: {publication_date}
**Credibility**: {credibility_assessment}

## Content Summary
**TL;DR**: {tldr_summary}

## Key Points
{main_points_bullets}

## Important Quotes
{key_quotes}

## Relevance Analysis
**Topic**: {research_topic}
**Relevance Score**: {relevance_score}/10
**Connection to Research**: {connection_explanation}

## Related Sources
[List of connections to other research findings]

## Research Notes
[Space for additional insights or questions]

Make this content scannable with proper formatting, using bold headers, bullet points, and clear sections.
```

### Topic Summary Page Creation
```
Create a comprehensive Notion page summarizing research on "{research_topic}".

PAGE TITLE: Research Summary: {research_topic}
DATE: {research_date}
SOURCES ANALYZED: {source_count}

## Executive Summary
[Brief overview of key findings and main takeaways]

## Core Themes
[Major themes that emerged from research across all sources]

## Key Insights
[Most valuable and actionable insights discovered]

## Source Analysis by Type
**Social Media Discussions**:
[Summary of Twitter, Reddit, TikTok findings]

**Expert Analysis**:
[VC articles, academic papers, expert opinions]

**Market Data & Trends**:
[Quantitative findings and trend analysis]

**User Perspectives**:
[Real-world experiences and opinions]

## Contradictions & Debates
[Areas where sources disagree or show tension]

## Knowledge Gaps
[Important questions that remain unanswered]

## Potential Story Angles
[Suggested approaches for structuring the thinkpiece]

## Follow-up Research
[Areas that need additional investigation]

## Source Index
[Organized list of all sources with quick reference]

Format for easy scanning with clear hierarchy and visual organization.
```

## Quality Assessment Prompts

### Source Relevance Evaluation
```
Evaluate the relevance and quality of this research source for "{research_topic}":

SOURCE: {source_url}
CONTENT SNIPPET: {content_sample}
METADATA: {source_metadata}

Rate each aspect on a scale of 1-10 and provide brief justification:

1. **Topic Relevance**: How directly related to the research topic?
2. **Information Quality**: Is the content accurate, well-researched, and reliable?
3. **Insight Value**: Does it provide unique insights or new perspectives?
4. **Source Authority**: How credible is the author/platform?
5. **Timeliness**: How current is this information?
6. **Actionability**: How useful is this for the thinkpiece?

**Overall Recommendation**: (Include/Exclude/Review Further)
**Confidence Level**: (High/Medium/Low)

Provide specific reasoning for your ratings and any concerns about including this source.
```

### Research Completeness Check
```
Assess the completeness of research on "{research_topic}" based on {source_count} sources analyzed.

CHECKLIST:

**Perspective Diversity**:
- ☐ Technical implementation perspectives
- ☐ Business/market viewpoints
- ☐ User experience discussions
- ☐ Expert/predictor opinions
- ☐ Contradictory viewpoints
- ☐ Historical context

**Source Type Coverage**:
- ☐ Social media insights
- ☐ Expert articles/blogs
- ☐ Academic/research papers
- ☐ Industry reports
- ☐ Real-world examples/cases
- ☐ News/market coverage

**Research Depth**:
- ☐ Surface-level understanding
- ☐ Technical details covered
- ☐ Market implications explored
- ☐ Future trends identified
- ☐ Challenges/limitations addressed

**Knowledge Gaps Identified**:
[List what's missing or needs more research]

**Additional Research Needed**:
- [Specific areas requiring more investigation]
- [Types of sources that would add value]
- [Questions that remain unanswered]

Provide actionable recommendations for completing the research.
```

## Content Enhancement Prompts

### Insight Extraction
```
Extract the most valuable insights from this research content for "{research_topic}":

CONTENT: {content}

Identify and categorize insights:

**Actionable Insights**:
- Practical advice or strategies
- Implementable recommendations
- Best practices identified

**Predictive Insights**:
- Future trends or developments
- Market predictions
- Technology evolution forecasts

**Contrarian Insights**:
- Unpopular but valid viewpoints
- Challenging conventional wisdom
- Counterintuitive findings

**Contextual Insights**:
- Historical perspective
- Industry context
- Related ecosystem effects

**Data-Driven Insights**:
- Quantitative findings
- Statistical trends
- Measurable impacts

For each insight, provide:
1. The insight statement
2. Supporting evidence from content
3. Why it matters for the research topic
4. How it could be applied or expanded

Focus on insights that are novel, well-supported, and valuable for the thinkpiece.
```

### Connection Mapping
```
Map connections between this research finding and the broader "{research_topic}" ecosystem:

FINDING: {specific_insight}
SOURCE: {source_context}

Identify connections in these dimensions:

**Direct Connections**:
- How does this relate to core research questions?
- What other sources support or challenge this finding?

**Broader Implications**:
- What wider industry trends does this connect to?
- How might this affect different stakeholders?

**Related Technologies/Topics**:
- What adjacent areas does this influence?
- What downstream effects might occur?

**Historical Context**:
- How does this fit with previous developments?
- What patterns or precedents exist?

**Future Research Paths**:
- What questions does this raise?
- What follow-up research would build on this?

Provide specific connection points and explain why each connection matters for comprehensive understanding of the topic.
```

## Error Handling & Recovery Prompts

### Content Extraction Failure
```
Content extraction failed for {source_type} source: {url}

Suggest recovery strategies:

1. **Alternative Access Methods**:
   - Different APIs or endpoints?
   - Web scraping alternatives?
   - Archive or cache sources?

2. **Content Substitution**:
   - Similar sources that could provide equivalent information?
   - Secondary sources discussing this content?
   - Alternative perspectives on the same topic?

3. **Manual Intervention**:
   - What specific information needs manual review?
   - What clues suggest about the missing content?
   - How to proceed without this source?

4. **Quality Assurance**:
   - How to ensure research completeness without this source?
   - What red flags should this raise?
   - How to document this gap?

Provide specific next steps and fallback options.
```

### Analysis Quality Assurance
```
Review this content analysis for quality and completeness:

ANALYSIS: {generated_analysis}
SOURCE: {source_info}

Check for:

**Accuracy**:
- Are the main points correctly identified?
- Is the summary faithful to the original content?
- Are quotes accurate and in context?

**Completeness**:
- Are all key insights captured?
- Is important context preserved?
- Are relevant connections identified?

**Relevance**:
- Does the analysis focus on the research topic?
- Are tangential elements minimized?
- Is the relevance scoring appropriate?

**Format Consistency**:
- Does it follow the expected structure?
- Is formatting clean and readable?
- Are all required sections present?

**Improvement Suggestions**:
- What could be enhanced or clarified?
- What's missing or misrepresented?
- How could this be more valuable for the research?

Provide specific corrections and enhancements needed.
```

## Usage Guidelines

### Prompt Optimization Tips
1. **Specific Context**: Always include the research topic and source type
2. **Clear Constraints**: Specify output format, length, and structure requirements
3. **Quality Standards**: Include criteria for evaluation and selection
4. **Error Handling**: Plan for edge cases and recovery scenarios
5. **Consistency**: Maintain uniform terminology and formatting across all prompts

### Integration Points
- Use these prompts in the content processing pipeline
- Integrate with the collector modules for immediate analysis
- Apply quality assessment prompts before Notion integration
- Use synthesis prompts for topic summary generation

### Customization
- Adapt terminology to match your specific research interests
- Modify scoring criteria based on your quality standards
- Add platform-specific considerations for different source types
- Include your preferred formatting and structure preferences