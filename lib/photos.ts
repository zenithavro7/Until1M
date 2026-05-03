"use client";
import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "u1m-photos";
const STORE = "photos";

let dbp: Promise<IDBPDatabase> | null = null;
function db() {
  if (!dbp) {
    dbp = openDB(DB_NAME, 1, {
      upgrade(d) { if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE); },
    });
  }
  return dbp;
}

export async function savePhoto(id: string, blob: Blob) {
  (await db()).put(STORE, blob, id);
}
export async function loadPhoto(id: string): Promise<string | null> {
  const blob = await (await db()).get(STORE, id);
  return blob ? URL.createObjectURL(blob as Blob) : null;
}
export async function deletePhoto(id: string) {
  (await db()).delete(STORE, id);
}
