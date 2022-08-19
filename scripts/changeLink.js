var fs = require("fs");
var path = require("path");

function readfileList(dir, fileslist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((item, index) => {
    var fullpath = path.join(dir, item);
    const stat = fs.statSync(fullpath);
    if (stat.isDirectory()) {
      readfileList(path.join(dir, item), fileslist); //递归读取文件
    } else {
      fileslist.push(fullpath);
    }
  });
  return fileslist;
}
var fileslist = [];
readfileList((path.join(__dirname, '../docs')), fileslist);

fileslist.forEach(file => {
  const fileData = fs.readFileSync(file, 'utf-8');
  fs.writeFileSync(file, fileData.replace('####', '###'));
})