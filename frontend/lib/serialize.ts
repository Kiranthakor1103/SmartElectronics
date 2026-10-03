/**
 * serialize.ts
 * -----------
 * Converts Mongoose lean documents into plain JS objects that are safe
 * to pass from Next.js Server Components to Client Components.
 *
 * Even with .lean(), Mongoose returns _id as a BSON ObjectId which has a
 * toJSON() method — Next.js RSC serialization rejects such objects.
 * JSON.parse(JSON.stringify(doc)) flattens everything to primitives.
 */

/**
 * Serialize a single Mongoose document or plain object.
 * Converts all BSON types (ObjectId, Date, Decimal128, etc.) to primitives.
 */
export function serializeDoc<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

/**
 * Serialize an array of Mongoose documents or plain objects.
 */
export function serializeDocs<T>(docs: T[]): T[] {
  return JSON.parse(JSON.stringify(docs));
}
