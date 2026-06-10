import { Pattern } from "../../types"

export const agentsTools: Pattern = {
  id: "agents-tools",
  order: 6,
  patternName: "Agents & Tool Use",

  philosophy: {
    text: "Do your work, then step back. The only path to serenity.",
    source: "Tao Te Ching, Chapter 9 (Laozi)",
    connection:
      "An agent's loop is a discipline of bounded action: observe the situation, choose one skillful action from the tools available, act, then step back to observe the result before choosing again. The agent that tries to do everything in one giant leap — skipping observation, ignoring the boundary of its tools, refusing to step back and re-plan — overreaches and breaks. Skillful means (upaya) means matching the action to the moment: the right tool, called with the right arguments, at the right step, then releasing control back to observation. Restraint between actions is what keeps the loop from spiraling.",
  },

  template: {
    description:
      "A tool-calling agent is a loop, not a single call. The model proposes an action (a tool name plus arguments), the runtime executes it and returns an observation, and that observation becomes part of the context for the next decision. The loop terminates when the model decides it has enough information to answer directly. Each tool is just a function with a name, a schema, and a handler — the dispatch step maps the model's chosen name to that handler.",
    snippet: `tools = {
    "search": search_fn,
    "calculator": calculator_fn,
}

messages = [{"role": "user", "content": user_query}]
for step in range(MAX_STEPS):
    response = call_model(messages, tools=tools)
    if response.tool_call is None:
        return response.content  # model is done, final answer

    name, args = response.tool_call.name, response.tool_call.args
    observation = tools[name](**args)
    messages.append({"role": "assistant", "content": response.tool_call})
    messages.append({"role": "tool", "content": observation})
# loop exhausted without a final answer`,
  },

  pythonTools: [
    {
      name: "dict-based tool registry with dispatch",
      snippet: `TOOL_REGISTRY = {
    "search": search_fn,
    "get_weather": get_weather_fn,
}

def dispatch(name, args):
    if name not in TOOL_REGISTRY:
        return f"error: unknown tool '{name}'"
    return TOOL_REGISTRY[name](**args)`,
    },
    {
      name: "ReAct loop skeleton (think / act / observe)",
      snippet: `def react_loop(question, tools, max_steps=5):
    scratchpad = []
    for _ in range(max_steps):
        thought, action, action_input = think(question, scratchpad)
        if action == "finish":
            return action_input
        observation = tools[action](action_input)
        scratchpad.append((thought, action, action_input, observation))
    return "no answer found within step budget"`,
    },
    {
      name: "retry-with-backoff decorator for flaky tool calls",
      snippet: `import time
from functools import wraps

def retry_with_backoff(max_retries=3, base_delay=1):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return fn(*args, **kwargs)
                except Exception:
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(base_delay * 2 ** attempt)
        return wrapper
    return decorator`,
    },
  ],

  problems: [
    {
      id: "tool-call-dispatch",
      title: "Dispatch a Function Call from Model Output",
      difficulty: "easy",
      prompt:
        "The model returns a JSON object describing a tool call: {'name': str, 'arguments': dict}. Given a registry mapping tool names to callables, write a function that dispatches the call and returns the tool's result, or a clear error string if the tool name isn't registered.",
      patternKeywords: ["function calling", "dispatch", "registry", "error handling"],
      solution: `from typing import Any, Callable

def dispatch_tool_call(call: dict, registry: dict[str, Callable]) -> Any:
    name = call["name"]
    args = call.get("arguments", {})
    if name not in registry:
        return f"error: unknown tool '{name}'"
    try:
        return registry[name](**args)
    except TypeError as e:
        return f"error: bad arguments for '{name}': {e}"`,
      solutionExplanation: [
        "I pull `name = call[\"name\"]` directly with bracket indexing rather than `.get()` — the model's tool call response is a contract: `name` is a required field, and if it's missing that's a malformed response worth a loud KeyError, not a silent None. Arguments, by contrast, I read with `call.get(\"arguments\", {})` because a tool with no parameters might legitimately omit the key.",
        "The membership check `if name not in registry` happens before any call — this is the dispatch step itself. Returning a string error rather than raising lets the agent loop feed the error back to the model as an observation, so the model can recover by trying a different tool name on its next step.",
        "I call `registry[name](**args)` using dictionary unpacking — `**args` spreads the arguments dict into keyword arguments, which matches how the model's JSON schema maps argument names to parameter names. This only works if `args` keys exactly match the tool function's parameter names.",
        "I wrap the call in `try/except TypeError` specifically — a TypeError is what Python raises for missing required arguments or unexpected keyword arguments, which is exactly the failure mode when the model hallucinates a parameter name or omits a required one. Catching only TypeError (not a bare `except`) means real bugs inside the tool itself still propagate and aren't silently swallowed.",
      ],
      testCase: {
        input: `call = {"name": "get_weather", "arguments": {"city": "Tokyo"}}, registry = {"get_weather": lambda city: f"Sunny in {city}"}`,
        expected: `"Sunny in Tokyo"`,
        trace: [
          `name = "get_weather"`,
          `args = {"city": "Tokyo"}`,
          `"get_weather" in registry → True`,
          `registry["get_weather"](city="Tokyo") → "Sunny in Tokyo"`,
          `return "Sunny in Tokyo"`,
        ],
        traceExplanations: [
          "Extract the requested tool name from the model's structured output.",
          "Extract the arguments dict — here just one keyword argument.",
          "Confirm the tool exists in our registry before attempting to call it.",
          "Unpack `args` as keyword arguments into the registered function.",
          "No exception was raised, so the tool's return value is passed straight back as the observation.",
        ],
      },
      blanks: [
        { line: `name = call["___"]`, answer: "name" },
        { line: `args = call.get("arguments", ___)`, answer: "{}" },
        { line: `if name ___ in registry:`, answer: "not" },
        { line: `return registry[name](**___)`, answer: "args" },
        { line: `except ___ as e:`, answer: "TypeError" },
      ],
      explanationBlanks: [
        {
          line: "I pull `name = call[\"name\"]` directly with bracket indexing rather than `.get()` — the model's tool call response is a contract: `name` is a required field, and if it's missing that's a malformed response worth a loud ___, not a silent None. Arguments, by contrast, I read with `call.get(\"arguments\", {})` because a tool with no parameters might legitimately omit the key.",
          answer: "KeyError",
        },
        {
          line: "The membership check `if name not in registry` happens before any call — this is the ___ step itself. Returning a string error rather than raising lets the agent loop feed the error back to the model as an observation, so the model can recover by trying a different tool name on its next step.",
          answer: "dispatch",
        },
        {
          line: "I call `registry[name](**args)` using dictionary ___ — `**args` spreads the arguments dict into keyword arguments, which matches how the model's JSON schema maps argument names to parameter names. This only works if `args` keys exactly match the tool function's parameter names.",
          answer: "unpacking",
        },
        {
          line: "I wrap the call in `try/except TypeError` specifically — a TypeError is what Python raises for missing required arguments or unexpected keyword arguments, which is exactly the failure mode when the model hallucinates a parameter name or omits a required one. Catching only TypeError (not a bare `except`) means real bugs inside the tool itself still ___ and aren't silently swallowed.",
          answer: "propagate",
        },
      ],
    },

    {
      id: "react-loop-step",
      title: "Implement One Step of a ReAct Loop",
      difficulty: "medium",
      prompt:
        "Implement the core step function of a ReAct-style agent: given the running scratchpad of (thought, action, observation) tuples and a question, the model produces a thought and either an action+input or a final answer. Write the loop that runs until 'finish' is chosen or a max step count is hit, returning the final answer or a fallback string.",
      patternKeywords: ["ReAct", "think-act-observe", "scratchpad", "termination condition"],
      solution: `from typing import Callable

def run_react(question: str, llm_step: Callable, tools: dict[str, Callable], max_steps: int = 5) -> str:
    scratchpad = []
    for step in range(max_steps):
        thought, action, action_input = llm_step(question, scratchpad)
        if action == "finish":
            return action_input
        observation = tools[action](action_input)
        scratchpad.append((thought, action, action_input, observation))
    return "max steps reached without final answer"`,
      solutionExplanation: [
        "The `scratchpad` is a plain list of tuples — it's the agent's working memory, accumulated across steps and re-fed to `llm_step` each iteration so the model can see what it already tried and observed. I initialize it empty: `scratchpad = []`.",
        "I bound the loop with `for step in range(max_steps)` rather than `while True` — this is the single most important safety property of an agent loop. Without a hard cap, a model stuck in a reasoning cycle (re-issuing the same tool call) would loop forever, burning tokens and API calls indefinitely.",
        "`llm_step(question, scratchpad)` returns a triple — thought, action, action_input — mirroring the ReAct paper's structure: the model first reasons in natural language (`thought`), then commits to either a tool call or a termination signal (`action`). Unpacking three values in one line keeps the per-step contract explicit.",
        "The termination check `if action == \"finish\"` is a sentinel string comparison — by convention the model emits `action='finish'` with `action_input` holding the final answer text. This is the loop's only non-max-steps exit, so returning immediately here short-circuits further tool calls.",
        "If not finished, `tools[action](action_input)` dispatches to the chosen tool — same registry pattern as a single tool call, but now the result (`observation`) is appended to the scratchpad as a 4-tuple, becoming context for the *next* `llm_step` call. This is what makes it a loop rather than a single decision: each observation informs the next thought.",
        "The fallback `return \"max steps reached without final answer\"` after the loop ensures the function always returns a string even in the worst case — callers don't need to special-case `None` or handle an exception for a stuck agent.",
      ],
      testCase: {
        input: `question = "What is 2+2, then double it?", max_steps=5 (mock llm_step returns calculator actions then finish)`,
        expected: `"8"`,
        trace: [
          `step=0  llm_step → thought="need 2+2", action="calculator", input="2+2"`,
          `tools["calculator"]("2+2") → "4"`,
          `scratchpad = [("need 2+2","calculator","2+2","4")]`,
          `step=1  llm_step → thought="double 4", action="calculator", input="4*2"`,
          `tools["calculator"]("4*2") → "8"`,
          `scratchpad += [("double 4","calculator","4*2","8")]`,
          `step=2  llm_step → thought="have answer", action="finish", input="8"`,
          `return "8"`,
        ],
        traceExplanations: [
          "First reasoning step: model decides it needs to compute 2+2 and calls the calculator tool.",
          "The calculator tool executes and returns the observation '4'.",
          "Scratchpad now records the full first cycle — this becomes context for the next think step.",
          "Second reasoning step: with '4' visible in the scratchpad, the model decides to double it.",
          "Calculator returns '8'.",
          "Scratchpad now has two complete cycles of history.",
          "Third reasoning step: the model recognizes it has the final value and emits the finish sentinel.",
          "The loop returns immediately on seeing action == 'finish', short-circuiting before a third tool call.",
        ],
      },
      blanks: [
        { line: `for step in range(___):`, answer: "max_steps" },
        { line: `thought, action, action_input = ___(question, scratchpad)`, answer: "llm_step" },
        { line: `if action == "___":`, answer: "finish" },
        { line: `observation = tools[action](___)`, answer: "action_input" },
        { line: `scratchpad.append((thought, action, action_input, ___))`, answer: "observation" },
      ],
      explanationBlanks: [
        {
          line: "The `scratchpad` is a plain list of tuples — it's the agent's working ___, accumulated across steps and re-fed to `llm_step` each iteration so the model can see what it already tried and observed. I initialize it empty: `scratchpad = []`.",
          answer: "memory",
        },
        {
          line: "I bound the loop with `for step in range(max_steps)` rather than `while True` — this is the single most important safety property of an agent loop. Without a hard cap, a model stuck in a reasoning cycle (re-issuing the same tool call) would loop ___, burning tokens and API calls indefinitely.",
          answer: "forever",
        },
        {
          line: "`llm_step(question, scratchpad)` returns a triple — thought, action, action_input — mirroring the ReAct paper's structure: the model first reasons in natural language (`thought`), then commits to either a tool call or a ___ signal (`action`). Unpacking three values in one line keeps the per-step contract explicit.",
          answer: "termination",
        },
        {
          line: "The termination check `if action == \"finish\"` is a sentinel string comparison — by convention the model emits `action='finish'` with `action_input` holding the final answer text. This is the loop's only non-max-steps exit, so returning immediately here ___ further tool calls.",
          answer: "short-circuits",
        },
        {
          line: "If not finished, `tools[action](action_input)` dispatches to the chosen tool — same registry pattern as a single tool call, but now the result (`observation`) is appended to the scratchpad as a 4-tuple, becoming context for the *next* `llm_step` call. This is what makes it a loop rather than a single decision: each observation informs the next ___.",
          answer: "thought",
        },
        {
          line: "The fallback `return \"max steps reached without final answer\"` after the loop ensures the function always returns a ___ even in the worst case — callers don't need to special-case `None` or handle an exception for a stuck agent.",
          answer: "string",
        },
      ],
    },

    {
      id: "task-decomposition",
      title: "Decompose a Task into an Ordered Subtask List",
      difficulty: "medium",
      prompt:
        "Given a high-level goal and a planner function that returns raw subtask strings (possibly with stray whitespace, numbering like '1.', or duplicates), write a function that produces a clean, ordered, deduplicated list of subtasks ready to be executed sequentially.",
      patternKeywords: ["task decomposition", "planning", "deduplication", "preprocessing"],
      solution: `import re
from typing import Callable

def decompose_task(goal: str, planner_fn: Callable[[str], list[str]]) -> list[str]:
    raw_steps = planner_fn(goal)
    seen = set()
    subtasks = []
    for step in raw_steps:
        cleaned = re.sub(r"^\\s*\\d+[\\.\\)]\\s*", "", step).strip()
        if cleaned and cleaned.lower() not in seen:
            seen.add(cleaned.lower())
            subtasks.append(cleaned)
    return subtasks`,
      solutionExplanation: [
        "`planner_fn(goal)` is treated as a black box — it could be another LLM call asking 'break this goal into steps'. I don't assume its output is clean; agent planning output is notoriously inconsistent (numbered lists, markdown bullets, blank lines), so the cleaning logic here is doing real work, not just decoration.",
        "The regex `r\"^\\s*\\d+[\\.\\)]\\s*\"` strips a leading number followed by either a period or a closing parenthesis — matching both '1. Do X' and '1) Do X' styles — plus any surrounding whitespace. I use `re.sub` to replace that prefix with an empty string rather than `.lstrip(\"0123456789. \")`, because lstrip would also eat digits that are part of the actual task text (e.g. '3D model the object').",
        "`.strip()` after the regex removes any remaining leading/trailing whitespace from the line itself — the two cleaning steps are independent: one handles list-marker syntax, the other handles plain whitespace.",
        "I use a `set()` called `seen` to deduplicate, but I check membership against `cleaned.lower()` while appending the original-case `cleaned` to the result list. This means 'Search the web' and 'search the web' are treated as the same subtask (case-insensitive dedup) but the first-seen casing is preserved in the output — useful since planners sometimes restate a step with different capitalization.",
        "The `if cleaned and ...` guard skips empty strings — a raw step that was just whitespace or just a list marker (e.g. an empty '4.' line) becomes `\"\"` after cleaning and would otherwise be added as a meaningless subtask.",
      ],
      testCase: {
        input: `goal = "Plan a trip", planner_fn returns ["1. Book flights", "2) book flights", "  3. Reserve hotel", "4."]`,
        expected: `["Book flights", "Reserve hotel"]`,
        trace: [
          `raw_steps = ["1. Book flights", "2) book flights", "  3. Reserve hotel", "4."]`,
          `step="1. Book flights" → cleaned="Book flights" → not in seen → add, seen={"book flights"}`,
          `step="2) book flights" → cleaned="book flights" → "book flights" in seen → skip`,
          `step="  3. Reserve hotel" → cleaned="Reserve hotel" → add, seen={"book flights","reserve hotel"}`,
          `step="4." → cleaned="" → skip (empty)`,
          `return ["Book flights", "Reserve hotel"]`,
        ],
        traceExplanations: [
          "The planner returns four raw lines with inconsistent numbering, casing, and one empty step.",
          "First step: '1.' prefix stripped, leaves 'Book flights'. Lowercased form added to seen, original kept in output.",
          "Second step is a case-different duplicate of the first ('book flights' lowercase matches). Skipped to avoid running the same subtask twice.",
          "Third step has leading whitespace and '3.' prefix; both stripped to leave 'Reserve hotel', which is new.",
          "Fourth step is just '4.' with nothing after it — after stripping the number prefix, the cleaned string is empty, so it's discarded.",
          "Final ordered, deduplicated subtask list ready for sequential execution.",
        ],
      },
      blanks: [
        { line: `raw_steps = ___(goal)`, answer: "planner_fn" },
        { line: `cleaned = re.sub(r"^\\s*\\d+[\\.\\)]\\s*", "", step).___()`, answer: "strip" },
        { line: `if cleaned and cleaned.lower() not in ___:`, answer: "seen" },
        { line: `seen.add(cleaned.___())`, answer: "lower" },
        { line: `subtasks.append(___)`, answer: "cleaned" },
      ],
      explanationBlanks: [
        {
          line: "`planner_fn(goal)` is treated as a black box — it could be another LLM call asking 'break this goal into steps'. I don't assume its output is clean; agent planning output is notoriously inconsistent (numbered lists, markdown bullets, blank lines), so the cleaning logic here is doing real work, not just ___.",
          answer: "decoration",
        },
        {
          line: "The regex `r\"^\\s*\\d+[\\.\\)]\\s*\"` strips a leading number followed by either a period or a closing parenthesis — matching both '1. Do X' and '1) Do X' styles — plus any surrounding whitespace. I use `re.sub` to replace that prefix with an empty string rather than `.lstrip(\"0123456789. \")`, because lstrip would also eat digits that are part of the actual ___ (e.g. '3D model the object').",
          answer: "task text",
        },
        {
          line: "`.strip()` after the regex removes any remaining leading/trailing whitespace from the line itself — the two cleaning steps are ___: one handles list-marker syntax, the other handles plain whitespace.",
          answer: "independent",
        },
        {
          line: "I use a `set()` called `seen` to deduplicate, but I check membership against `cleaned.lower()` while appending the original-case `cleaned` to the result list. This means 'Search the web' and 'search the web' are treated as the same subtask (___ dedup) but the first-seen casing is preserved in the output — useful since planners sometimes restate a step with different capitalization.",
          answer: "case-insensitive",
        },
        {
          line: "The `if cleaned and ...` guard skips empty strings — a raw step that was just whitespace or just a list marker (e.g. an empty '4.' line) becomes `\"\"` after cleaning and would otherwise be added as a ___ subtask.",
          answer: "meaningless",
        },
      ],
    },

    {
      id: "multi-agent-handoff",
      title: "Route a Task to a Specialist Agent",
      difficulty: "medium",
      prompt:
        "You have a router/orchestrator agent and a set of specialist agents (e.g., 'researcher', 'coder', 'writer'), each exposed as a callable that takes a task string and returns a result string. Given a router function that classifies a task into one of the specialist names (or 'unknown'), write the handoff function that routes the task, handles an unrecognized specialist, and returns both the chosen specialist's name and its output.",
      patternKeywords: ["multi-agent", "orchestration", "handoff", "routing"],
      solution: `from typing import Callable

def handoff(task: str, router_fn: Callable[[str], str], specialists: dict[str, Callable[[str], str]], default: str = "researcher") -> tuple[str, str]:
    chosen = router_fn(task)
    if chosen not in specialists:
        chosen = default
    agent = specialists[chosen]
    result = agent(task)
    return chosen, result`,
      solutionExplanation: [
        "The orchestrator pattern separates *deciding who should do the work* (`router_fn`) from *doing the work* (`specialists[chosen]`). This separation is what lets you swap or add specialist agents without touching the routing logic, and swap the router (e.g. from a keyword classifier to an LLM call) without touching the specialists.",
        "`router_fn(task)` returns a plain string naming the chosen specialist — I keep this as a string rather than, say, an enum, because it's the most natural output format for an LLM-based router (it can literally just say 'coder') and string keys map directly onto a dict registry.",
        "`if chosen not in specialists: chosen = default` is the fallback path for when the router returns something we don't have an agent for — including its own 'unknown' sentinel, or a hallucinated specialist name that doesn't exist in our registry. Falling back to a sensible default (here, 'researcher' — a generalist) keeps the system from hard-failing on a bad routing decision.",
        "I look up `agent = specialists[chosen]` only after the fallback resolution, guaranteeing `chosen` is always a valid key by this point — no need for a second `try/except` or `.get()` here since the validity check already happened.",
        "Returning `chosen, result` as a tuple — not just `result` — matters for multi-agent systems: the orchestrator (or a logging/tracing layer) needs to know *which* specialist handled the task, both for debugging and for potentially chaining to a different specialist next based on who just acted.",
      ],
      testCase: {
        input: `task = "Write a poem about the ocean", router_fn returns "writer", specialists = {"researcher": r_fn, "writer": w_fn}`,
        expected: `("writer", "<poem text>")`,
        trace: [
          `chosen = router_fn("Write a poem about the ocean") → "writer"`,
          `"writer" in specialists → True, no fallback`,
          `agent = specialists["writer"]`,
          `result = agent("Write a poem about the ocean") → "<poem text>"`,
          `return ("writer", "<poem text>")`,
        ],
        traceExplanations: [
          "The router classifies the task as best suited for the 'writer' specialist.",
          "'writer' exists in the specialists registry, so the default fallback is not triggered.",
          "Look up the writer agent's callable from the registry.",
          "Invoke the writer agent on the original task string and capture its output.",
          "Return both which specialist handled it and what it produced — useful for tracing and for any follow-up handoffs.",
        ],
      },
      blanks: [
        { line: `chosen = ___(task)`, answer: "router_fn" },
        { line: `if chosen not in specialists:`, answer: "specialists" },
        { line: `    chosen = ___`, answer: "default" },
        { line: `agent = specialists[___]`, answer: "chosen" },
        { line: `return chosen, ___`, answer: "result" },
      ],
      explanationBlanks: [
        {
          line: "The orchestrator pattern separates *deciding who should do the work* (`router_fn`) from *doing the work* (`specialists[chosen]`). This separation is what lets you swap or add specialist agents without touching the routing logic, and swap the router (e.g. from a keyword classifier to an LLM call) without touching the ___.",
          answer: "specialists",
        },
        {
          line: "`router_fn(task)` returns a plain string naming the chosen specialist — I keep this as a string rather than, say, an enum, because it's the most natural output format for an LLM-based router (it can literally just say 'coder') and string keys map directly onto a dict ___.",
          answer: "registry",
        },
        {
          line: "`if chosen not in specialists: chosen = default` is the ___ path for when the router returns something we don't have an agent for — including its own 'unknown' sentinel, or a hallucinated specialist name that doesn't exist in our registry. Falling back to a sensible default (here, 'researcher' — a generalist) keeps the system from hard-failing on a bad routing decision.",
          answer: "fallback",
        },
        {
          line: "I look up `agent = specialists[chosen]` only after the fallback resolution, guaranteeing `chosen` is always a valid key by this point — no need for a second `try/except` or `.get()` here since the validity check already ___.",
          answer: "happened",
        },
        {
          line: "Returning `chosen, result` as a ___ — not just `result` — matters for multi-agent systems: the orchestrator (or a logging/tracing layer) needs to know *which* specialist handled the task, both for debugging and for potentially chaining to a different specialist next based on who just acted.",
          answer: "tuple",
        },
      ],
    },

    {
      id: "retry-with-backoff-tool",
      title: "Retry a Flaky Tool Call with Exponential Backoff",
      difficulty: "hard",
      prompt:
        "A tool call to an external API occasionally raises a transient error (e.g., rate limit or timeout) but should not be retried on a permanent error (e.g., invalid input). Implement a decorator that retries the wrapped function up to max_retries times with exponential backoff, only for a designated set of transient exception types, re-raising immediately on any other exception or after exhausting retries.",
      patternKeywords: ["retry", "exponential backoff", "transient vs permanent errors", "decorator"],
      solution: `import time
from functools import wraps
from typing import Callable

def retry_with_backoff(transient_exceptions: tuple[type[Exception], ...], max_retries: int = 3, base_delay: float = 1) -> Callable:
    def decorator(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return fn(*args, **kwargs)
                except transient_exceptions as e:
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(base_delay * 2 ** attempt)
        return wrapper
    return decorator`,
      solutionExplanation: [
        "This is a decorator factory: `retry_with_backoff(...)` itself returns `decorator`, which takes the function `fn` and returns `wrapper`. Three nested levels are needed because the outermost call needs to accept *configuration* (`transient_exceptions`, `max_retries`, `base_delay`) before it knows which function it's wrapping.",
        "`@wraps(fn)` from `functools` copies `fn`'s `__name__`, `__doc__`, and other metadata onto `wrapper`. Without it, every retried tool would show up in stack traces and introspection as `wrapper`, making debugging the agent's tool-call logs much harder.",
        "`except transient_exceptions as e` — `transient_exceptions` is a tuple of exception types passed in by the caller (e.g. `(RateLimitError, TimeoutError)`). Python's `except` clause accepts a tuple to match any of several types. This is the critical design decision: only *these* exception types trigger a retry. A `ValueError` from malformed input — a permanent error no amount of retrying will fix — propagates immediately because it isn't caught by this except clause at all.",
        "`if attempt == max_retries - 1: raise` — on the final allowed attempt, a bare `raise` re-raises the exact exception that was just caught (preserving its original traceback), rather than swallowing it or wrapping it in a new exception. This is what lets the agent loop's own error handling see the real underlying failure after retries are exhausted.",
        "`time.sleep(base_delay * 2 ** attempt)` is the exponential backoff: with `base_delay=1`, delays are 1s, 2s, 4s, ... doubling each attempt. This spacing gives a rate-limited or momentarily overloaded API time to recover, and avoids hammering it with immediate retries that would likely fail again for the same reason.",
      ],
      testCase: {
        input: `@retry_with_backoff((TimeoutError,), max_retries=3, base_delay=0); fn fails twice with TimeoutError then succeeds returning "ok"`,
        expected: `"ok"`,
        trace: [
          `attempt=0  fn() raises TimeoutError  → caught, attempt != max_retries-1 → sleep(0), continue`,
          `attempt=1  fn() raises TimeoutError  → caught, attempt != max_retries-1 → sleep(0), continue`,
          `attempt=2  fn() returns "ok"  → return "ok" immediately`,
        ],
        traceExplanations: [
          "First attempt fails with a TimeoutError, which is in transient_exceptions. Since attempt 0 isn't the last allowed attempt (2), we back off and try again.",
          "Second attempt also fails the same way. Still not the last attempt, so we back off again.",
          "Third attempt succeeds. The function returns 'ok' directly from inside the try block, exiting the loop entirely without reaching the except clause.",
        ],
      },
      blanks: [
        { line: `@___(fn)`, answer: "wraps" },
        { line: `for attempt in range(___):`, answer: "max_retries" },
        { line: `except ___ as e:`, answer: "transient_exceptions" },
        { line: `if attempt == max_retries - ___:`, answer: "1" },
        { line: `time.sleep(base_delay * ___ ** attempt)`, answer: "2" },
      ],
      explanationBlanks: [
        {
          line: "This is a decorator factory: `retry_with_backoff(...)` itself returns `decorator`, which takes the function `fn` and returns `wrapper`. Three nested levels are needed because the outermost call needs to accept *configuration* (`transient_exceptions`, `max_retries`, `base_delay`) before it knows which function it's ___.",
          answer: "wrapping",
        },
        {
          line: "`@wraps(fn)` from `functools` copies `fn`'s `__name__`, `__doc__`, and other metadata onto `wrapper`. Without it, every retried tool would show up in stack traces and introspection as `wrapper`, making debugging the agent's tool-call logs much ___.",
          answer: "harder",
        },
        {
          line: "`except transient_exceptions as e` — `transient_exceptions` is a tuple of exception types passed in by the caller (e.g. `(RateLimitError, TimeoutError)`). Python's `except` clause accepts a tuple to match any of several types. This is the critical design decision: only *these* exception types trigger a retry. A `ValueError` from malformed input — a permanent error no amount of retrying will fix — propagates immediately because it isn't caught by this except clause at all, which is exactly the ___ between transient and permanent failures we need.",
          answer: "distinction",
        },
        {
          line: "`if attempt == max_retries - 1: raise` — on the final allowed attempt, a bare `raise` re-raises the exact exception that was just caught (preserving its original ___), rather than swallowing it or wrapping it in a new exception. This is what lets the agent loop's own error handling see the real underlying failure after retries are exhausted.",
          answer: "traceback",
        },
        {
          line: "`time.sleep(base_delay * 2 ** attempt)` is the exponential backoff: with `base_delay=1`, delays are 1s, 2s, 4s, ... doubling each attempt. This spacing gives a rate-limited or momentarily overloaded API time to recover, and avoids ___ it with immediate retries that would likely fail again for the same reason.",
          answer: "hammering",
        },
      ],
    },
  ],
}
