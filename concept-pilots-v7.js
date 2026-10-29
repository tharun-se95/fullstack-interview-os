/* Iteration 7: question-first pilot concepts. Existing lesson and question IDs are unchanged. */
window.CONCEPT_PILOTS_V7={
  "js-event-loop": {
    "title": "How does JavaScript decide what runs next?",
    "questionIds": [
      "javascript-2"
    ],
    "context": "A loading spinner freezes although the code uses promises.",
    "bigPicture": [
      "JavaScript runs the current synchronous stack to completion.",
      "Promise reactions and queueMicrotask callbacks run as microtasks.",
      "Timers become eligible as tasks; a zero delay does not interrupt code.",
      "The browser may render between tasks, subject to scheduling."
    ],
    "flow": [
      [
        "Current task",
        "Run synchronous JavaScript"
      ],
      [
        "Microtasks",
        "Drain the microtask queue"
      ],
      [
        "Next task",
        "Pick an eligible timer or event"
      ],
      [
        "Rendering",
        "Browser may paint at an opportunity"
      ]
    ],
    "microtopics": [
      {
        "id": "stack",
        "title": "Call stack: what runs immediately?",
        "minutes": 6,
        "bullets": [
          "Synchronous statements run before queued callbacks.",
          "An async function runs synchronously until it yields at await.",
          "A slow loop blocks the main thread even if declared inside async."
        ],
        "steps": [
          "Start the current task.",
          "Execute each call to completion.",
          "When the stack empties, move to the microtask checkpoint."
        ],
        "exampleTitle": "Follow synchronous execution",
        "code": "console.log('A');\nasync function task() {\n  console.log('B');\n  await Promise.resolve();\n  console.log('D');\n}\ntask();\nconsole.log('C'); // A B C D",
        "recallPrompt": "When an async function encounters await, what has already run, and when does its continuation execute?",
        "checklist": [
          "The async function starts synchronously.",
          "await suspends the continuation even for an already-fulfilled promise.",
          "The continuation runs as a microtask after the current stack."
        ],
        "deepDive": [
          "async is not a worker thread.",
          "Blocking the stack delays input, timers and rendering."
        ]
      },
      {
        "id": "queues",
        "title": "Microtasks versus timer tasks",
        "minutes": 7,
        "bullets": [
          "Promise.then and queueMicrotask schedule microtasks.",
          "setTimeout schedules a future task, not an immediate callback.",
          "The microtask queue is drained before moving to another task."
        ],
        "steps": [
          "Log synchronous values.",
          "Queue the timer and the promise continuation.",
          "Drain microtasks, then run an eligible timer task."
        ],
        "exampleTitle": "Predict the order",
        "code": "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');\n// A D C B",
        "recallPrompt": "Why can a resolved Promise callback run before a setTimeout(..., 0) callback in a browser?",
        "checklist": [
          "The current synchronous task produces A and D.",
          "The Promise callback is a microtask.",
          "The timer callback is a later task; zero delay is not immediate."
        ],
        "deepDive": [
          "Microtasks queued by microtasks drain in the same checkpoint.",
          "Timer execution time is not guaranteed by the delay argument."
        ]
      },
      {
        "id": "starvation",
        "title": "When microtasks hurt responsiveness",
        "minutes": 8,
        "bullets": [
          "A microtask can schedule another microtask.",
          "Unbounded chains can delay later tasks and rendering.",
          "Separate CPU-heavy computation from I/O waiting."
        ],
        "steps": [
          "Inspect the Performance panel for long tasks.",
          "Check promise/microtask loops and synchronous computation.",
          "Bound the work, yield appropriately or move heavy CPU work to a Worker."
        ],
        "exampleTitle": "A starvation risk",
        "code": "let count = 0;\nfunction loop() {\n  if (++count < 100000) queueMicrotask(loop);\n}\nqueueMicrotask(loop);\n// Too many microtasks can delay timer callbacks.",
        "recallPrompt": "Why does adding more Promise callbacks not make CPU-intensive work parallel?",
        "checklist": [
          "Microtasks execute JavaScript on the same main thread.",
          "An unbounded queue can starve rendering and timers.",
          "Use a worker or split work when appropriate."
        ],
        "deepDive": [
          "Node and browsers have different host-specific phases; don't generalize all details.",
          "Use measurements rather than assuming every delay is an event-loop issue."
        ]
      }
    ]
  },
  "async-idempotency": {
    "title": "How do we prevent the same action from happening twice?",
    "questionIds": [
      "async-idempotency-interview-1",
      "async-idempotency-interview-2"
    ],
    "context": "The user retries a payment after a timeout. The first payment may already have succeeded.",
    "bigPicture": [
      "Timeout means the client did not receive an answer—not that the write failed.",
      "Clients may retry, and brokers may deliver messages more than once.",
      "A stable idempotency key identifies one logical operation.",
      "Database uniqueness and atomic updates arbitrate concurrent requests."
    ],
    "flow": [
      [
        "Client",
        "POST + idempotency key"
      ],
      [
        "API",
        "Authorize, validate, claim key"
      ],
      [
        "Database",
        "Uniqueness + transaction"
      ],
      [
        "Response",
        "Replay stored outcome"
      ]
    ],
    "microtopics": [
      {
        "id": "ambiguous",
        "title": "A timeout is an unknown outcome",
        "minutes": 6,
        "bullets": [
          "The response can be lost after the server commits.",
          "Blind retries may repeat charges, orders or emails.",
          "Frontend 'disable submit' does not protect against network retries."
        ],
        "steps": [
          "Client sends a write request.",
          "Server commits the operation.",
          "Network drops the response; client cannot tell what happened."
        ],
        "exampleTitle": "The ambiguous timeout",
        "code": "// Client perspective\ntry {\n  await fetch('/orders', { method: 'POST', body });\n} catch {\n  // Unknown: the server MAY have committed already.\n}",
        "recallPrompt": "Why does a failed HTTP request not prove an order was never created?",
        "checklist": [
          "The server and client observe different parts of the operation.",
          "A response can fail after commit.",
          "A retry needs a stable operation identity."
        ],
        "deepDive": [
          "Distinguish a timeout from an explicit, trusted transaction rollback.",
          "A transport error and a business failure require different retry rules."
        ]
      },
      {
        "id": "key",
        "title": "Claim the idempotency key atomically",
        "minutes": 9,
        "bullets": [
          "Client reuses the same key for the same logical request.",
          "Store key + request fingerprint + final result per customer/tenant.",
          "Only one writer can claim a key; conflicting payloads must be rejected."
        ],
        "steps": [
          "Authenticate, validate input and compute a canonical fingerprint.",
          "Insert scoped key under a UNIQUE constraint in the transaction.",
          "Return stored outcome on safe replay; reject same key with changed payload."
        ],
        "exampleTitle": "Database-backed invariant",
        "code": "CREATE UNIQUE INDEX uniq_request_key\nON idempotency(tenant_id, request_key);\n\n-- In one transaction, claim the key and\n-- create the order, or read the existing result.",
        "recallPrompt": "Two POST requests arrive simultaneously with the same key. Who chooses the winner?",
        "checklist": [
          "A database UNIQUE constraint arbitrates concurrent claims.",
          "Scope keys to the tenant and logical operation.",
          "Do not use a check-then-insert without a constraint."
        ],
        "deepDive": [
          "Use appropriate locking and a documented in-progress response.",
          "Retain and expire completed keys according to business risk."
        ]
      },
      {
        "id": "effects",
        "title": "Outbox events and repeated worker delivery",
        "minutes": 9,
        "bullets": [
          "DB commit and publishing to a broker are separate actions.",
          "The transactional outbox records the event alongside the state change.",
          "Workers still need replay-safe side effects because delivery may repeat."
        ],
        "steps": [
          "Write business state and outbox row in one DB transaction.",
          "Publisher reads outbox and sends an event.",
          "Consumer deduplicates eventId and commits effects before acknowledging."
        ],
        "exampleTitle": "Replay-safe worker",
        "code": "async function handle(event, db) {\n  await db.transaction(async tx => {\n    if (await tx.seen(event.id)) return;\n    await tx.applyBusinessEffect(event);\n    await tx.markSeen(event.id);\n  });\n  // Acknowledge only after durable commit.\n}",
        "recallPrompt": "Why can an outbox publisher still deliver the same event twice?",
        "checklist": [
          "Publisher may crash after publishing but before recording success.",
          "At-least-once delivery requires idempotent consumers.",
          "Deduplication must be durable, not process memory."
        ],
        "deepDive": [
          "External email or payment effects require provider-level idempotency or a separate reconciliation plan.",
          "No general exactly-once guarantee spans arbitrary databases and outside services."
        ]
      }
    ]
  },
  "aws-vpc": {
    "title": "How does an AWS VPC keep an API private?",
    "questionIds": [
      "aws-vpc-q1"
    ],
    "context": "Your Node API must be reachable over HTTPS, but its PostgreSQL database must not accept traffic from the public internet.",
    "bigPicture": [
      "A VPC supplies private addressing and network boundaries.",
      "Routing decides where packets can go; security groups decide which traffic is permitted.",
      "An internet-facing ALB can be public while application tasks and RDS remain private.",
      "A NAT gateway supports outbound connections; it does not accept unsolicited inbound ones."
    ],
    "flow": [
      [
        "Internet",
        "HTTPS :443"
      ],
      [
        "Public ALB",
        "Routes to healthy targets"
      ],
      [
        "Private ECS",
        "API task security group"
      ],
      [
        "Private RDS",
        "Accepts app SG on 5432"
      ]
    ],
    "microtopics": [
      {
        "id": "subnets",
        "title": "Start with subnets and route tables",
        "minutes": 7,
        "bullets": [
          "Subnets are AZ-scoped portions of a VPC address space.",
          "A public subnet typically has a route to an internet gateway.",
          "A private subnet has no direct internet gateway route for internet ingress."
        ],
        "steps": [
          "Create VPC CIDR and AZ plan.",
          "Assign public and private subnets in two AZs.",
          "Define route tables before adding compute."
        ],
        "exampleTitle": "A routing mental model",
        "code": "VPC:     10.0.0.0/16\nPublic:  10.0.1.0/24 -> IGW\nPrivate: 10.0.11.0/24 -> internal / optional NAT\nDB:      10.0.21.0/24 -> private",
        "recallPrompt": "What specifically makes a subnet public?",
        "checklist": [
          "A route for internet-bound traffic points at an internet gateway.",
          "The resource must also have suitable public addressing and security rules.",
          "Public subnet placement alone does not automatically open an instance."
        ],
        "deepDive": [
          "Security groups and NACLs are different: SGs are stateful; NACLs are stateless.",
          "Route targets and return paths both matter."
        ]
      },
      {
        "id": "ingress",
        "title": "Trace HTTPS through an ALB",
        "minutes": 8,
        "bullets": [
          "The internet-facing ALB handles public HTTPS traffic.",
          "The API accepts traffic only from the ALB security group.",
          "RDS accepts Postgres traffic only from the application security group."
        ],
        "steps": [
          "Allow ALB ingress on TCP/443.",
          "Allow ECS task port only from ALB SG.",
          "Allow RDS TCP/5432 only from ECS SG."
        ],
        "exampleTitle": "Security-group intent",
        "code": "ALB-SG:  inbound 443 from 0.0.0.0/0\nAPI-SG:  inbound 3000 from ALB-SG\nDB-SG:   inbound 5432 from API-SG\n// App still performs tenant/resource authorization.",
        "recallPrompt": "Why is hiding an RDS IP address not a substitute for database network restrictions?",
        "checklist": [
          "A routable path and permissive SG can expose the database.",
          "Restrict DB ingress to the application SG.",
          "Application authorization is still required above network security."
        ],
        "deepDive": [
          "Security group references are preferable to hardcoded ephemeral instance IPs.",
          "Use health-check routes and clear TLS termination boundaries."
        ]
      },
      {
        "id": "egress",
        "title": "Outbound access and avoiding hidden cost",
        "minutes": 7,
        "bullets": [
          "Private workloads can need access to external APIs or AWS services.",
          "A NAT gateway offers outbound internet connectivity for private subnets.",
          "VPC endpoints can provide private paths to supported AWS services."
        ],
        "steps": [
          "List exact external dependencies.",
          "Choose NAT or VPC endpoints based on reachability and price.",
          "Test behavior when the egress path is unavailable."
        ],
        "exampleTitle": "Choose egress intentionally",
        "code": "Needs S3 objects? -> consider an S3 gateway endpoint\nNeeds public API? -> NAT or suitable proxy\nNeeds no egress? -> do not add one by default",
        "recallPrompt": "Does adding a NAT gateway make private ECS tasks publicly accessible?",
        "checklist": [
          "NAT supports outbound-initiated traffic, not unsolicited inbound access.",
          "Private route tables remain distinct from public routes.",
          "Cost and AZ resilience should be included in the decision."
        ],
        "deepDive": [
          "NAT gateway hourly and data processing cost can matter for small apps.",
          "Use failure-domain-aware endpoints and routing."
        ]
      }
    ]
  },
  "rag-architecture": {
    "title": "How does RAG answer using trusted evidence?",
    "questionIds": [
      "rag-architecture-q1",
      "rag-architecture-q2"
    ],
    "context": "A policy assistant must answer questions using the latest internal documents, with citations and tenant restrictions.",
    "bigPicture": [
      "RAG retrieves relevant material before a model generates the answer.",
      "Indexing and answering are two separate pipelines.",
      "Retrieval narrows evidence; it does not prove that evidence is complete.",
      "The model may still invent claims, so verify citations and allow abstention."
    ],
    "flow": [
      [
        "Ingest",
        "Parse + version documents"
      ],
      [
        "Index",
        "Chunk + metadata + embedding"
      ],
      [
        "Retrieve",
        "Scope, search and rerank"
      ],
      [
        "Answer",
        "Evidence + validation"
      ]
    ],
    "microtopics": [
      {
        "id": "index",
        "title": "Prepare evidence before any question",
        "minutes": 8,
        "bullets": [
          "Parse source documents into meaningful sections.",
          "Keep document version, tenant scope and stable source IDs.",
          "Chunk and index text so queries can locate relevant passages."
        ],
        "steps": [
          "Extract text and validate tables/layout.",
          "Split by semantic sections, not arbitrary characters alone.",
          "Store IDs, revisions, ACL metadata and searchable representations."
        ],
        "exampleTitle": "Source identity",
        "code": "const chunk = {\n  tenantId: 't1', documentId: 'policy-12',\n  revision: 3, sectionId: 'refunds-2',\n  text: 'Refunds require ...'\n};",
        "recallPrompt": "Why must RAG chunks retain document version and source identity?",
        "checklist": [
          "Citations must point to real, active source passages.",
          "Stale versions must not silently contaminate retrieval.",
          "Tenant filtering cannot be a post-answer decoration."
        ],
        "deepDive": [
          "Evaluate extraction quality before optimizing embeddings.",
          "Chunking strategy impacts recall and citation granularity."
        ]
      },
      {
        "id": "retrieve",
        "title": "Retrieve within the user's authorization scope",
        "minutes": 8,
        "bullets": [
          "Authenticate the requester and determine accessible sources.",
          "Search relevant chunks with metadata constraints.",
          "Optionally combine lexical and vector retrieval, then rerank."
        ],
        "steps": [
          "Derive allowed tenant/document scope from trusted identity.",
          "Retrieve a candidate set and filter/rerank by relevance.",
          "Return source IDs and text spans with the selected evidence."
        ],
        "exampleTitle": "Safe retrieval interface",
        "code": "const evidence = await search({\n  question, tenantId: session.tenantId,\n  allowedDocumentIds: session.allowedDocs,\n  maxResults: 6\n});\n// Server validates access before returning passages.",
        "recallPrompt": "Why can a high embedding similarity score still produce an incorrect answer?",
        "checklist": [
          "Similarity measures relevance, not factual correctness.",
          "The right clause may be missing or stale.",
          "Scope and provenance are independent checks."
        ],
        "deepDive": [
          "Track recall@k using labeled questions.",
          "Compare hybrid search with pure vector search on exact legal or version terms."
        ]
      },
      {
        "id": "answer",
        "title": "Generate, verify and abstain",
        "minutes": 9,
        "bullets": [
          "Put only authorized retrieved evidence into the model context.",
          "Require source-backed claims and validate referenced IDs.",
          "When evidence is missing, ask for clarification or abstain."
        ],
        "steps": [
          "Provide retrieved chunks with immutable source IDs.",
          "Generate a structured draft answer and supporting citations.",
          "Reject invalid IDs or unsupported claims; record a review outcome."
        ],
        "exampleTitle": "Evidence gate",
        "code": "if (!citations.every(id => evidence.some(x => x.id === id))) {\n  return { status: 'needs_review', answer: null };\n}\n// Valid citation IDs alone do not verify every claim.",
        "recallPrompt": "A retrieved document says 'ignore all previous instructions.' What should the application do?",
        "checklist": [
          "Retrieved documents are untrusted data, not authority over instructions.",
          "Validate cited IDs and the actual support for claims.",
          "Fail closed or escalate when important evidence is absent."
        ],
        "deepDive": [
          "Separate retrieval errors from model generation errors in evaluation.",
          "For regulated decisions, require authorized human review rather than model-only approval."
        ]
      }
    ]
  }
};
