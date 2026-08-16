const FIREBASE_API_KEY = "AIzaSyACGz2kpLyHigS6OBEMTvzLwDwRsM8J_74";
const FIREBASE_PROJECT_ID = "likumediabd";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

function encodeValue(val: any): any {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === "string") {
    return { stringValue: val };
  }
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  }
  if (typeof val === "boolean") {
    return { booleanValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(encodeValue) } };
  }
  if (typeof val === "object") {
    return { mapValue: { fields: encodeFields(val) } };
  }
  return { stringValue: String(val) };
}

function encodeFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      fields[key] = encodeValue(val);
    }
  }
  return fields;
}

function decodeValue(valObj: any): any {
  if (!valObj) return null;
  if ("stringValue" in valObj) return valObj.stringValue;
  if ("doubleValue" in valObj) return Number(valObj.doubleValue);
  if ("integerValue" in valObj) return Number(valObj.integerValue);
  if ("booleanValue" in valObj) return valObj.booleanValue;
  if ("nullValue" in valObj) return null;
  if ("timestampValue" in valObj) return valObj.timestampValue;
  if ("arrayValue" in valObj) {
    const arr = valObj.arrayValue.values || [];
    return arr.map(decodeValue);
  }
  if ("mapValue" in valObj) {
    return decodeFields(valObj.mapValue.fields || {});
  }
  return null;
}

function decodeFields(fieldsObj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, valObj] of Object.entries(fieldsObj)) {
    result[key] = decodeValue(valObj);
  }
  return result;
}

// Extract document ID from REST name (projects/.../documents/col/docId)
function extractDocId(name: string): string {
  if (!name) return "";
  const parts = name.split("/");
  return parts[parts.length - 1];
}

/**
 * Gets all documents in a collection via Firestore REST API.
 */
export async function firestoreRestGetCollection(collectionName: string): Promise<any[]> {
  try {
    const url = `${BASE_URL}/${collectionName}?key=${FIREBASE_API_KEY}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.warn(`Firestore REST GET ${collectionName} status: ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (!data.documents || !Array.isArray(data.documents)) {
      return [];
    }
    return data.documents.map((doc: any) => {
      const decoded = decodeFields(doc.fields || {});
      const docId = extractDocId(doc.name);
      return { id: docId, ...decoded };
    });
  } catch (err) {
    console.error(`Firestore REST GET ${collectionName} error:`, err);
    return [];
  }
}

/**
 * Gets a single document by ID via Firestore REST API.
 */
export async function firestoreRestGetDocument(collectionName: string, docId: string): Promise<any | null> {
  try {
    const url = `${BASE_URL}/${collectionName}/${docId}?key=${FIREBASE_API_KEY}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const doc = await res.json();
    if (!doc.fields) return null;
    const decoded = decodeFields(doc.fields);
    return { id: docId, ...decoded };
  } catch (err) {
    console.error(`Firestore REST GET doc ${collectionName}/${docId} error:`, err);
    return null;
  }
}

/**
 * Sets (creates or overwrites) a document by ID via Firestore REST API.
 */
export async function firestoreRestSetDocument(collectionName: string, docId: string, data: Record<string, any>): Promise<boolean> {
  try {
    const url = `${BASE_URL}/${collectionName}/${docId}?key=${FIREBASE_API_KEY}`;
    const body = {
      fields: encodeFields(data),
    };
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch (err) {
    console.error(`Firestore REST SET doc ${collectionName}/${docId} error:`, err);
    return false;
  }
}

/**
 * Deletes a document by ID via Firestore REST API.
 */
export async function firestoreRestDeleteDocument(collectionName: string, docId: string): Promise<boolean> {
  try {
    const url = `${BASE_URL}/${collectionName}/${docId}?key=${FIREBASE_API_KEY}`;
    const res = await fetch(url, { method: "DELETE" });
    return res.ok;
  } catch (err) {
    console.error(`Firestore REST DELETE doc ${collectionName}/${docId} error:`, err);
    return false;
  }
}
