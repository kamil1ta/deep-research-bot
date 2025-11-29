# Deep Research Bot - Workflow Diagram

## 🔄 Complete Workflow Flow

```mermaid
graph TD
    A[User Input: Research Topic] --> B[CLI Command: npm run start -- research "topic"]
    B --> C[Configuration Validation]
    C --> D[Initialize Services]

    D --> E[Notion Client]
    D --> F[AI Service]
    D --> G[Collectors]
    D --> H[Cache Service]

    C --> I[Search Strategy Generation]
    I --> J[Multi-Platform Search Queries]

    J --> K[Twitter Collector]
    J --> L[Reddit Collector]
    J --> M[Article Collector]
    J --> N[Web Scraper]

    K --> O[Tweets Analysis]
    L --> P[Posts/Comments Analysis]
    M --> Q[Article Content Extraction]
    N --> R[Web Content Extraction]

    O --> S[Source Objects]
    P --> S
    Q --> S
    R --> S

    S --> T[Caching Layer]
    T --> U[AI Content Analysis]

    U --> V[Content Summarization]
    U --> W[Relevance Scoring]
    U --> X[Insight Extraction]
    U --> Y[Connection Mapping]

    V --> Z[Analyzed Sources]
    W --> Z
    X --> Z
    Y --> Z

    Z --> AA[Research Synthesis]
    AA --> BB[Core Themes Identification]
    AA --> CC[Key Insights Generation]
    AA --> DD[Contradictions Analysis]
    AA --> EE[Knowledge Gaps Detection]

    BB --> FF[Research Summary]
    CC --> FF
    DD --> FF
    EE --> FF

    FF --> GG[Notion Database Creation]
    Z --> HH[Individual Source Pages]

    GG --> II[Database Structure Setup]
    HH --> JJ[Page Generation]

    II --> KK[Properties & Fields]
    JJ --> LL[Content Blocks & Formatting]

    KK --> MM[Database Upload]
    LL --> MM
    MM --> NN[Final Notion Database]

    NN --> OO[User Review in Notion]
    OO --> PP[Thinkpiece Writing]

    style A fill:#e1f5fe
    style PP fill:#c8e6c9
    style NN fill:#fff3e0
    style Z fill:#f3e5f5
```

## 📋 Detailed Phase Breakdown

### Phase 1: Initialization
```mermaid
graph LR
    A[CLI Command] --> B[Config Validation]
    B --> C[Service Setup]
    C --> D[Notion Client]
    C --> E[AI Service]
    C --> F[Collectors]
    C --> G[Cache Service]

    style A fill:#e3f2fd
    style D fill:#e8f5e8
    style E fill:#fff3e0
```

### Phase 2: Data Collection
```mermaid
graph TD
    A[Generate Search Queries] --> B[Platform-Specific Collectors]
    B --> C[Twitter API v2]
    B --> D[Reddit API]
    B --> E[RSS Feeds]
    B --> F[Web Scraping]

    C --> G[Tweets]
    D --> H[Posts & Comments]
    E --> I[Articles]
    F --> J[Web Content]

    G --> K[Source Objects]
    H --> K
    I --> K
    J --> K

    style A fill:#e1f5fe
    style K fill:#f3e5f5
```

### Phase 3: AI Processing
```mermaid
graph LR
    A[Raw Sources] --> B[Content Analysis]
    B --> C[Summarization]
    B --> D[Relevance Scoring]
    B --> E[Insight Extraction]
    B --> F[Connection Mapping]

    C --> G[Analyzed Sources]
    D --> G
    E --> G
    F --> G

    G --> H[Research Synthesis]
    H --> I[Core Themes]
    H --> J[Key Insights]
    H --> K[Contradictions]
    H --> L[Knowledge Gaps]

    I --> M[Final Summary]
    J --> M
    K --> M
    L --> M

    style A fill:#fff3e0
    style M fill:#c8e6c9
```

### Phase 4: Notion Integration
```mermaid
graph TD
    A[Research Data] --> B[Database Creation]
    A --> C[Source Page Generation]
    A --> D[Summary Page Creation]

    B --> E[Database Properties]
    B --> F[Field Configuration]

    C --> G[Individual Pages]
    C --> H[Content Blocks]

    D --> I[Summary Structure]
    D --> J[Theme Organization]

    E --> K[Final Database]
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K

    style A fill:#e8f5e8
    style K fill:#fff3e0
```

## 🔄 Data Flow Pipeline

```mermaid
sequenceDiagram
    participant U as User
    participant CLI as CLI Interface
    participant C as Collectors
    participant AI as AI Service
    participant N as Notion Client
    participant Cache as Cache Service

    U->>CLI: research "topic"
    CLI->>Cache: Check existing research
    CLI->>C: Collect from multiple sources
    C->>Cache: Store raw sources

    loop Multiple Platforms
        C->>Twitter API: Search tweets
        C->>Reddit API: Search posts
        C->>RSS Feeds: Get articles
        C->>Web: Scrape content
    end

    C->>AI: Analyze collected sources
    AI->>AI: Summarize, score, extract insights
    AI->>CLI: Return analyzed data

    CLI->>AI: Synthesize research summary
    AI->>CLI: Return themes & insights

    CLI->>N: Create database
    CLI->>N: Create source pages
    CLI->>N: Create summary page

    N->>U: Research ready in Notion
```

## 🎯 Core Components Architecture

```mermaid
graph TB
    subgraph "CLI Layer"
        A[Commander.js Interface]
        B[Configuration Management]
        C[Argument Parsing]
    end

    subgraph "Service Layer"
        D[Notion Client]
        E[AI Service]
        F[Cache Service]
        G[Logger Service]
    end

    subgraph "Collection Layer"
        H[Base Collector]
        I[Twitter Collector]
        J[Reddit Collector]
        K[Article Collector]
    end

    subgraph "Data Layer"
        L[TypeScript Types]
        M[Configuration Files]
        N[SQLite Cache]
        O[Environment Variables]
    end

    A --> D
    A --> E
    A --> I
    A --> J
    A --> K

    H --> I
    H --> J
    H --> K

    I --> F
    J --> F
    K --> F

    E --> L
    D --> L

    B --> M
    B --> O

    F --> N

    style A fill:#e3f2fd
    style E fill:#fff3e0
    style D fill:#e8f5e8
    style F fill:#fce4ec
```

## ⚡ Processing Pipeline

```mermaid
graph LR
    A[Input Topic] --> B[Query Generation]
    B --> C[Parallel Collection]
    C --> D[Rate Limited Requests]
    D --> E[Content Extraction]
    E --> F[AI Analysis]
    F --> G[Quality Filtering]
    G --> H[Relevance Ranking]
    H --> I[Research Synthesis]
    I --> J[Notion Upload]
    J --> K[Database Ready]

    style A fill:#e1f5fe
    style F fill:#fff3e0
    style K fill:#c8e6c9
```

## 🎪 Error Handling Flow

```mermaid
graph TD
    A[API Request] --> B{Success?}
    B -->|Yes| C[Process Data]
    B -->|No| D{Rate Limit?}

    D -->|Yes| E[Exponential Backoff]
    D -->|No| F{Auth Error?}

    F -->|Yes| G[Refresh Token]
    F -->|No| H{Server Error?}

    H -->|Yes| I[Retry Limited Times]
    H -->|No| J[Skip Source]

    E --> A
    G --> A
    I --> A
    J --> K[Continue with Other Sources]

    C --> L[Success Path]
    K --> L

    style A fill:#e3f2fd
    style L fill:#c8e6c9
    style J fill:#ffcdd2
```

This workflow shows how the bot transforms a simple topic request into a comprehensive, AI-analyzed research database in Notion - automating hours of manual research work into minutes of automated processing.