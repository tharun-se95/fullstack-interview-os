/* Iteration 8: concept-specific, architecturally accurate flow diagrams.
 * Presentation metadata augments V7 source content; legacy lesson IDs remain stable.
 */
window.CONCEPT_DIAGRAMS_V8={
  "js-event-loop": {
    "headline": "A browser event-loop turn, not a fixed paint schedule",
    "lanes": [
      {
        "label": "CURRENT TASK",
        "nodes": [
          [
            "Stack",
            "Run synchronous JavaScript"
          ],
          [
            "Microtasks",
            "Drain Promise reactions and queueMicrotask"
          ]
        ]
      },
      {
        "label": "THEN THE BROWSER DECIDES",
        "nodes": [
          [
            "Rendering opportunity",
            "May update layout and paint"
          ],
          [
            "Next task",
            "May select an eligible timer or user event"
          ]
        ]
      }
    ],
    "note": "Rendering is an opportunity chosen by the browser; do not assume one paint per task or that every timer runs before rendering.",
    "kind": "event-loop"
  },
  "async-idempotency": {
    "headline": "One logical request, one durable outcome",
    "lanes": [
      {
        "label": "FIRST REQUEST",
        "nodes": [
          [
            "Client",
            "Send POST with stable request key"
          ],
          [
            "API + database",
            "Atomically claim key and commit operation"
          ],
          [
            "Saved outcome",
            "Persist result for the key"
          ]
        ]
      },
      {
        "label": "RETRY / LOST RESPONSE",
        "nodes": [
          [
            "Same key",
            "Client retries after a timeout"
          ],
          [
            "Lookup + compare",
            "Find key and verify request fingerprint"
          ],
          [
            "Replay outcome",
            "Return saved result, not another side effect"
          ]
        ]
      }
    ],
    "note": "Two concurrent requests must be resolved by a database constraint/transaction, not an in-memory check. An in-flight request needs an explicit retry policy.",
    "kind": "idempotency"
  },
  "aws-vpc": {
    "headline": "Public entry point, private application and database",
    "lanes": [
      {
        "label": "INBOUND REQUEST",
        "nodes": [
          [
            "Internet",
            "HTTPS 443"
          ],
          [
            "Public ALB",
            "Internet-facing in public subnets"
          ],
          [
            "Private API",
            "ECS task accepts only ALB security group"
          ],
          [
            "Private RDS",
            "Postgres accepts only API security group"
          ]
        ]
      },
      {
        "label": "OPTIONAL OUTBOUND",
        "nodes": [
          [
            "Private API",
            "Needs AWS service or public API"
          ],
          [
            "VPC endpoint / NAT",
            "Choose a justified egress path"
          ]
        ]
      }
    ],
    "note": "A public subnet requires an internet gateway route; an individual resource also needs appropriate addressing and security rules. NAT is outbound-only.",
    "kind": "aws"
  },
  "rag-architecture": {
    "headline": "Two pipelines joined by a versioned retrieval index",
    "lanes": [
      {
        "label": "INDEXING — BEFORE A QUESTION",
        "nodes": [
          [
            "Source files",
            "Extract and version"
          ],
          [
            "Chunks",
            "Attach tenant, ACL and source IDs"
          ],
          [
            "Search index",
            "Store representations and metadata"
          ]
        ]
      },
      {
        "label": "QUERY — WHEN A USER ASKS",
        "nodes": [
          [
            "Authenticated question",
            "Resolve allowed source scope"
          ],
          [
            "Search index",
            "Retrieve and rerank permitted passages"
          ],
          [
            "Evidence + model",
            "Generate, verify support, or abstain"
          ]
        ]
      }
    ],
    "note": "The query pipeline reads the index built by ingestion. Similarity is not proof: scope access before retrieval and verify evidence after generation.",
    "kind": "rag"
  }
};
