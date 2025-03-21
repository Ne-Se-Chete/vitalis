import { PatientRepository } from "vitalis/gen/vitalis/dao/Patient/PatientRepository";
import { DoctorRepository } from "vitalis/gen/vitalis/dao/Doctor/DoctorRepository";

import { process } from "sdk/bpm";
import { request } from "sdk/http";

export const trigger = (event) => {

    const patientDao = new PatientRepository();
    const doctorDao = new DoctorRepository();

    if (event.operation === "create") {
        const measurements = event.entity;

        const protocol = request.getScheme() + "://";
        const domain = request.getHeader("Host")

        const approvalLink = `${protocol}${domain}/services/web/vitalis/ext/generate/RequestDeduction/index.html?measurementsId=${measurements.Id}&processId=`;

        const patient = patientDao.findById(measurements.Patient);
        const doctor = doctorDao.findById(patient.Doctor);

        const processInstanceId = process.start("approve-request", {
            From: patient.Email,
            To: doctor.Email,
            ApprovalLink: approvalLink
        });


        if (processInstanceId == null) {
            console.log("Failed to send mail to doctor action process!");
            return;
        }
    }
}