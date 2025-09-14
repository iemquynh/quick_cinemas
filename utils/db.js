// utils/db.js
import { openDB } from 'idb';

const DB_NAME = 'cinema-ticket-db';
const STORE_NAME = 'my-tickets';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id', // id là định danh vé
        });
      }
    },
  });
}

export async function saveTicket(ticket) {
  const db = await getDB();
  await db.put(STORE_NAME, ticket);
}

export async function getAllTickets() {
    try {
      const db = await getDB();
      return await db.getAll(STORE_NAME);
    } catch (error) {
      console.error("Error accessing IndexedDB:", error);
      return [];
    }
  }
  

export async function deleteTicket(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
