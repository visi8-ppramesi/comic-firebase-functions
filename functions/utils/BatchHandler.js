
/**
 * `BatchHandler` is for handling batches and shit. It automatically commits batches when they are full.
 */
class BatchHandler {
  /**
   * Creates new batch handler
   * @param {Firestore}db firestore instance, get from admin
   */
  constructor(db) {
    this.batches = [];
    this.counter = 0;
    this.db = db;
  }

  /**
   * add update to batch. automatically create a batch if the latest one is full.
   * @param {DocumentReference} ref reference instance
   * @param {Object} data data to update
   */
  addUpdate(ref, data) {
    if (this.counter % 500 == 0) {
      this.batches.push(this.db.batch());
    }
    this.batches[this.batches.length - 1].update(ref, data);
    this.counter++;
  }

  /**
   * add create to batch. automatically create a batch if the latest one is full.
   * @param {DocumentReference} ref reference instance
   * @param {Object} data data to create
   */
  addCreate(ref, data) {
    if (this.counter % 500 == 0) {
      this.batches.push(this.db.batch());
    }
    this.batches[this.batches.length - 1].create(ref, data);
    this.counter++;
  }

  /**
   * add set to batch. automatically create a batch if the latest one is full.
   * @param {DocumentReference} ref reference instance
   * @param {Object} data data to set
   */
  addSet(ref, data) {
    if (this.counter % 500 == 0) {
      this.batches.push(this.db.batch());
    }
    this.batches[this.batches.length - 1].set(ref, data);
    this.counter++;
  }

  /**
   * add delete to batch. automatically create a batch if the latest one is full.
   * @param {DocumentReference} ref reference instance
   */
  addDelete(ref) {
    if (this.counter % 500 == 0) {
      this.batches.push(this.db.batch());
    }
    this.batches[this.batches.length - 1].delete(ref);
    this.counter++;
  }

  /**
   * commit all batches
   * @return {Promise<void>}
   */
  commitAll() {
    if (this.batches.length > 0) {
      return Promise.all(this.batches.map((batch) => batch.commit()));
    } else {
      return Promise.resolve(true);
    }
  }
}

exports.BatchHandler = BatchHandler;
