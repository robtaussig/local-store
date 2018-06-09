class LocalStore {
  constructor(indexedDB, DB_VERSION = 1) {
    this.db = indexedDB;
    this.DB_VERSION = DB_VERSION;
    this.openedDb;
  }

  createMigrations(schema) {
    const {
      tables,
      objects
    } = schema;
    const open = this.db.open('LocalStore', this.DB_VERSION);
    let createdTables, createdObjects;

    return new Promise((resolve, reject) => {

      open.onupgradeneeded = () => {
        const db = open.result;

        Promise.all(tables.map(table => this.createTable(table, db)))
          .then(results => {
            createdTables = results;
          })
          .catch(err => reject(err));
      };

      open.onsuccess = () => {
        const db = open.result;

        Promise.all((objects || []).map(object => this.insert(object, db)))
          .then(results => {
            createdObjects = results;
            db.close();

            resolve({
              createdTables,
              createdObjects
            });
          })
          .catch(error => {
            console.log('error in migrations: ', error);
            reject(error);
          });
      }
    });
  }

  init() {
    if (this.openedDb) return Promise.resolve(this.openedDb);

    return new Promise(resolve => {
      const openRequest = this.db.open('LocalStore', this.DB_VERSION);

      openRequest.onsuccess = () => {
        this.openedDb = openRequest.result;
        resolve(this.openedDb);
      };
    });
  }

  createIndex(store, index) {

    return new Promise(resolve => {
      const createdIndex = store.createIndex(index.key, index.key);

      resolve(createdIndex);
    });
  }

  createTable(tableToCreate, db) {
    const {
      name,
      primaryKey,
      indexes
    } = tableToCreate;

    return new Promise(resolve => {
      const store = db.createObjectStore(name, {
        keyPath: primaryKey
      });

      return Promise.all((indexes || []).map(index => this.createIndex(store, index)))
        .then(() => {
          return resolve(store);
        });
    });
  }

  insert(objectToInsert, db) {
    const {
      object,
      table
    } = objectToInsert;

    return db ? Promise.resolve(db) : this.init()
      .then(currentDb => {

        return new Promise(resolve => {
          const transaction = currentDb.transaction(table, 'readwrite');
          const store = transaction.objectStore(table);
          const putObject = store.put(object);

          transaction.oncomplete = () => {

            return resolve(putObject);
          }
        });
      });
  }

  select(query, primaryKey) {
    const {
      table,
      where
    } = query;

    let getObject;

    return this.init()
      .then(db => {

        return new Promise(resolve => {
          const transaction = db.transaction(table, 'readonly');
          const store = transaction.objectStore(table);

          if (primaryKey) {
            getObject = store.get(primaryKey);
          } else {
            const queryIndex = Object.keys(where)[0];
            const queryValue = where[queryIndex];
            const index = store.index(queryIndex);
            getObject = index.get(queryValue);
          }

          getObject.onsuccess = () => {

            resolve({
              result: getObject.result,
              transaction: getObject.transaction,
            });
          };
        });
      })
  }

  demo() {
    this.createMigrations({
      tables: [{
          name: 'cars',
          primaryKey: 'licensePlate',
          indexes: [{
            name: 'Owner Email',
            key: 'ownerEmail',
          }]
        },
        {
          name: 'people',
          primaryKey: 'email',
        },
      ],
      objects: [{
          table: 'cars',
          object: {
            licensePlate: '12345',
            ownerEmail: 'robert.taussig@gmail.com',
            color: 'blue',
          },
        },
        {
          table: 'people',
          object: {
            email: 'robert.taussig@gmail.com',
          },
        },
      ],
    })
  }
}

module.exports = (config = {}) => {
  let localStore;

  (() => {
    const indexedDB = window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB ||
      window.shimIndexedDB;

    if (config.global !== false) {
      window.LocalStore = new LocalStore(indexedDB);
    } else {
      localStore = new LocalStore(indexedDB);
    }
  })();
  return localStore;
};