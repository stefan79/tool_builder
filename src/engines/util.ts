import Jexl from 'jexl';
import dayjs from 'dayjs';
import { ToolParameter } from '../tool/definition';
import { z, ZodRawShape } from 'zod';

export const buildJexlInstance = (): InstanceType<typeof Jexl.Jexl> => {
    const jexlInstance = new Jexl.Jexl();
    jexlInstance.addFunction('now', () => dayjs());
    jexlInstance.addTransform("format", (date: dayjs.Dayjs, format: string) => {
        return date.format(format);
    })
    return jexlInstance;    
}

export const zodSchemaGenerator = (request: ToolParameter[]): ZodRawShape => {
    const schema = request.reduce((acc, param) => {
        let zodField;
        switch (param.type) {
            case "string":
                zodField = z.string();
                break;
            case "number":
                zodField = z.number();
                break;
            case "boolean":
                zodField = z.boolean();
                break;
        }
        acc[param.name] = zodField.describe(param.description);
        return acc;
    }, {} as ZodRawShape);
    return schema;
}
