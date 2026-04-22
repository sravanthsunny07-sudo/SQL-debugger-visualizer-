import Database from "better-sqlite3";

const database = new Database(":memory:");

function initializeDatabase() {
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

initializeDatabase();

export default database;
