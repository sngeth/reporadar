const https = require('https');
const fs = require('fs');

// GitHub API configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Topics to search for trending repositories
const TOPICS = [
  'ai-agents',
  'llm',
  'artificial-intelligence',
  'autonomous-agents',
  'agentic-ai',
  'ai-assistant',
  'langchain',
  'autogpt',
  'claude',
  'openai'
];

// Additional keywords for searching
const SEARCH_QUERIES = [
  'ai agent framework',
  'autonomous ai',
  'llm agent',
  'ai assistant framework',
  'agentic workflow',
  'ai swarm',
  'multi-agent system'
];

function searchGitHub(query, perPage = 10) {
  return new Promise((resolve, reject) => {
    // Search for repositories created in the last 90 days that are trending
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const sinceDate = since.toISOString().split('T')[0];

    const searchQuery = encodeURIComponent(`${query} created:>${sinceDate} stars:>100`);
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/search/repositories?q=${searchQuery}&sort=stars&order=desc&per_page=${perPage}`,
      method: 'GET',
      headers: {
        'User-Agent': 'RepoRadar',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    if (GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.items) {
            resolve(result.items);
          } else {
            reject(new Error('No items in response'));
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function fetchTrendingRepos() {
  console.log('🔍 Searching for trending AI repositories...\n');

  const allRepos = new Map();

  // Search by topics
  for (const topic of TOPICS) {
    try {
      console.log(`Searching topic: ${topic}...`);
      const repos = await searchGitHub(`topic:${topic}`, 5);
      repos.forEach(repo => {
        if (!allRepos.has(repo.full_name)) {
          allRepos.set(repo.full_name, repo);
        }
      });
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Error searching ${topic}:`, err.message);
    }
  }

  // Search by keywords
  for (const query of SEARCH_QUERIES) {
    try {
      console.log(`Searching: "${query}"...`);
      const repos = await searchGitHub(query, 5);
      repos.forEach(repo => {
        if (!allRepos.has(repo.full_name)) {
          allRepos.set(repo.full_name, repo);
        }
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Error searching "${query}":`, err.message);
    }
  }

  console.log(`\n📊 Found ${allRepos.size} unique repositories\n`);

  // Convert to array and sort by stars
  const sortedRepos = Array.from(allRepos.values())
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 20); // Top 20

  return sortedRepos;
}

function scoreRepository(repo) {
  let score = 0;

  // Base score from stars (logarithmic to avoid huge numbers dominating)
  score += Math.log10(repo.stargazers_count + 1) * 10;

  // Bonus for recent activity
  const daysSinceUpdate = (Date.now() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate <= 7) score += 5;
  else if (daysSinceUpdate <= 30) score += 3;

  // Bonus for high activity (watchers, forks)
  score += Math.log10(repo.watchers_count + 1) * 2;
  score += Math.log10(repo.forks_count + 1) * 2;

  // Bonus for good documentation
  if (repo.description && repo.description.length > 50) score += 2;
  if (repo.homepage) score += 1;

  // Bonus for specific AI/agent keywords in description
  const desc = (repo.description || '').toLowerCase();
  const keywords = ['agent', 'autonomous', 'llm', 'ai assistant', 'framework', 'swarm', 'multi-agent'];
  keywords.forEach(kw => {
    if (desc.includes(kw)) score += 1;
  });

  return Math.round(score);
}

function formatRepo(repo) {
  return {
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner.login,
    description: repo.description || 'No description available',
    url: repo.html_url,
    homepage: repo.homepage,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.watchers_count,
    language: repo.language,
    topics: repo.topics || [],
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    license: repo.license?.name || 'No license',
    score: scoreRepository(repo)
  };
}

async function generateAnalysis(repo) {
  // For now, return a simple analysis
  // Later we can add Claude API integration for deeper analysis
  return {
    whatIsIt: repo.description,
    category: categorizeRepo(repo),
    useCase: generateUseCase(repo),
    technicalHighlights: extractTechnicalHighlights(repo)
  };
}

function categorizeRepo(repo) {
  const desc = (repo.description || '').toLowerCase();
  const topics = repo.topics || [];

  if (desc.includes('framework') || topics.includes('framework')) {
    return 'Framework';
  } else if (desc.includes('assistant') || desc.includes('companion')) {
    return 'AI Assistant';
  } else if (desc.includes('agent') && (desc.includes('swarm') || desc.includes('multi'))) {
    return 'Multi-Agent System';
  } else if (desc.includes('agent')) {
    return 'AI Agent';
  } else if (desc.includes('tool') || topics.includes('tools')) {
    return 'Developer Tool';
  } else if (desc.includes('llm') || topics.includes('llm')) {
    return 'LLM Tool';
  }

  return 'AI/ML Project';
}

function generateUseCase(repo) {
  const category = categorizeRepo(repo);
  const useCases = {
    'Framework': 'Build custom AI agents and agentic workflows',
    'AI Assistant': 'Personal productivity and assistance',
    'Multi-Agent System': 'Complex task orchestration with multiple agents',
    'AI Agent': 'Autonomous task execution and decision-making',
    'Developer Tool': 'Enhance development workflow with AI',
    'LLM Tool': 'Work with large language models',
    'AI/ML Project': 'AI/ML research and experimentation'
  };

  return useCases[category] || 'AI-powered automation';
}

function extractTechnicalHighlights(repo) {
  const highlights = [];
  const desc = (repo.description || '').toLowerCase();

  if (repo.language) highlights.push(`Written in ${repo.language}`);
  if (desc.includes('open source') || desc.includes('open-source')) highlights.push('Open source');
  if (desc.includes('self-hosted')) highlights.push('Self-hosted option available');
  if (desc.includes('real-time')) highlights.push('Real-time capabilities');
  if (repo.topics.includes('docker')) highlights.push('Docker support');
  if (repo.topics.includes('kubernetes')) highlights.push('Kubernetes support');
  if (desc.includes('api')) highlights.push('API available');

  return highlights.slice(0, 5);
}

async function main() {
  try {
    const repos = await fetchTrendingRepos();

    console.log('🏆 Top Trending Repositories:\n');
    repos.slice(0, 10).forEach((repo, i) => {
      console.log(`${i + 1}. ${repo.full_name} (${repo.stargazers_count.toLocaleString()} stars)`);
      console.log(`   ${repo.description || 'No description'}\n`);
    });

    // Format and enrich data
    const formattedRepos = repos.map(formatRepo);

    // Sort by score
    formattedRepos.sort((a, b) => b.score - a.score);

    // Select top repository
    const topRepo = formattedRepos[0];
    const analysis = await generateAnalysis(topRepo);

    // Save latest
    const latestData = {
      date: new Date().toISOString().split('T')[0],
      repository: topRepo,
      analysis: analysis,
      alternates: formattedRepos.slice(1, 10)
    };

    fs.writeFileSync('latest-repos.json', JSON.stringify(latestData, null, 2));
    console.log('\n✅ Saved to latest-repos.json');

    // Save to archive
    const archiveDir = 'archive';
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir);
    }

    const archiveFile = `${archiveDir}/${latestData.date}.json`;
    fs.writeFileSync(archiveFile, JSON.stringify(latestData, null, 2));
    console.log(`✅ Saved to ${archiveFile}`);

    // Update archive index
    const archiveFiles = fs.readdirSync(archiveDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();

    const archiveIndex = archiveFiles.map(file => {
      const data = JSON.parse(fs.readFileSync(`${archiveDir}/${file}`, 'utf8'));
      return {
        date: data.date,
        name: data.repository.fullName,
        stars: data.repository.stars,
        description: data.repository.description.substring(0, 150) + '...',
        url: `archive/${file}`
      };
    });

    fs.writeFileSync('archive-index.json', JSON.stringify(archiveIndex, null, 2));
    console.log('✅ Updated archive-index.json\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fetchTrendingRepos, formatRepo, generateAnalysis };
