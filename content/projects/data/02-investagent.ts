import { Project } from "../types"

export const investagent: Project = {
  id: "investagent",
  order: 2,
  name: "InvestAgent",
  tagline: "A multi-agent, tool-using hedge fund simulator built with LangGraph and free LLMs",
  repoUrl: "https://github.com/harineek24/investagent",
  techStack: [
    "Python",
    "LangChain",
    "LangGraph",
    "Groq (Llama 3.1 / 3.3)",
    "Google Gemini",
    "Ollama",
    "OpenAI (optional)",
    "yfinance",
    "SEC EDGAR API",
    "SQLite",
    "Streamlit",
    "MCP (Model Context Protocol)",
    "pandas / numpy",
    "Rich (CLI display)",
  ],
  highLevelSummary: [
    {
      line: "InvestAgent is a multi-agent hedge fund simulator where each analyst is a ___ agent that autonomously decides which financial tools to call instead of following a hardcoded scoring formula.",
      answer: "ReAct",
    },
    {
      line: "It runs six specialized analysts — value, growth, contrarian, technical, fundamental, and sentiment — and routes their signals through a portfolio manager that decides to ___, sell, or hold.",
      answer: "buy",
    },
    {
      line: "The whole thing is built on ___ so the workflow graph can branch dynamically, triggering a debate step only when the analysts actually disagree.",
      answer: "LangGraph",
    },
    {
      line: "It's designed to run at zero cost by defaulting to the free tier of ___ for the underlying language model.",
      answer: "Groq",
    },
  ],
  workflowSummary: [
    {
      line: "It starts with the user passing in a list of stock tickers, like AAPL or MSFT, on the command line or through the ___ dashboard.",
      answer: "Streamlit",
    },
    {
      line: "Each of the six analyst agents then runs a Think-Act-Observe loop, autonomously choosing to call tools like get_financial_metrics or get_prices rather than following a fixed sequence, capped at ___ tool calls per agent per ticker to stay within free API rate limits.",
      answer: "four",
    },
    {
      line: "Price data and fundamentals come from ___, a free Python library that wraps Yahoo Finance, while structured filing data like revenue and net income comes from the SEC EDGAR API.",
      answer: "yfinance",
    },
    {
      line: "Once every analyst has produced a bullish, neutral, or bearish signal, an Agreement Check node measures consensus and only routes to a debate step if fewer than ___ percent of analysts agree.",
      answer: "60",
    },
    {
      line: "During the debate, an LLM moderator reads each analyst's reasoning and weighs it against that analyst's historical accuracy, which is pulled from a ___ database that persists every past decision.",
      answer: "SQLite",
    },
    {
      line: "After the debate, a Risk Manager node enforces position-sizing limits before handing off to the Portfolio Manager, which is itself a multi-turn ___ agent that can call more tools if it needs additional data before deciding.",
      answer: "ReAct",
    },
    {
      line: "To keep costs at zero while still getting good reasoning where it matters, the system uses model routing so analysts run on a fast model while the debate and portfolio manager steps use a smarter model, both served through ___'s free tier.",
      answer: "Groq",
    },
    {
      line: "The final BUY, SELL, or HOLD decision for each ticker is written back into the memory database so future debates and the portfolio manager can weight signals by each agent's track record, and a separate backtester module can replay this whole pipeline historically to evaluate ___ performance.",
      answer: "portfolio",
    },
  ],
  technicalQuestions: [
    {
      question: "Why call this 'agentic' rather than just a GenAI wrapper around stock data?",
      answer:
        "Because the control flow is not fixed. Each analyst is a ReAct loop that decides for itself which tools to call and when to stop, the LangGraph workflow conditionally branches into a debate step only when analysts disagree, and the Portfolio Manager can call additional tools mid-decision instead of consuming a single pre-built prompt. A traditional GenAI wrapper would hardcode calls like get_prices() and feed them into one LLM call.",
    },
    {
      question: "How does the debate mechanism decide when to trigger?",
      answer:
        "An Agreement Check node looks at all non-PM, non-risk-manager analyst signals per ticker, takes the majority signal's share of votes, and averages that across tickers into an agreement score. If that score drops below a 0.6 threshold, the LangGraph conditional edge routes to the Debate node instead of straight to the Risk Manager; otherwise it skips debate entirely to save tokens.",
    },
    {
      question: "How does agent memory influence future decisions?",
      answer:
        "Every decision (agent, ticker, signal, confidence, price) gets written to a SQLite database. A separate agent_scores table records whether each signal was later correct, and get_all_agent_accuracies() computes per-agent hit rates. The debate moderator and Portfolio Manager are given those accuracy numbers in their prompts so an analyst that's been right 90% of the time is explicitly weighted more heavily than one at 40%.",
    },
    {
      question: "What LLM providers does it support, and why default to Groq?",
      answer:
        "It supports Groq, Google Gemini, local Ollama models, and OpenAI, all behind a common get_llm() factory in utils/llm.py. Groq is the default because it offers a genuinely free tier with fast Llama models (llama-3.1-8b-instant for analysts, llama-3.3-70b-versatile for the smarter debate/PM steps), which lets the whole simulator run at $0 while keeping the more reasoning-heavy steps on a larger model.",
    },
    {
      question: "How do you avoid blowing through free-tier rate limits with six parallel agents each making tool calls?",
      answer:
        "Each ReAct loop is hard-capped at 4 tool calls (MAX_ITERATIONS), the Portfolio Manager is capped at 3, and tiering puts the cheaper, smaller model on the six analysts while reserving the larger model for the comparatively rare debate and PM steps. There's also a data-driven fallback (_data_fallback) that computes a rule-based signal from P/E, ROE, revenue growth, and price return if the LLM call errors out (e.g., rate limited), so a single failed call doesn't zero out an agent's signal.",
    },
    {
      question: "What data sources feed the analysts, and how is that data kept manageable for the LLM context?",
      answer:
        "Price/volume data and most financial metrics come from yfinance; SEC EDGAR provides structured XBRL filings (sec_edgar.py) for official revenue, net income, and filing dates. Raw price DataFrames are never dumped straight into the prompt — _summarize_prices() condenses them into a small JSON object (latest close, period return, EMAs, RSI, volatility, last 5 closes) so each tool call stays cheap in tokens.",
    },
    {
      question: "How does the Portfolio Manager differ from the six analyst agents?",
      answer:
        "It's also a ReAct-style agent, but multi-turn and using the 'smart' model tier instead of 'fast'. Rather than producing an independent bullish/neutral/bearish signal, it reviews all analyst signals plus the debate synthesis (if one ran), can call the same data tools again if it decides it needs more information, and only then emits a final BUY/SELL/HOLD action with quantity, which the Risk Manager has already bounded with position limits.",
    },
    {
      question: "Is there a way to evaluate whether the system's decisions are actually good?",
      answer:
        "Yes — backtester.py replays the full LangGraph workflow over historical date ranges and tracks portfolio value over time, and the memory layer records price_after_30d and an outcome field per decision so agent accuracy can be computed retroactively. That said, the README is explicit that this is for educational and research purposes only, not validated investment advice.",
    },
  ],
}
