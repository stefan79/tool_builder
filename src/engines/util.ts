import { Jexl } from 'jexl';
import dayjs from 'dayjs';

export const buildJexlInstance = () => {
    const jexlInstance = new Jexl();
    jexlInstance.addFunction('now', () => dayjs());
    jexlInstance.addTransform("format", (date: dayjs.Dayjs, format: string) => {
        return date.format(format);
    })
    return jexlInstance;
}
    