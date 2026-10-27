// Secure offline tool-execution simulator: the "model" is a stub callback.
// It intentionally has NO shell, email, network, payments or write tools.
export function createPolicyTools(index) {
  return {
    readPolicy: {
      validate(args){return args&&typeof args.documentId==="string" &&
        /^[A-Z0-9-]{5,40}$/.test(args.documentId);},
      authorize(actor,args){return actor.scopes.includes("policy:read") &&
        actor.tenantId===args.tenantId;},
      async execute(actor,args){
        const d=index.find(x=>x.tenantId===actor.tenantId && x.id.startsWith(
          actor.tenantId+":"+args.documentId+":"));
        return d?{status:"found",sourceId:d.id,text:d.text}:{status:"missing"};
      }
    }
  };
}
export async function runBoundedAgent({actor,model,tools,maxSteps=4}) {
  if(!actor||!actor.tenantId)throw new Error("Authenticated actor required");
  if(!Number.isInteger(maxSteps)||maxSteps<1||maxSteps>20)throw new RangeError("invalid step budget");
  const trace=[];
  for(let step=0;step<maxSteps;step++) {
    const request=await model({trace:trace.slice(),step});
    if(request?.kind==="final")return {status:"completed",text:request.text,trace};
    if(request?.kind!=="tool_call")return {status:"invalid_model_output",trace};
    const tool=Object.hasOwn(tools,request.name)?tools[request.name]:null;
    if(!tool) {trace.push({step,status:"denied",name:request.name});return {status:"tool_denied",trace};}
    if(!tool.validate(request.args)) {
      trace.push({step,status:"invalid_arguments",name:request.name});
      return {status:"invalid_arguments",trace};
    }
    if(!tool.authorize(actor,request.args)) {
      trace.push({step,status:"forbidden",name:request.name});
      return {status:"forbidden",trace};
    }
    const result=await tool.execute(actor,request.args);
    trace.push({step,name:request.name,status:"executed",result});
  }
  return {status:"step_limit",trace};
}
