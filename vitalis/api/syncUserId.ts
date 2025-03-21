import { PatientRepository } from "../gen/vitalis/dao/Patient/PatientRepository";
import { DoctorRepository } from "../gen/vitalis/dao/Doctor/DoctorRepository";

import { user } from "sdk/security";
import { response } from "sdk/http";

let patientDao = new PatientRepository();
let doctorDao = new DoctorRepository();

let output = { username: user.getName(), role: "", userId: -1 };

if (user.isInRole("Doctor")) {
    user.getAuthType
    output.role = "Doctor";
    let doctor = doctorDao.findAll({
        $filter: {
            equals: { Email: user.getName() }
        }
    });

    output.userId = doctor.Id;

} else if (user.isInRole("Patient")) {
    output.role = "Patient";
    let patient = patientDao.findAll({
        $filter: {
            equals: { Email: user.getName() }
        }
    });

    output.userId = patient.Id;

} else {
    output.role = "ERROR, Undefined role";
}

response.println(JSON.stringify(output));

