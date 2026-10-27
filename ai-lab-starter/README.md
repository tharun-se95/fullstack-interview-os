# AI Engineering Workshop — offline practice starter

This is a **working, dependency-free Node.js learning baseline** supporting the new Generative AI, RAG and Agentic AI course tracks.

It uses **synthetic SOP policies** and **fake tools**. It does **not** call a model provider, charge tokens, access a live database, or send emails. This is deliberate: first prove retrieval and tool authorization in deterministic tests. Later connect OpenAI, pgvector and LangGraph in your own Node backend.

## Get started

Requirements: Node.js 20+.

```bash
cd ai-lab-starter
npm test
npm run demo
```

The offline demo prints matching source IDs, a small retrieval-evaluation report and one authorized agent-tool sequence. Tests cover active-document versions, tenant isolation, deduplicated indexing, citation ID checks, unknown-tool denial, scoped tool arguments and a bounded agent loop.

## Project structure

- `src/retrieval.js`: deterministic, lexical-only document index and ranker; also source packet and citation-ID validation.
- `src/eval.js`: simple recall@k and no-evidence evaluation helpers.
- `src/agent.js`: fake-model tool executor limited to a read-only policy tool, with argument/tenant checks and a step limit.
- `src/demo.js`: local demonstration runner.
- `data/policies.json`: two fictional tenants, current and retired policy revisions, and a malicious document passage.
- `data/gold-questions.json`: small starter dataset for retrieval evaluation.
- `tests/`: Node's built-in test runner for core expected behavior.

The corpus and sample test set are intentionally tiny. They are **not** proof of production retrieval quality. The offline retriever is not BM25 or a vector embedding index. Citation-ID existence is **not** proof that a claim is semantically supported; the workshop asks you to implement claim-level support evaluation.

## Your progression (in the main website at #ai-path)

1. Add an **Express route** that validates input, authorizes the actor and calls a fake generation adapter.
2. Add optional live **Responses API** inference through a server-side OpenAI SDK dependency and server-only environment credential.
3. Add strict output validation, distinguish incomplete/refused responses and safe streaming states.
4. Write a robust file ingestion/index pipeline with stable IDs, source page links and active version switching.
5. Replace simple lexical scoring with **keyword + embedding search** and a scoped `pgvector` query, then rerank.
6. Expand the labeled dataset to 30+ realistic positive, no-evidence, multi-tenant and prompt-injection queries.
7. Use the deterministic fake tool runner to simulate model-selected calls, then replace fake model selection with the provider's documented **function calling** loop. Keep auth and execution in backend code.
8. Implement LangGraph graph state, persistence and approval interrupts with a durable DB/outbox, and test duplicate resume side effects.
9. Deliver the SOP-review capstone with source-faithfulness checks, a human review gate, latency/cost metrics, and a detailed architecture review.

## Safety and limitations

**Do not mistake this starter for a production AI service.** There is no real authentication, persistent checkpoint storage, parser sandbox, vector store, paid model integration, approval DB, privacy policy or irreversible action runner. The fake tool runner intentionally cannot call arbitrary network, shell, payment or export functions.

- Never place model API keys in frontend JavaScript.
- Data files are synthetic and local; don't upload regulated/private documents to an arbitrary provider.
- Enforce tenant ACL **before** passing retrieved chunks into model context.
- Revalidate every tool invocation, regardless of model instructions or previous conversation history.
- Always test idempotency and permission revocation before enabling external side effects.
- The main website records **self-reported workshop completion**, not observed execution results.

## References

- [OpenAI Responses API](https://developers.openai.com/api/reference/responses/overview)
- [OpenAI Function calling](https://developers.openai.com/api/docs/guides/function-calling)
- [OpenAI Retrieval](https://developers.openai.com/api/docs/guides/retrieval)
- [LangGraph overview](https://docs.langchain.com/oss/javascript/langgraph/overview)
- [LangGraph interrupts](https://docs.langchain.com/oss/javascript/langgraph/interrupts)
- [pgvector](https://github.com/pgvector/pgvector)
- [OWASP LLM Top 10](https://genai.owasp.org/llm-top-10/)

For the course curriculum, study plan and implementation missions, visit https://fullstack-interview-os.vercel.app/#ai-path .
