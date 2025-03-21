import { process } from "sdk/bpm"
import { sendMail } from "./mail-util"

const execution = process.getExecutionContext();
const executionId = execution.getId();

const toWho = process.getVariable(executionId, "From");
const approver = process.getVariable(executionId, "Approver");

const subject = "Further Review Needed";

const content = `<h4>Your case has been diagnosed by ${approver}. You need to make an appointment with the doctor for further review.</h4>`;

sendMail(toWho, subject, content);