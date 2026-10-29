/* Curated AWS architecture flows, one per first-principles lesson. */
window.AWS_DIAGRAMS={
  "aws-basics": {
    "title": "Regional availability boundary",
    "nodes": [
      "Clients",
      "Regional entry",
      "App across two AZs",
      "Multi-AZ database"
    ],
    "note": "Two AZs reduce an AZ failure; disaster recovery across regions is a separate requirement."
  },
  "aws-iam": {
    "title": "Temporary workload credentials",
    "nodes": [
      "ECS task identity",
      "Assume scoped IAM role",
      "Temporary credentials",
      "Private S3 object"
    ],
    "note": "IAM policy and resource policy must permit the exact action; explicit deny still wins."
  },
  "aws-vpc": {
    "title": "Private application traffic",
    "nodes": [
      "Internet HTTPS",
      "Public ALB",
      "Private app task",
      "Private RDS"
    ],
    "note": "Route tables choose the network path; security groups constrain source and destination."
  },
  "aws-compute": {
    "title": "Separate workload lifecycles",
    "nodes": [
      "HTTP / object event",
      "ALB or SQS",
      "ECS task or Lambda",
      "RDS / S3"
    ],
    "note": "Scale compute only within downstream capacity and time-budget limits."
  },
  "aws-storage": {
    "title": "Object and metadata boundaries",
    "nodes": [
      "Browser upload",
      "Private S3 object",
      "Validation worker",
      "RDS metadata"
    ],
    "note": "Object upload and SQL transaction are not atomic together; reconcile failures."
  },
  "aws-delivery": {
    "title": "Public and private delivery",
    "nodes": [
      "Route 53 DNS",
      "CloudFront / API edge",
      "ALB / gateway",
      "Authorized API"
    ],
    "note": "Public cache policies must never be applied blindly to tenant-specific responses."
  },
  "aws-events": {
    "title": "At-least-once job execution",
    "nodes": [
      "API + outbox",
      "SQS queue",
      "Idempotent worker",
      "DB status / DLQ"
    ],
    "note": "Retry messages safely; acknowledge only after durable business effects."
  },
  "aws-resilience": {
    "title": "AZ failure and recovery",
    "nodes": [
      "Healthy clients",
      "ALB health routing",
      "Surviving AZ capacity",
      "DB failover"
    ],
    "note": "Bound retries and meet tested RTO/RPO objectives rather than relying only on redundancy."
  },
  "aws-observability": {
    "title": "Debugging and audit signals",
    "nodes": [
      "Client request ID",
      "Traces + metrics",
      "Logs / alarms",
      "CloudTrail audit"
    ],
    "note": "Use privacy-safe correlation and cost allocation; management audit is not application tracing."
  },
  "aws-case": {
    "title": "Production Node/Postgres design",
    "nodes": [
      "HTTPS ALB",
      "Private ECS API",
      "RDS + private S3",
      "SQS worker + metrics"
    ],
    "note": "Every component needs a trust boundary, recovery plan, observable signal and cost rationale."
  }
};
