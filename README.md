# 📡 RepoRadar

**Weekly curated list of trending GitHub repositories for AI, agents, and developer tools.**

RepoRadar automatically scans GitHub every week to find the hottest new repositories in AI agents, autonomous systems, LLMs, and developer tools. Get a weekly digest of what's trending in the AI/agent ecosystem.

## 🌟 Features

- **Weekly Updates**: Automatically fetches trending repos every Sunday
- **Smart Scoring**: Repositories ranked by stars, activity, and relevance
- **Categorization**: Auto-categorizes repos (Framework, AI Assistant, Multi-Agent System, etc.)
- **Archive**: Historical data of past trending repos
- **Clean UI**: Simple, fast, mobile-friendly interface

## 🎯 Focus Areas

- AI Agents & Autonomous Systems
- LLM Tools & Frameworks
- Multi-Agent Systems
- AI Assistants
- Developer Tools
- Agentic Workflows

## 🚀 How It Works

1. **Search**: Scans GitHub using topics and keywords related to AI agents
2. **Filter**: Filters for repos with 100+ stars created in the last 90 days
3. **Score**: Ranks by stars (logarithmic), activity, documentation, and relevance
4. **Publish**: Updates the site weekly with top trending repos

## 📊 Scoring Algorithm

Repositories are scored based on:
- **Stars**: Logarithmic scale to avoid huge numbers dominating
- **Recent Activity**: Bonus for updates within last 7-30 days
- **Engagement**: Watchers and forks count
- **Documentation**: Quality description and homepage
- **Keywords**: Relevance to AI/agents/automation

## 🛠️ Tech Stack

- **Scraper**: Node.js script using GitHub API
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Automation**: GitHub Actions (weekly cron job)
- **Hosting**: GitHub Pages

## 📅 Update Schedule

- **Frequency**: Weekly (every Sunday)
- **Time**: 12:00 PM UTC (7:00 AM EST)
- **Trigger**: Automatic via GitHub Actions

## 🔧 Local Development

```bash
# Install dependencies (none required - vanilla JS!)
npm install

# Fetch repositories manually
node fetch-repos.js

# Serve locally
# Open index.html in browser
```

## 📝 Data Format

### latest-repos.json
```json
{
  "date": "2026-03-15",
  "repository": {
    "name": "repo-name",
    "fullName": "owner/repo-name",
    "description": "...",
    "stars": 10000,
    "url": "https://github.com/...",
    "score": 45
  },
  "analysis": {
    "category": "Framework",
    "useCase": "Build custom AI agents",
    "technicalHighlights": [...]
  },
  "alternates": [...]
}
```

## 🌐 Live Site

Visit: [Your GitHub Pages URL]

## 🤝 Contributing

This is an automated project, but suggestions for search queries or scoring improvements are welcome!

## 📜 License

MIT

---

**Built with ❤️ for the AI agent community**
