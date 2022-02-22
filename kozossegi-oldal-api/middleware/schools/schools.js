const fs = require('fs');

exports.getSchools = () => {
    try {
        const data = fs.readFileSync(`${process.cwd()}/middleware/schools/school_list.csv`, 'utf8');
        const result = csvToArray(data);
        return result;
    } catch (err) {
        console.error(err);
    }
};

const csvToArray = (str, delimiter = ",") => {
    const headers = str.slice(0, str.indexOf('\r\n')).split(delimiter);

    const rows = str.slice(str.indexOf('\r\n') + 1).split('\r\n');

    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index].replace("\n", "");
            return object;
        }, {});
        return el;
    });
    return arr;
}