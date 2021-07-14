const fs = require('fs');

class FileWriter {
    constructor(filePath) {
        this.filePath = filePath;
    }

    write(s) {
        fs.writeFile(this.filePath, s, (err) => {
            if (err) {
                console.error(`内容写入到 ${this.filePath} 失败`, e);
                return;
            }

            console.info(`内容写入到 ${this.filePath} 成功`);
        })
    }
}

module.exports = FileWriter;