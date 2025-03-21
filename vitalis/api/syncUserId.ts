import { user } from "sdk/security";
import { response } from "sdk/http";
import { PatientRepository } from "../gen/vitalis/dao/Patient/PatientRepository";
import { DoctorRepository } from "../gen/vitalis/dao/Doctor/DoctorRepository";
let patientDao = new PatientRepository();
let DoctorDao = new DoctorRepository();


let output = { username: user.getName(), role: "", userId: -1 }

if (user.isInRole("Doctor")) {

    output.role = "Doctor";
    output.userId = patientDao.findAll({
        $filter: {
            equals: { Email: user.getName() }
        }
    })[0].Id;

} else if (user.isInRole("Patient")) {

    output.role = "Patient";
    output.userId = DoctorDao.findAll({
        $filter: {
            equals: { Email: user.getName() }
        }
    })[0].Id;

} else {
    output.role = "ERROR, Undefined role";
}

response.println(JSON.stringify(output));