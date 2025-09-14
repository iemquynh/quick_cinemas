#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// --- Hàm đếm dòng code ---
function countLines(dir, exts = [".js", ".ts", ".jsx", ".tsx"]) {
  let total = 0;
  function walk(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
  
      // Bỏ qua các thư mục không muốn đếm
      if (stat.isDirectory() && !["node_modules", ".next", ".git"].includes(file)) {
        walk(fullPath);
      } else if (stat.isFile() && exts.includes(path.extname(file))) {
        const lines = fs.readFileSync(fullPath, "utf-8").split(/\r?\n/).length;
        total += lines;
      }
    }
  }
  
  walk(dir);
  return total;
}

// --- Hàm đếm entities ---
function countEntities(modelsDir = "./models") {
  if (!fs.existsSync(modelsDir)) return 0;
  const files = fs.readdirSync(modelsDir);
  return files.filter(f => f.endsWith(".js") || f.endsWith(".ts")).length;
}

// --- Hàm đếm dependencies ---
function countDependencies() {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  const dep = pkg.dependencies ? Object.keys(pkg.dependencies).length : 0;
  const devDep = pkg.devDependencies ? Object.keys(pkg.devDependencies).length : 0;
  return { dep, devDep };
}

// --- Hàm tính dung lượng ---
function getSize(dir = ".next") {
  if (!fs.existsSync(dir)) return "0 MB";
  const size = execSync(`du -sh ${dir}`).toString().split("\t")[0];
  return size;
}

// --- Thống kê ---
console.log("=== Thống kê dự án Movie Booking ===");
console.log("Số dòng code:", countLines("../"));
const { dep, devDep } = countDependencies();
console.log("Dependencies:", dep);
console.log("DevDependencies:", devDep);
console.log("Số entities (trong ../models):", countEntities());
console.log("Dung lượng thư mục build (../.next):", getSize());
console.log("===================================");
