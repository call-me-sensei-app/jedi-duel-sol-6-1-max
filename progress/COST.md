# Eclipse · experiment 003

Measured as of 2026-10-04T14:59:33.490Z UTC. Snapshot: 2026-10-04T14:59:50.727Z.

Model: **gpt-6.1-sol** · effort: **max** · service tier: not recorded.

| Metric | Value |
|---|---:|
| Elapsed development | 194.12 minutes |
| Logged active time | 187.84 minutes |
| Input | 38,524,136 |
| Cached input, subset | 37,654,656 |
| Cache writes, subset | 0 |
| Uncached input | 869,480 |
| Output, including reasoning | 374,814 |
| Reasoning, subset | 212,757 |
| Input + output | 38,898,950 |
| Standard API-equivalent | $12.121210 USD |
| Fast API-equivalent, if selected | $24.242420 USD |

**API-equivalent estimate, not an invoice or subscription charge.** Verified October 4, 2026 from [official OpenAI pricing](https://developers.openai.com/api/docs/pricing) and [model notes](https://developers.openai.com/api/docs/models/gpt-6.1-sol). Standard short-context rates per million: $2 uncached input, $0.10 cached input, $2.50 cache writes, $10 output. Above 272,000 input tokens per request: $4 / $0.20 / $5 / $15. Each request is priced independently.

Wall time from this experiment session start; active intervals use task_started/task_complete events. Tool waits are development time, not excluded. No human labor time inferred.

- Cumulative input includes repeated context. Cached and cache-write tokens are billed subsets, not added to input.
- Reasoning is a subset of output and is not charged twice.
- Deduplicated cumulative usage events; snapshot excludes the current in-flight model response.
- No subagents were used. Hidden review/tool billing is not metered and is excluded, not assumed free.
- Only counters from this exact experiment session are read. Standard equivalent is used because service tier is not recorded.

The experiment uses procedural assets and no paid runtime API calls. Refresh with `npm run usage`.
