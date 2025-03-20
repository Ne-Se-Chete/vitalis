import { DoctorRepository as DoctorDao } from "platform/gen/platform/dao/Doctor/DoctorRepository";
import { PatientRepository as PatientDao } from "platform/gen/platform/dao/Patient/PatientRepository";
import { MeasurementsRepository as MeasurementsDao } from "platform/gen/platform/dao/Measurements/MeasurementsRepository";

import { Controller, Get } from "sdk/http";
import { user } from "sdk/security";

@Controller
class VacationsService {
    private readonly doctorDao;
    private readonly patientDao;
    private readonly measurmentsDao;

    constructor() {
        this.doctorDao = new DoctorDao();
        this.patientDao = new PatientDao();
        this.measurmentsDao = new MeasurementsDao();
    }
}