/**
 * ResQGrid Field Mobile - Offline Queue Storage & Sync Manager
 * Buffers CAD status actions and GPS pings during disaster communications blackouts.
 */

class OfflineStore {
    constructor() {
        this.queue = [];
        this.isOnline = true;
        this.syncListeners = new Set();
    }

    setOnline(status) {
        this.isOnline = status;
        if (this.isOnline && this.queue.length > 0) {
            this.flushQueue();
        }
        this.notify();
    }

    enqueueAction(actionType, payload) {
        const item = {
            id: `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            actionType,
            payload,
            queuedAt: new Date().toISOString(),
            status: "PENDING_SYNC"
        };
        this.queue.push(item);
        this.notify();

        if (this.isOnline) {
            this.flushQueue();
        }
        return item;
    }

    async flushQueue() {
        if (!this.isOnline || this.queue.length === 0) return;
        console.log(`[OFFLINE-SYNC] Syncing ${this.queue.length} queued action(s) to ResQGrid CAD backend...`);

        const itemsToProcess = [...this.queue];
        for (const item of itemsToProcess) {
            try {
                // In production, posts to backend /api/resources or /api/telemetry
                console.log(`[OFFLINE-SYNC] Replayed action ${item.actionType}:`, item.payload);
                this.queue = this.queue.filter(q => q.id !== item.id);
            } catch (err) {
                console.error(`[OFFLINE-SYNC] Failed to sync ${item.id}`, err);
                break;
            }
        }
        this.notify();
    }

    subscribe(callback) {
        this.syncListeners.add(callback);
        return () => this.syncListeners.delete(callback);
    }

    notify() {
        this.syncListeners.forEach(cb => cb({
            isOnline: this.isOnline,
            pendingCount: this.queue.length,
            queue: [...this.queue]
        }));
    }
}

export const offlineStore = new OfflineStore();
export default offlineStore;
