# LocalStoreJS

## Getting Started

```
yarn add @robtaussig/local-store-js

#entry.js

// Return instance of LocalStore
const LocalStore = require('@robtaussig/local-store-js')({ global: false });

// Access through window.LocalStore
require('@robtaussig/local-store-js');
```

## Tutorial

### Include it without the global: false config, so that you can access it from devtools
```
window.LocalStore.demo();

// You can inspect the database schema in devtools -> Application -> IndexedDB -> LocalStore

window.LocalStore.insert({
  table: 'cars',
  object: {
    licensePlate: '43435',
    ownerEmail: 'abc@gmail.com',
    color: 'blue',
  }
});

// Search by indexed key
window.LocalStore.select({
  table: 'cars',
  where: {
    ownerEmail: 'abc@gmail.com',
  }
})
  .then(res => console.log(res));

// Search by primary key
window.LocalStore.select({
  table: 'cars'
}, '43435')
  .then(res => console.log(res));

```

#### Important: You can only search for keys in the where clause that have been indexed. For primary keys you do not need to use the where clause, but instead use the primary key as the second argument

## Creating Database

```
// Every time you make a change to the database schema, you must increment the database version (using integers only)
const DATABASE_VERSION = 1;
// You can seed data here as well
const DATABASE_SCHEMA = {
  tables: [
    {
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
  // Seed data below
  objects: [
    {
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
};

window.LocalStore.createMigrations(DATABASE_SCHEMA, DATABASE_VERSION);
```

## Interface

### Migration
- tables: Array\<Table\>
- objects: [Array\<Object\>]

### Table

- name: String
- primaryKey: String
- indexes: [Array\<Index\>]

### Index

- name: [String]
- key: String

### Object

table: String
object: Object

### Query

- table: String
- where: [WhereQuery]

### WhereQuery

- key: value
