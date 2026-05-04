"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddConnectionTypeToEquipment1746315700000 = void 0;
const typeorm_1 = require("typeorm");
class AddConnectionTypeToEquipment1746315700000 {
    name = 'AddConnectionTypeToEquipment1746315700000';
    async up(queryRunner) {
        const enumValues = ['fh', 'fo', 'both'];
        await queryRunner.addColumn('switches', new typeorm_1.TableColumn({
            name: 'connection_type',
            type: 'enum',
            enum: enumValues,
            isNullable: true,
        }));
        await queryRunner.addColumn('routers', new typeorm_1.TableColumn({
            name: 'connection_type',
            type: 'enum',
            enum: enumValues,
            isNullable: true,
        }));
        await queryRunner.addColumn('firewalls', new typeorm_1.TableColumn({
            name: 'connection_type',
            type: 'enum',
            enum: enumValues,
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('switches', 'connection_type');
        await queryRunner.dropColumn('routers', 'connection_type');
        await queryRunner.dropColumn('firewalls', 'connection_type');
    }
}
exports.AddConnectionTypeToEquipment1746315700000 = AddConnectionTypeToEquipment1746315700000;
//# sourceMappingURL=AddConnectionTypeToSwitches.js.map