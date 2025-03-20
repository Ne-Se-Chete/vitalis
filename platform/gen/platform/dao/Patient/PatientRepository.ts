import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface PatientEntity {
    readonly Id: number;
    Name?: string;
    Email: string;
    Birthdate?: Date;
    Gender?: number;
}

export interface PatientCreateEntity {
    readonly Name?: string;
    readonly Email: string;
    readonly Birthdate?: Date;
    readonly Gender?: number;
}

export interface PatientUpdateEntity extends PatientCreateEntity {
    readonly Id: number;
}

export interface PatientEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Email?: string | string[];
            Birthdate?: Date | Date[];
            Gender?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Email?: string | string[];
            Birthdate?: Date | Date[];
            Gender?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Birthdate?: Date;
            Gender?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Birthdate?: Date;
            Gender?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Birthdate?: Date;
            Gender?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Birthdate?: Date;
            Gender?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Birthdate?: Date;
            Gender?: number;
        };
    },
    $select?: (keyof PatientEntity)[],
    $sort?: string | (keyof PatientEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PatientEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PatientEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface PatientUpdateEntityEvent extends PatientEntityEvent {
    readonly previousEntity: PatientEntity;
}

export class PatientRepository {

    private static readonly DEFINITION = {
        table: "PATIENT",
        properties: [
            {
                name: "Id",
                column: "PATIENT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PATIENT_NAME",
                type: "VARCHAR",
            },
            {
                name: "Email",
                column: "PATIENT_EMAIL",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Birthdate",
                column: "PATIENT_BIRTHDATE",
                type: "DATE",
            },
            {
                name: "Gender",
                column: "PATIENT_GENDER",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(PatientRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PatientEntityOptions): PatientEntity[] {
        return this.dao.list(options).map((e: PatientEntity) => {
            EntityUtils.setDate(e, "Birthdate");
            return e;
        });
    }

    public findById(id: number): PatientEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Birthdate");
        return entity ?? undefined;
    }

    public create(entity: PatientCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Birthdate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "PATIENT",
            entity: entity,
            key: {
                name: "Id",
                column: "PATIENT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PatientUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Birthdate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "PATIENT",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PATIENT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PatientCreateEntity | PatientUpdateEntity): number {
        const id = (entity as PatientUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PatientUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "PATIENT",
            entity: entity,
            key: {
                name: "Id",
                column: "PATIENT_ID",
                value: id
            }
        });
    }

    public count(options?: PatientEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "PATIENT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PatientEntityEvent | PatientUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("platform-Patient-Patient", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("platform-Patient-Patient").send(JSON.stringify(data));
    }
}
