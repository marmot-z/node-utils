const xlsx = require('node-xlsx');
const yargs = require('yargs/yargs');
const path = require('path');
const fs = require('fs');
const {getFormatter} = require('./formatter');
const FileWriter = require('./writer');

const argv = yargs(process.argv)
                .command('parse')
                .option('p', {demand: true, describe: 'excel路径'})
                .option('s', {demand: true, describe: 'schema'})
                .option('o', {describe: '输出路径'})
                .option('m', {describe: '解析模式(json,insertSql,updateSql)'})
                .usage('parse -p -s [-t] [-m]')
                .example('parse -p ~/Desktop/demo.xlsx -s ~/Desktop/schema.json -t ~/Desktop/output.json -mode json')
                .help()
                .argv;

let excelPath = path.resolve(argv.p);  
let schema = JSON.parse(readFileAsString(argv.s));
let mode = argv.m ?  argv.m : 'json';
let outputPath = argv.o ? path.resolve(argv.o) : argv.o;
parseExcel(excelPath, schema, mode, outputPath);

function parseExcel(excelPath, schema, mode, outputPath) {
    if (typeof excelPath === 'undefined' || !excelPath) {
        console.error('无效的excel路径');
        return;
    }

    let sheets = xlsx.parse(excelPath);
    if (!sheets) {
        console.error('无效的sheet页');
    }

    let sheet = sheets[0];
    console.log(`默认处理第一个sheet页 ${sheet.name}`);

    let content = getFormatter(mode, schema).format(sheet);
    outputPath ? new FileWriter(outputPath).write(content) : console.info(content);
}

function readFileAsString(filePath) {
    let p = path.resolve(filePath); 
    let content = fs.readFileSync(p, 'utf8');
    return content.replace(/\n|\t|\s/g, '');
}