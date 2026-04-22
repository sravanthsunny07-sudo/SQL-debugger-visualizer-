import Database from "better-sqlite3";

function seedDatabase(database) {
  database.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL
    );

    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      product TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  const insertUser = database.prepare(
    "INSERT INTO users (id, name, age) VALUES (@id, @name, @age)"
  );
  const insertOrder = database.prepare(
    "INSERT INTO orders (id, user_id, product) VALUES (@id, @user_id, @product)"
  );

  const seed = database.transaction(() => {
    const users = [
      { id: 1, name: "Ava", age: 24 },
      { id: 2, name: "Noah", age: 31 },
      { id: 3, name: "Mia", age: 27 },
      { id: 4, name: "Liam", age: 35 },
      { id: 5, name: "Zara", age: 29 }
    ];

    const orders = [
      { id: 1, user_id: 1, product: "Keyboard" },
      { id: 2, user_id: 2, product: "Monitor" },
      { id: 3, user_id: 3, product: "Mouse" },
      { id: 4, user_id: 4, product: "Laptop Stand" },
      { id: 5, user_id: 5, product: "USB Hub" }
    ];

    for (const user of users) {
      insertUser.run(user);
    }

    for (const order of orders) {
      insertOrder.run(order);
    }
  });

  seed();
}

function createInMemoryDatabase({ seed = false } = {}) {
  const database = new Database(":memory:");

  if (seed) {
    seedDatabase(database);
  }

  return database;
}

class DatabaseManager {
  constructor() {
    this.databases = {
      default: createInMemoryDatabase({ seed: true })
    };
    this.currentDB = "default";
  }

  hasDatabase(name) {
    return Boolean(this.databases[name]);
  }

  createDatabase(name) {
    if (this.hasDatabase(name)) {
      return {
        created: false,
        name
      };
    }

    this.databases[name] = createInMemoryDatabase();

    return {
      created: true,
      name
    };
  }

  useDatabase(name) {
    if (!this.hasDatabase(name)) {
      throw new Error(`Unknown database '${name}'`);
    }

    this.currentDB = name;
    return this.databases[name];
  }

  getCurrentDatabase() {
    if (!this.currentDB || !this.databases[this.currentDB]) {
      throw new Error("No database selected");
    }

    return this.databases[this.currentDB];
  }

  getCurrentDatabaseName() {
    return this.currentDB;
  }

  listDatabases() {
    return Object.keys(this.databases).map((name) => ({ Database: name }));
  }
}

const databaseManager = new DatabaseManager();

export default databaseManager;
