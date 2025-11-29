# Deep Research Bot - TLDR

## 🎯 What It Does
Automatically researches any topic by gathering content from multiple sources and organizing it in Notion databases.

## 🔍 How It Works

1. **Input**: You provide a topic (e.g., "AI ethics")
2. **Collect**: Bot searches Twitter, Reddit, blogs, articles, RSS feeds
3. **Analyze**: AI summarizes content, scores relevance, extracts insights
4. **Organize**: Creates structured Notion database with:
   - Individual source pages (URL, summary, quotes, connections)
   - Topic summary page (themes, insights, contradictions)
5. **Output**: Ready-to-use research database in your Notion workspace

## ⚡ Key Features
- **Multi-platform**: Twitter, Reddit, tech blogs, articles, web scraping
- **AI-powered**: Smart content analysis and summarization
- **Notion integration**: Automatic database and page creation
- **Rate limiting**: Respectful API usage
- **Caching**: Fast research on similar topics

## 🚀 Quick Start
```bash
npm run init-config    # Setup API keys
# Edit config/.env with your tokens
npm run start -- research "your topic"
```

## 📊 Output Structure
```
Your Notion Workspace
└── Research Database: "Your Topic"
    ├── Source Page 1: Tweet by @expert
    ├── Source Page 2: Reddit discussion
    ├── Source Page 3: TechCrunch article
    ├── ...
    └── Summary Page: Key insights and themes
```

**Result**: Hours of manual research done in minutes, organized perfectly for your thinkpiece writing.