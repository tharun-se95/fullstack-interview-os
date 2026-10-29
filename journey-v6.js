/* Iteration 6: presentation metadata, not a replacement for course IDs or saved path values. */
window.FULLSTACK_JOURNEY = Object.freeze({
  stages: [
    {id:"backend",number:"01",title:"Backend engineering",description:"Understand HTTP, Node execution and API ownership.",trackIds:["node","api"],route:"backend"},
    {id:"data",number:"02",title:"Data & security",description:"Design durable data and defend every trust boundary.",trackIds:["postgres","auth","data"],route:"backend"},
    {id:"systems",number:"03",title:"Systems & AWS",description:"Build resilient services and reason about cloud architecture.",trackIds:["async","ops","testing","system","aws"],route:"aws"},
    {id:"ai",number:"04",title:"AI engineering",description:"Build grounded GenAI, RAG and bounded agent workflows.",trackIds:["genai","rag","agentic","ai"],route:"ai-path"},
    {id:"interview",number:"05",title:"Interview ready",description:"Refresh frontend fundamentals and defend architecture decisions.",trackIds:["resume","javascript","typescript","react","nextjs"],route:"practice"}
  ],
  awsSprint: {
    title:"AWS Solutions Architect",
    description:"A dedicated post-core-backend sprint. It does not silently extend the existing four-week backend plan.",
    ids:["aws-basics","aws-iam","aws-vpc","aws-compute","aws-storage","aws-delivery","aws-events","aws-resilience","aws-observability","aws-case"]
  }
});
