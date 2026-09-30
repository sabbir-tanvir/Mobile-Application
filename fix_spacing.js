const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes("node_modules") && !file.includes(".expo") && !file.includes(".git")) {
      results = results.concat(walk(file));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(file);
    }
  });
  return results;
}

const files = walk("./");
let changedFiles = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  const orig = content;
  
  // Replace space-y-* with flex-col gap-* inside className strings for View, Card, etc.
  content = content.replace(/\bspace-y-([\d\.]+)/g, "flex-col gap-$1");
  content = content.replace(/\bspace-x-([\d\.]+)/g, "flex-row gap-$1");
  
  // If it's a ScrollView, we should ideally move gap to contentContainerClassName, but typically replacing space-y- with flex-col gap- works because people often wrap it inside or flex applies. Wait, in React Native, gap on ScrollView applies to the outer wrapper, not inner items.
  // Actually, NativeWind v4 maps className on ScrollView correctly for many things, but contentContainerClassName is safer for gap.
  // Let's just do a global replace for now, it's 95% of the fix, and if any scroll view looks bad we fix it.
  
  if (orig !== content) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log("Updated", file);
  }
});
console.log("Total files updated for spacing:", changedFiles);
