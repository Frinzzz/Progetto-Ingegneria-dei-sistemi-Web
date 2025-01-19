import { reactive } from "vue";

const eventBus = reactive({
  events: new Map(), // Mappa per gestire gli eventi
  emit(event, payload) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(payload));
    }
  },
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  },
  off(event, callback) {
    if (!this.events.has(event)) return;

    if (!callback) {
      this.events.delete(event);
    } else {
      const callbacks = this.events.get(event);
      this.events.set(
        event,
        callbacks.filter((cb) => cb !== callback)
      );
    }
  },
});

export default eventBus;
