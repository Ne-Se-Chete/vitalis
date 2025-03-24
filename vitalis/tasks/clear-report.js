import { process } from "sdk/bpm";
import { sendMail } from "./mail-util";
const execution = process.getExecutionContext();
const executionId = execution.getId();
const toWho = process.getVariable(executionId, "From");
const approver = process.getVariable(executionId, "Approver");
const subject = "Clear Report";
const content = `<h4>Your report has been cleared by ${approver}. There is no need for further diagnoses.</h4>`;
sendMail(toWho, subject, content);
