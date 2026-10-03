import mongoose, { ClientSession } from "mongoose";

/**
 * Executes an operation inside an atomic MongoDB multi-document transaction.
 * 
 * - In Replica Set / Atlas / Production environments: Commits atomically or rolls back on failure.
 * - In Standalone Development environments: Seamlessly falls back to safe sequential execution.
 */
export async function runInTransaction<T>(
  operation: (session?: ClientSession) => Promise<T>
): Promise<T> {
  // Check if mongoose connection is established
  if (mongoose.connection.readyState !== 1) {
    return await operation();
  }

  let session: ClientSession | null = null;
  try {
    session = await mongoose.startSession();
  } catch (err: any) {
    // Session initiation not supported on this MongoDB server instance
    return await operation();
  }

  try {
    let result: T | undefined;
    await session.withTransaction(async () => {
      result = await operation(session as ClientSession);
    });
    return result as T;
  } catch (err: any) {
    const errorMsg = String(err?.message || "");
    // Detect standalone MongoDB instances that do not support multi-document replica transactions
    if (
      errorMsg.includes("Transaction numbers are only allowed on a replica set member") ||
      errorMsg.includes("replica set") ||
      err?.code === 20
    ) {
      return await operation();
    }
    throw err;
  } finally {
    if (session) {
      await session.endSession().catch(() => {});
    }
  }
}
