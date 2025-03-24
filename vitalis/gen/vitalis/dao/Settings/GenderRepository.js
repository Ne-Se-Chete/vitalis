var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
export class GenderRepository {
    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(GenderRepository.DEFINITION, null, dataSource);
    }
    findAll(options) {
        return this.dao.list(options);
    }
    findById(id) {
        const entity = this.dao.find(id);
        return entity !== null && entity !== void 0 ? entity : undefined;
    }
    create(entity) {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "GENDER",
            entity: entity,
            key: {
                name: "Id",
                column: "GENDER_ID",
                value: id
            }
        });
        return id;
    }
    update(entity) {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "GENDER",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "GENDER_ID",
                value: entity.Id
            }
        });
    }
    upsert(entity) {
        const id = entity.Id;
        if (!id) {
            return this.create(entity);
        }
        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity);
            return id;
        }
        else {
            return this.create(entity);
        }
    }
    deleteById(id) {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "GENDER",
            entity: entity,
            key: {
                name: "Id",
                column: "GENDER_ID",
                value: id
            }
        });
    }
    count(options) {
        return this.dao.count(options);
    }
    customDataCount() {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "GENDER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            }
            else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }
    triggerEvent(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const triggerExtensions = yield extensions.loadExtensionModules("vitalis-Settings-Gender", ["trigger"]);
            triggerExtensions.forEach(triggerExtension => {
                try {
                    triggerExtension.trigger(data);
                }
                catch (error) {
                    console.error(error);
                }
            });
            producer.topic("vitalis-Settings-Gender").send(JSON.stringify(data));
        });
    }
}
GenderRepository.DEFINITION = {
    table: "GENDER",
    properties: [
        {
            name: "Id",
            column: "GENDER_ID",
            type: "INTEGER",
            id: true,
            autoIncrement: true,
        },
        {
            name: "Name",
            column: "GENDER_NAME",
            type: "VARCHAR",
        }
    ]
};
