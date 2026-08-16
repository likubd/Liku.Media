import fs from "fs";
import path from "path";

// Determine writable directory (/tmp in Vercel/Serverless production, src/data in local dev)
function getStorageDir(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production") {
    return "/tmp";
  }
  return path.join(process.cwd(), "src", "data");
}

export function readJsonFile<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(getStorageDir(), filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.warn(`Warning reading ${filename} from storage:`, err);
  }
  return fallback;
}

export function writeJsonFile(filename: string, data: any): boolean {
  try {
    const dir = getStorageDir();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error(`Error writing ${filename} to ${getStorageDir()}:`, err);
    return false;
  }
}
