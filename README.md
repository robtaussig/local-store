Schema
------

{
  tables: Array<Table>,
  objects: Array<Object>,
}

Table
-----

{
  name: string,
  primaryKey: string,
  indexes: Array<Index>,
}

Index
-----

{
  name: string,
  key: string,
}

Object
------

{
  table: string,
  object: object,
}

Query
-----

{
  table: string,
  where: WhereQuery,
}

WhereQuery
----------

{
  [key]: any,
}
