# Deep Research Bot - Workflow Diagram (Mermaid)

## 🔄 Complete Bot Workflow

```mermaid
graph TD
    A[User: "npm run start -- research 'AI ethics'"] --> B[Config Validation]
    B --> C[Initialize Services]

    C --> D[Generate Search Queries]
    D --> E{Multi-Platform Collection}

    E --> F[Twitter API]
    E --> G[Reddit API]
    E --> H[RSS Feeds]
    E --> I[Web Scraping]

    F --> J[Tweets & Expert Opinions]
    G --> K[Discussions & Comments]
    H --> L[Tech Blog Articles]
    I --> M[Web Content]

    J --> N[Raw Sources Pool]
    K --> N
    L --> N
    M --> N

    N --> O[AI Content Analysis]
    O --> P[Summarize & Score Relevance]
    P --> Q[Extract Key Insights]
    Q --> R[Find Connections Between Sources]

    R --> S[Research Synthesis]
    S --> T[Identify Core Themes]
    S --> U[Detect Contradictions]
    S --> V[Find Knowledge Gaps]

    T --> W[Research Summary]
    U --> W
    V --> W

    W --> X[Create Notion Database]
    X --> Y[Generate Source Pages]
    X --> Z[Create Summary Page]

    Y --> AA[Structured Research in Notion]
    Z --> AA
    AA --> BB[Ready for Thinkpiece Writing]

    style A fill:#e1f5fe
    style O fill:#fff3e0
    style S fill:#c8e6c9
    style X fill:#e8f5e8
    style AA fill:#fff3e0
    style BB fill:#e1f5fe
```

## 📋 Phase Breakdown

### Phase 1: Setup & Collection
```mermaid
graph LR
    A[CLI Command] --> B[Validate API Keys]
    B --> C[Setup Notion Client]
    B --> D[Setup AI Service]
    B --> E[Initialize Collectors]

    E --> F[Twitter Collector]
    E --> G[Reddit Collector]
    E --> H[Article Collector]

    F --> I[Collect Expert Tweets]
    G --> J[Collect Discussions]
    H --> K[Collect Articles]

    I --> L[Cache Results]
    J --> L
    K --> L

    style A fill:#e3f2fd
    style L fill:#fff3e0
```

### Phase 2: AI Processing Pipeline
```mermaid
graph TD
    A[Raw Content Sources] --> B[AI Analysis Engine]

    B --> C[Content Summarization]
    B --> D[Relevance Scoring 1-10]
    B --> E[Credibility Assessment]
    B --> F[Key Quote Extraction]

    C --> G[Analyzed Sources]
    D --> G
    E --> G
    F --> G

    G --> H[Cross-Source Analysis]
    H --> I[Find Themes & Patterns]
    H --> J[Identify Contradictions]
    H --> K[Map Connections]

    I --> L[Research Synthesis]
    J --> L
    K --> L

    L --> M[Core Themes]
    L --> N[Key Insights]
    L --> O[Story Angles]

    style A fill:#f3e5f5
    style B fill:#fff3e0
    style G fill:#e8f5e8
    style L fill:#c8e6c9
```

### Phase 3: Notion Integration
```mermaid
graph TB
    A[Analyzed Research Data] --> B[Create Topic Database]

    B --> C[Database Properties]
    C --> D[Source Type Field]
    C --> E[Relevance Score Field]
    C --> F[Credibility Level Field]
    C --> G[URL & Metadata Fields]

    B --> H[Generate Source Pages]
    H --> I[Page 1: Tweet by Expert]
    H --> J[Page 2: Reddit Discussion]
    H --> K[Page 3: Tech Article]
    H --> L[... N more pages]

    B --> M[Create Summary Page]
    M --> N[Core Themes Section]
    M --> O[Key Insights Section]
    M --> P[Contradictions Section]
    M --> Q[Knowledge Gaps Section]

    I --> R[Complete Research Database]
    J --> R
    K --> R
    L --> R
    N --> R
    O --> R
    P --> R
    Q --> R

    style A fill:#e3f2fd
    style B fill:#e8f5e8
    style R fill:#fff3e0
```

## ⚡ Data Flow Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant CLI as CLI Interface
    participant T as Twitter
    participant R as Reddit
    participant A as AI Service
    participant N as Notion
    participant C as Cache

    U->>CLI: research "AI ethics"
    CLI->>C: Check cache for existing research

    par Parallel Collection
        CLI->>T: Search for AI ethics tweets
        T-->>CLI: Expert opinions & insights
    and
        CLI->>R: Search AI ethics discussions
        R-->>CLI: Community discussions
    end

    CLI->>C: Store raw sources

    loop Each Source
        CLI->>A: Analyze content
        A-->>CLI: Summary + relevance score
    end

    CLI->>A: Synthesize all sources
    A-->>CLI: Themes, insights, contradictions

    CLI->>N: Create research database
    CLI->>N: Add individual source pages
    CLI->>N: Create summary page

    N-->>U: Research ready in Notion workspace
```

## 🎯 Core Architecture Components

```mermaid
graph TB
    subgraph "Input Layer"
        A[CLI Command]
        B[Research Topic]
        C[Configuration Options]
    end

    subgraph "Collection Layer"
        D[Base Collector]
        E[Twitter Collector]
        F[Reddit Collector]
        G[Article Collector]
    end

    subgraph "Processing Layer"
        H[AI Analysis Service]
        I[Content Summarizer]
        J[Relevance Scorer]
        K[Insight Extractor]
    end

    subgraph "Storage Layer"
        L[Cache Service]
        M[SQLite Database]
        N[Research Results]
    end

    subgraph "Output Layer"
        O[Notion Client]
        P[Database Creator]
        Q[Page Generator]
        R[Structured Research]
    end

    A --> D
    E --> H
    F --> H
    G --> H
    H --> L
    L --> O
    O --> R

    style A fill:#e3f2fd
    style H fill:#fff3e0
    style L fill:#fce4ec
    style O fill:#e8f5e8
    style R fill:#c8e6c9
```

## 🔍 Error Handling Flow

```mermaid
graph TD
    A[API Request] --> B{Success?}
    B -->|Yes| C[Process Data]
    B -->|No| D{Rate Limited?}

    D -->|Yes| E[Exponential Backoff]
    D -->|No| F{Auth Error?}

    F -->|Yes| G[Refresh Token]
    F -->|No| H{Server Error?}

    H -->|Yes| I[Retry 3 Times]
    H -->|No| J[Skip Source]

    E --> A
    G --> A
    I --> A

    C --> K[Continue Pipeline]
    J --> K

    style A fill:#e3f2fd
    style K fill:#c8e6c9
    style J fill:#ffcdd2
```

## 📊 Output Structure Example

```mermaid
graph TD
    A[User's Notion Workspace] --> B[Research Database: "AI Ethics"]

    B --> C[Source Page 1]
    C --> D["🐦 Tweet: @tech_expert<br/><strong>TL;DR:</strong> AI bias is systemic<br/><strong>Score:</strong> 9/10<br/><strong>Key Quote:</strong> "We build bias into systems..."]

    B --> E[Source Page 2]
    E --> F["🤖 Reddit: r/technology<br/><strong>TL;DR:</strong> Community discusses AI accountability<br/><strong>Score:</strong> 7/10<br/><strong>Key Quote:</strong> "Who watches the watchers?"]

    B --> G[Source Page 3]
    G --> H["📄 Article: TechCrunch<br/><strong>TL;DR:</strong> Industry perspective on AI regulation<br/><strong>Score:</strong> 8/10<br/><strong>Key Quote:</strong> "Balance innovation and safety..."]

    B --> I[📊 Research Summary Page]
    I --> J["<strong>Core Themes:</strong> Bias, Accountability, Regulation<br/><strong>Key Insights:</strong> 5 major findings<br/><strong>Contradictions:</strong> Innovation vs Safety<br/><strong>Story Angles:</strong> 3 potential narratives"]

    style A fill:#e1f5fe
    style B fill:#e8f5e8
    style I fill:#fff3e0
```

## ⚡ Performance Optimizations

```mermaid
graph LR
    A[Request] --> B{In Cache?}
    B -->|Yes| C[Return Cached Result]
    B -->|No| D[Make API Call]

    D --> E[Store in Cache]
    E --> F[Return Result]

    C --> G[Skip Rate Limiting]
    F --> H[Apply Rate Limiting]

    H --> I[Wait 1-60 seconds]
    I --> J[Next Request]

    G --> K[Continue Pipeline]
    J --> K

    style A fill:#e3f2fd
    style C fill:#c8e6c9
    style H fill:#fff3e0
    style K fill:#e1f5fe
```

This workflow shows how the bot transforms a simple research topic into a comprehensive, AI-analyzed database in Notion - essentially automating hours of manual research into minutes of processing!