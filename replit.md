# BuyMind Research - Academic Research Assistant

## Overview

BuyMind Research is an AI-powered academic research assistant that combines OpenAlex's scholarly paper database with Claude's natural language processing. Every question immediately searches OpenAlex for relevant academic papers, fetches their content, and generates comprehensive answers with proper citations backed by real research.

The system is designed as a single-page dashboard application with a focus on transparency - every action, search, and decision is logged in real-time so users can understand exactly how the AI agent operates. All answers are grounded in academic research with clickable citations linking directly to the source papers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript via Vite
- TanStack Query for server state management
- Wouter for client-side routing
- Tailwind CSS with shadcn/ui component library (New York style)
- Custom design system based on Linear's precision, Notion's clarity, and Material Design principles

**Component Structure:**
- Single-page dashboard with 3-column adaptive grid layout
- Left panel (25%): Question input (AskBox) and search results (LibraryPanel)
- Center panel (50%): Primary answer display (AnswerPane)
- Right panel (25%): Real-time activity log stream (LogStream)
- Responsive breakpoints collapse to 2-column (tablet) and single-column (mobile)

**Design Philosophy:**
- System-based design with emphasis on data density and readability
- Inter font for UI, JetBrains Mono for technical content
- Consistent spacing using Tailwind scale (2, 3, 4, 6, 8, 12 units)
- Custom CSS variables for theme system with light/dark mode support

### Backend Architecture

**Technology Stack:**
- Node.js with Express
- TypeScript with ES modules
- Drizzle ORM with PostgreSQL (Neon serverless)
- Anthropic Claude Sonnet 4 for all LLM operations

**Service Layer Design:**

**LLM Service (`server/services/llm/`):**
- Dedicated Claude integration with no OpenAI fallback
- Uses `claude-sonnet-4-20250514` model exclusively
- Structured prompt system with separate system/user prompts
- JSON-only response parsing for consistent data structures
- Retry logic with configurable attempts

**OpenAlex Service (`server/services/openalex.ts`):**
- Polite API usage with mailto parameter
- Work search endpoint for query-based discovery
- Individual work fetch for detailed paper retrieval
- Abstract reconstruction from inverted index format
- Normalized data structure for all papers

**Ranking Service (`server/services/ranker.ts`):**
- TF-IDF based relevance scoring using natural library
- Ranks papers against user query
- Returns scored works sorted by relevance

**Always-Search Answer Pipeline:**
1. Log submitted question to activity stream with 📝 emoji
2. Extract 3-5 key academic search terms using Claude (with fallback to full question)
3. Search OpenAlex using extracted keywords for better results
4. Rank papers by TF-IDF relevance to original query
5. Fetch top 6 papers with full details (title, abstract, URL)
6. Generate answer using Claude with paper context
7. Return research-backed answer with clickable citations
8. Display confidence score based on academic paper analysis

### Database Schema

**PostgreSQL Tables (Drizzle ORM):**

**QA Table (`qaTable`):**
- Stores complete question-answer lifecycle
- Tracks research confidence score (post_conf)
- Includes citations array with paper metadata (title, URL)
- Records which OpenAlex paper IDs were analyzed
- Timestamps for historical tracking
- pre_conf always 0 (no local attempt phase)

**Log Table (`logTable`):**
- Real-time activity logging (info/success/error/warn levels)
- Metadata storage for structured log data
- Chronological ordering for UI display
- Supports up to 200 most recent logs

**Cache Table (`cacheTable`):**
- Key-value storage for API responses
- TTL-based expiration
- Reduces redundant OpenAlex API calls
- JSON value storage for flexibility

**Architectural Decision - Keyword Extraction:**
- **Problem:** Complex questions (200+ chars) return 0 results from OpenAlex search
- **Solution:** Use Claude to extract 3-5 key academic terms before searching
- **Rationale:** OpenAlex works better with focused keyword queries than full sentences
- **Trade-off:** Additional LLM call vs. dramatically improved search results
- **Safety:** Falls back to full question if extraction fails or returns invalid format

**Architectural Decision - Caching:**
- **Problem:** OpenAlex API rate limits and response times
- **Solution:** TTL-based cache with 2-hour default for work details, 1-hour for searches
- **Rationale:** Academic papers don't change frequently; cache reduces latency and API load
- **Trade-off:** Slight staleness vs. significant performance gain

### API Structure

**RESTful Endpoints:**

- `POST /api/ask` - Main question endpoint, orchestrates entire pipeline
- `POST /api/search-openalex` - Direct OpenAlex search interface
- `POST /api/fetch-openalex` - Bulk paper fetching by IDs
- `POST /api/answer` - Generate answer from provided passages
- `GET /api/logs` - Retrieve activity log stream

**Request/Response Patterns:**
- Zod schema validation for all inputs
- Consistent error handling with structured responses
- JSON-only API communication
- CORS enabled for development flexibility

### Authentication & Session Management

Currently implements basic CORS and helmet security headers. No user authentication is present - the application is designed as a single-user research tool. Future implementations may add session-based authentication if multi-user support is required.

## External Dependencies

### Third-Party APIs

**OpenAlex API:**
- Primary data source for academic papers
- Base URL: `https://api.openalex.org`
- No authentication required, uses polite `mailto` parameter
- Rate limits: Respectful polling with 8-second timeout
- Search and individual work fetch endpoints

**Anthropic Claude API:**
- Model: `claude-sonnet-4-20250514` (latest Sonnet)
- All natural language understanding and generation
- Structured JSON responses with strict validation
- 2048 token max output
- Requires `ANTHROPIC_API_KEY` environment variable

### Database

**Neon Serverless PostgreSQL:**
- WebSocket-based connection pooling
- Drizzle ORM for type-safe queries
- Schema migrations via `drizzle-kit`
- Requires `DATABASE_URL` environment variable

### Key NPM Dependencies

**Backend:**
- `@anthropic-ai/sdk` - Claude API client
- `@neondatabase/serverless` - Postgres driver
- `drizzle-orm` - Type-safe ORM
- `natural` - NLP library for TF-IDF ranking
- `express` - Web framework
- `helmet` - Security headers
- `cors` - Cross-origin resource sharing

**Frontend:**
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Headless UI primitives (20+ components)
- `wouter` - Lightweight routing
- `tailwindcss` - Utility-first CSS
- `date-fns` - Date formatting
- `axios` - HTTP client
- `zod` - Schema validation

### Build & Development Tools

- Vite - Frontend build tool and dev server
- TypeScript - Type safety across stack
- esbuild - Backend bundling for production
- PostCSS with Autoprefixer - CSS processing
- Replit-specific plugins for development environment integration