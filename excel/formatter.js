class Formatter {
    constructor(schema) {
        this.schema = schema;
    }

    format(sheet) {
        let data = sheet.data;
        if (data.length === 0) {
            return [];
        }

        this.convertTitle2FieldName(data[0]);

        let result = [];
        for (let i = 1, lenght = data.length; i < lenght; i++) {
            let row = data[i];

            if (!row) continue;
            
            let obj = {};
            for (let j = 0, l = row.length; j < l; j++) {
                if (this.keys[j]) obj[this.keys[j]] = row[j];
            }

            result.push(obj);
        }

        return result;
    }

    convertTitle2FieldName(titles) {
        this.keys = titles.map(t => this.schema[t]);
    }
}

class JsonFormatter extends Formatter {
    format(sheet) {
        return JSON.stringify(super.format(sheet));
    }
}

class InsertSqlFormatter extends Formatter {
    format(sheet) {
        let result = super.format(sheet);
        let fieldStr = this.keys.join(',');
        let sql = InsertSqlFormatter.SQL_TEMPLATE.replace('%s', fieldStr);

        return result.map(o => {
            let valueStr = this.keys.map(k => resolveFieldValue(o[k])).join(',');
            return sql.replace('%s', valueStr);
        }).join('\n');
    } 
}

InsertSqlFormatter.SQL_TEMPLATE = 'INSERT INTO table(%s) VALUES(%s);';

function resolveFieldValue(value) {
    if (value === null) {
        return 'null';
    }
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        return `"${value}"`;
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return '';
}

const VALID_FORMATTER_MAP = {
    'json': JsonFormatter,
    'insertSql': InsertSqlFormatter
};

function getFormatter(formatterName, schema) {
    if (!VALID_FORMATTER_MAP[formatterName]) {
        throw new Error('无效的foramtter，有效的formatter集合为：[json,insertSql]');
    }

    return new VALID_FORMATTER_MAP[formatterName](schema);
}

module.exports.getFormatter = getFormatter;