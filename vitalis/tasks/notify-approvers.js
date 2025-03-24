import { process } from "sdk/bpm";
import { sendMail } from "./mail-util";
const execution = process.getExecutionContext();
const executionId = execution.getId();
const toWho = process.getVariable(executionId, "To");
let approvalLink = process.getVariable(executionId, "ApprovalLink");
const subject = "New diagnosis request";
// Getting the process id. Will change if more parameters are parsed when starting the process
const processId = parseInt(executionId) - 4;
approvalLink = approvalLink + processId;
const content = `<h4>A new diagnosis for ${toWho} has been requested</h4>Open the link <a href="${approvalLink}" target="_blank">here</a> to process the request.`;
sendMail(toWho, subject, content);
